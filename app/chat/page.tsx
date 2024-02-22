"use client";

import { useSearchParams } from "next/navigation";
import { useChat } from "ai/react";
import { Suspense, useEffect, useRef } from "react";
import Markdown from "react-markdown";
import SpinnerIcon from "../../components/icons/spinner";
import SendIcon from "@/components/icons/send";

function ChatPage() {
  const searchParams = useSearchParams();
  const fileId = searchParams.get("fileId");

  const { messages, isLoading, input, handleInputChange, handleSubmit } =
    useChat();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    console.log(messages);
  }, [messages]);

  return (
    <main className="md:1/2 mx-auto flex h-screen w-full flex-col pb-2 lg:w-1/3">
      <div className="absolute z-10 h-12 w-full bg-gradient-to-b from-stone-200 to-transparent md:h-24 md:w-1/3" />
      <div className="flex flex-grow flex-col overflow-auto rounded-lg px-2 text-sm md:text-base">
        {messages.length === 0 && (
          <div className="m-auto w-2/3 animate-fade-in-half text-center text-lg text-stone-800 opacity-50">
            Please ask this <span className="text-purple-600">Astra</span>{" "}
            chatbot anything about your file.
          </div>
        )}
        {messages.map((message) => {
          return (
            <>
              <div
                key={message.id}
                className={`flex p-2 first:mt-12 first:md:mt-24 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-lg px-2.5 py-2 ${
                    message.role === "user"
                      ? "bg-neutral-300 text-neutral-800 shadow-md"
                      : "border border-stone-400 bg-stone-300 text-stone-800 shadow-md"
                  }`}
                >
                  <div
                    className={`mb-0.5 text-[10px] text-purple-600 ${
                      message.role === "user" ? "text-right" : "text-left"
                    } `}
                  >
                    {message.role === "user" ? "You" : "Astra Chatbot"}
                  </div>
                  <Markdown>{message.content}</Markdown>
                </div>
              </div>
            </>
          );
        })}
        {isLoading && messages[messages.length - 1].role === "user" && (
          <div className="flex p-2">
            <div className="rounded-lg border border-stone-400 bg-stone-300 px-2.5 py-2 text-stone-800 shadow-md">
              <div className="mb-0.5 text-right text-[10px] text-purple-600">
                Ragette
              </div>
              <SpinnerIcon />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={(e) => handleSubmit(e, { options: { body: { fileId } } })}
        className="mx-2 flex rounded-lg bg-stone-300 shadow-sm text-stone-800 ring-transparent focus-within:ring-1 focus-within:ring-stone-400"
      >
        <input
          ref={inputRef}
          className="w-full bg-transparent px-5 py-3 focus:outline-none"
          placeholder="Message Astra RAG chatbot..."
          onChange={handleInputChange}
          value={input}
        />
        <button
          type="submit"
          className="rounded-md bg-transparent p-2 pr-3 transition-colors ease-in-out hover:text-stone-400"
        >
          <SendIcon />
        </button>
      </form>
    </main>
  );
}

export default function Chat() {
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}
