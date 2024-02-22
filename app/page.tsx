"use client";

import { upload } from "@vercel/blob/client";
import { useRef, useState } from "react";
import SpinnerIcon from "../components/icons/spinner";
import CheckIcon from "../components/icons/check";
import { useRouter } from "next/navigation";
import ChatIcon from "../components/icons/chat";
import DragAndDrop from "../components/drag-and-drop";
import ErrorIcon from "@/components/icons/error";

export default function FileUploadPage() {
  const router = useRouter();
  const fileIdRef = useRef<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState("");
  const [fileSizeFlag, setFileSizeFlag] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [uploadStep, setUploadStep] = useState(0);
  const [wrongFileType, setWrongFileType] = useState(false);

  /**
   * Generates a random ID for astra collection name.
   *
   * @returns {string} The generated ID.
   */
  const generateID = (): string => {
    //ID for astra collection name

    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";

    let result = characters.charAt(Math.floor(Math.random() * 52));

    for (let i = 1; i < 16; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    return result;
  };

  /**
   * Processes the selected file through backend API for Vector DB.
   * @param file - The file to be processed.
   * @returns {Promise<void>} - A promise that resolves when the file processing is complete.
   */
  async function processFile(file: File) {
    setWrongFileType(false);
    setFileSizeFlag(false);
    setHasError(false);

    if (!file) {
      return;
    }

    // check file size
    if (file.size > 1000000) {
      setFileSizeFlag(true);
    }

    // truncate file name if too long and set file name and type
    let tempFileName = file.name.split(".")[0];
    if (tempFileName.length > 20) {
      tempFileName = tempFileName.slice(0, 20) + "...";
    }
    setFileName(tempFileName);
    if (
      !file.type ||
      !(
        file.type === "application/pdf" ||
        file.type === "text/plain" ||
        file.type === "text/csv"
      )
    ) {
      setWrongFileType(true);
      return;
    }
    setFileType(file.name.split(".")[1].toUpperCase());

    setUploadStep(1);

    fileIdRef.current = generateID();

    //upload file to blob storage
    const uploadResponse = await upload(file.name, file, {
      access: "public",
      handleUploadUrl: "/api/upload",
      clientPayload: fileIdRef.current,
    });

    if (uploadResponse.url) {
      setUploadStep(2);

      //send url to rag backend
      const embedResponse = await fetch("/api/embed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: uploadResponse.url,
          fileId: fileIdRef.current,
        }),
      });

      if (embedResponse.ok) {
        setUploadStep(3);
      } else {
        setHasError(true);
      }
    }
  }

  return (
    <main className="flex h-screen w-screen flex-col items-center">
      <h1 className="mt-40 text-4xl font-bold tracking-wide text-stone-800 sm:mt-40 lg:mt-96">
        Upload Your{" "}
        <span className="underline decoration-purple-600">File</span>
      </h1>
      <h3 className="text-md text-stone-700">
        Supports small .pdf, .csv, .txt files
      </h3>

      <DragAndDrop
        processFile={processFile}
        disabled={!!fileName && !wrongFileType && !hasError}
      />
      {wrongFileType && (
        <div className="mt-6 w-2/3 text-center text-sm text-red-600">
          File Type not supported currently. Please upload a .pdf, .csv, or .txt
          file.
        </div>
      )}
      {!!uploadStep && (
        <>
          <div className="flex w-72 flex-col">
            <div className="mb-4 mt-12 flex animate-fade-in items-center gap-2 self-center text-stone-800">
              <div className="font-semibold">{fileName}</div>
              <div className="rounded-full border border-purple-500 bg-purple-600 px-1 py-0.5 text-xs font-bold text-purple-200">
                {fileType}
              </div>
            </div>

            <div className="flex animate-fade-in items-center pl-6">
              <div
                className={`mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-stone-300`}
              >
                {uploadStep === 1 && <SpinnerIcon />}
                {uploadStep >= 2 && <CheckIcon />}
              </div>
              <div className="text-stone-800">Uploading to Blob Storage</div>
            </div>

            {uploadStep >= 2 && (
              <div className="animate-fade-in-from-below pl-6">
                <div className="my-1 ml-3 h-3 w-1 rounded-full bg-stone-300 opacity-70"></div>
                <div className="flex items-center">
                  <div className="mr-2 flex h-7 w-7 items-center justify-center rounded-full bg-stone-300">
                    {hasError ? (
                      <ErrorIcon />
                    ) : uploadStep === 2 ? (
                      <SpinnerIcon />
                    ) : uploadStep === 3 ? (
                      <CheckIcon />
                    ) : null}
                  </div>
                  <div className="text-stone-800">Embedding for Vector DB</div>
                </div>
                {fileSizeFlag && uploadStep < 3 && (
                  <div className="pt-2 text-xs text-purple-600 opacity-50">
                    This may take a few minutes for larger files.
                  </div>
                )}
              </div>
            )}
          </div>
          {uploadStep === 3 && (
            <button
              onClick={() => router.push(`/chat?fileId=${fileIdRef.current}`)}
              className="mt-4 flex animate-fade-in gap-2 rounded-md border border-emerald-600 bg-emerald-500 px-2.5 py-2 text-emerald-100 shadow-sm transition hover:bg-emerald-400 hover:shadow-md active:bg-emerald-600 active:shadow-inner disabled:opacity-30 disabled:hover:bg-emerald-600 hover:text-white"
            >
              <ChatIcon />
              Start Chat
            </button>
          )}
          {hasError && (
            <div className="mt-4 text-red-600">
              Something went wrong while inserting the file. Please try a
              different file if this error persists.
            </div>
          )}
        </>
      )}
    </main>
  );
}
