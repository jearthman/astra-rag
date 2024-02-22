"use client";

import { useRef, useState } from "react";
import ArrowUpTrayIcon from "./icons/arrow-up-tray";

type DragAndDropProps = {
  processFile: (file: File) => void;
  disabled?: boolean;
};

export default function DragAndDrop({
  disabled = false,
  processFile,
}: DragAndDropProps) {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleDragEnterAndOver(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }

  function handleDragLeave(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }

  function passFileFromInput(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    if (!e.target.files) {
      return;
    }

    processFile(e.target.files[0]);
  }

  function passFileFromForm(e: React.DragEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (!e.dataTransfer?.files) {
      return;
    }

    processFile(e.dataTransfer.files[0]);
  }

  return (
    <>
      <form className="flex gap-2 sm:hidden">
        <input
          name="file"
          ref={inputFileRef}
          type="file"
          hidden
          onChange={passFileFromInput}
        />
        <button
          className="mt-4 flex rounded-md bg-stone-600 px-2.5 py-2 text-stone-200 shadow-sm transition hover:bg-stone-500 hover:shadow-md active:bg-stone-700 active:shadow-inner disabled:opacity-30 disabled:hover:bg-stone-700"
          onClick={(e) => {
            e.preventDefault();
            inputFileRef.current?.click();
          }}
          type="submit"
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="mr-1 h-6 w-6 animate-bounce-up"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
            />
          </svg>
          Upload
        </button>
      </form>

      <form
        className={`mt-4 hidden flex-col gap-2 rounded-md border-2 border-dashed border-purple-600 border-opacity-50 px-12 py-8 transition sm:flex ${
          dragActive
            ? "border-opacity-100 bg-stone-300 shadow-md"
            : "border-opacity-50"
        }`}
        onDragEnter={handleDragEnterAndOver}
        onDragOver={handleDragEnterAndOver}
        onDragLeave={handleDragLeave}
        onDrop={passFileFromForm}
      >
        <ArrowUpTrayIcon className="h-12 w-12 animate-bounce-up self-center text-purple-600" />
        <div className="text-center text-stone-800">Drag your file here</div>
        <div className="text-center text-stone-800">or</div>
        <input
          name="file"
          ref={inputFileRef}
          type="file"
          hidden
          onChange={passFileFromInput}
        />
        <button
          className="mt-2 flex self-center rounded-md bg-stone-700 px-2.5 py-2 text-stone-300 shadow-sm transition hover:bg-stone-600 hover:shadow-md active:bg-stone-700 active:shadow-inner disabled:opacity-30 disabled:hover:bg-stone-700"
          onClick={(e) => {
            e.preventDefault();
            inputFileRef.current?.click();
          }}
          type="submit"
          disabled={disabled}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="mr-1 h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15"
            />
          </svg>
          Upload
        </button>
      </form>
    </>
  );
}
