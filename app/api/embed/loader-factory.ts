import { WebPDFLoader } from "langchain/document_loaders/web/pdf";
import { CSVLoader } from "langchain/document_loaders/fs/csv";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { DocxLoader } from "langchain/document_loaders/fs/docx";

export default async function LoaderFactory(file: Blob) {
  const fileType = file.type;
  switch (fileType) {
    case "application/pdf":
      return new WebPDFLoader(file);
    case "text/plain":
      return new TextLoader(file);
    case "text/csv":
      return new CSVLoader(file);
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return new DocxLoader(file);
    default:
      throw new Error("Unsupported file type");
  }
}
