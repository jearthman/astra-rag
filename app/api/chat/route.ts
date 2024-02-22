import OpenAI from "openai";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { AstraDB } from "@datastax/astra-db-ts";
import { OpenAIEmbeddings } from "@langchain/openai";
import { QuestionCheckPrompt, SystemPrompt } from "./prompt-templates";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const { ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT } = process.env;
const db = new AstraDB(ASTRA_DB_APPLICATION_TOKEN, ASTRA_DB_API_ENDPOINT);

/**
 * Handles the POST request for the chat route.
 *
 * @param req - The request object.
 * @returns A streaming text response.
 */
export async function POST(req: Request) {
  console.log("POST function called");

  // get message and fileId from request
  const { messages, fileId } = await req.json();
  console.log(
    `Received messages: ${JSON.stringify(messages)}, fileId: ${fileId}`
  );

  // get last user message
  const lastUserMessage = messages[messages.length - 1];

  // Check if the user asked or infered a question before retrieval augmented generation.
  const questionCheckSystemMessage = {
    role: "system",
    content: QuestionCheckPrompt,
  };
  const questionCheckRes = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    stream: false,
    messages: [questionCheckSystemMessage, lastUserMessage],
  });

  let context = "";

  if (
    questionCheckRes.choices.pop()?.message.content?.toLowerCase() === "yes"
  ) {
    // embed the user query
    const embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-large",
    });
    const embeddedQuery = await embeddings.embedQuery(lastUserMessage.content);
    console.log(`Embedded query: ${embeddedQuery}`);

    const options = {
      sort: {
        $vector: embeddedQuery,
      },
      limit: 5,
    };

    // filter by fileId
    const metadataFilter = { fileId: fileId };

    // query the database using the vector and fileId
    const collection = await db.collection("interview_cosine_3072");
    console.log(`Collection: ${JSON.stringify(collection)}`);
    /*
      DEV NOTE:
      The shape of the parameter data could make a little more sense for find().
      Seeing as though the vector is the main thing being used to filter the data, it would make sense to have it as the first parameter.
      Then a type or plain options object could be provided in the documentation for secondary options like limit and filters.

      Also, the step of converting the cursor to an array could be abstracted away in the library.
    */
    const cursor = await collection.find(metadataFilter, options);
    console.log(`Cursor: ${JSON.stringify(cursor)}`);
    const retrievedDocs = await cursor.toArray();
    console.log(`Retrieved documents: ${retrievedDocs}`);

    context = retrievedDocs.map((doc) => doc.text).join("\n");
  }

  // Format the system prompt with the context.
  const systemContent = await SystemPrompt.format({ context: context });
  const systemPrompt = {
    role: "system",
    content: systemContent,
  };

  const response = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    stream: true,
    messages: [systemPrompt, ...messages],
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
