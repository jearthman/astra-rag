import { PromptTemplate } from "langchain/prompts";

export const QuestionCheckPrompt: String =
  "Determine whether the user message is either directly asking a question or indirectly suggesting the need for more information. Respond with 'yes' if the text falls into either of these categories, and 'no' if it does neither.";

export const SystemPrompt: PromptTemplate = PromptTemplate.fromTemplate(
  `You are a helpful AI that uses Retrieval Augmented Generation to answer questions.
Please use only the Markdown markup language to format your response, not plain text.
If the user asks or infers a question before any newline characters please use the provided document context appended to the message to answer.
If no context is found, say something along the lines of 'I couldn't find information about that from your document' but still try to answer their question.

START CONTEXT BLOCK
{context}
END CONTEXT BLOCK`
);
