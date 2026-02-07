"use client";

import { useState } from "react";
import { useChat } from "@/app/context/ChatContext";

export const ChatInput = () => {
  const { sendMessage, isStreaming } = useChat();
  const [value, setValue] = useState("");

  const handleSend = () => {
    if (!value.trim() || isStreaming) return;
    sendMessage(value);
    setValue("");
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 border-t border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-card dark:border-slate-800 dark:bg-slate-900">
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
            disabled={isStreaming}
            placeholder={isStreaming ? "AI is responding..." : "Ask anything. Shift+Enter for a new line."}
            className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100"
          />
        </div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isStreaming}
          className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-soft transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          <span className="sr-only">Send</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4 10H14M14 10L10 6M14 10L10 14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
