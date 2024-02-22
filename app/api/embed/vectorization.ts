import LoaderFactory from "./loader-factory";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { AstraDB } from "@datastax/astra-db-ts";
import { OpenAIEmbeddings } from "@langchain/openai";

const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT } = process.env;

/* 
DEV NOTE:
Having this type included in the docs explicitley would be a small DevEx improvement.
Types associated with the API are useful for providing upfront in cases where the 
dev needs to do some pre/post-processing or error handling.
*/
type AstraDoc = {
  fileId: string;
  text: string;
  $vector: number[];
};

export default async function vectorizeFile(file: Blob, fileId: string) {
  try {
    // Load the file based on its type.
    const loader = await LoaderFactory(file);
    console.log("Loading returned: ", typeof loader);

    // Load the file into a document.
    const docs = await loader.load();
    console.log("Docs loaded: ", docs.length);

    // Split the document into smaller chunks.
    const splitter = new RecursiveCharacterTextSplitter();
    const splitDocs = await splitter.splitDocuments(docs);
    console.log("Docs split: ", splitDocs.length);
    const splitStrings = splitDocs.map((doc) => doc.pageContent);

    // Embed the split strings.
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
      maxConcurrency: 10,
      // verbose: true,
    });
    console.log("Starting Embedding");
    const documentEmbeddings = await embeddings.embedDocuments(splitStrings);

    // Create Astra documents for insert.
    const astraDocs: AstraDoc[] = splitStrings.map((splitString, index) => ({
      fileId: fileId,
      text: splitString,
      $vector: documentEmbeddings[index],
    }));

    console.log("Inserting into Astra");
    const db = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT);
    const collection = await db.collection("interview_cosine_3072");

    // Insert the Astra documents in batches.
    /*
      DEV NOTE:
      The main pain point I identified with Astra-TS is the batch processing and rate limits. 
      Calculating operations and rate limits is a bit tricky. And despite seemingly being under rate limits with test files
      with batches of 100 vectors I still would get 413 errors. Eventually I got an error message back from Astra recommending
      batches of 20. However, I encountered ECONNRESET errors with batches of 20 and sending many
      (~300-500 batches, still under operations limits according to docs) insertMany promises at once.

      If I were to update insertMany I would design it to be a 'high-level' API call that handles batching and rate limits
      with metadata from the collection. This could include simple retry logic with timeouts based on Astra ratelimits and backoff strategies paired with 
      more succint error messages.

      I would also appreciate more Vectorization API operations to return progress of some sort through streaming (JS Generators) or other means so that progress
      could be sent to the front-end. This would be useful for large files and long processing times.

      I have an example of this using a promise completion counter and streaming SSE with my Pinecone implementation @https://github.com/jearthman/ragette/blob/loading_gen/app/api/embed/vectorization.ts#L72-L85
    */
    const batches = chunkArray(astraDocs, 20);
    const batchesReq = batches.map((batch) => {
      return collection.insertMany(batch);
    });
    const res = await Promise.all(batchesReq);

    console.log("Inserted: ", res);

    return "DOCUMENT_STORED";
  } catch (error) {
    throw error;
  }
}

/**
 * Chunk an array into smaller arrays of a specified size.
 *
 * @param arr - The array to be chunked.
 * @param chunkSize - The size of each chunk.
 * @returns An array of smaller arrays, each containing elements from the original array.
 */
function chunkArray(arr: AstraDoc[], chunkSize: number): AstraDoc[][] {
  return arr.reduce((chunks: AstraDoc[][], elem, index) => {
    // Calculate the index of the chunk that the current element should be placed in.
    const chunkIndex = Math.floor(index / chunkSize);
    // Create the chunk if it doesn't exist.
    if (!chunks[chunkIndex]) {
      chunks[chunkIndex] = [];
    }
    // Add the element to the chunk.
    chunks[chunkIndex].push(elem);
    return chunks;
  }, []);
}
