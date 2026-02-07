"use client";

import { useEffect, useState } from 'react';
import type { Message } from "@/app/types/chat";
import { StreamingIndicator } from "@/app/components/StreamingIndicator/StreamingIndicator";

type MessageBubbleProps = {
  message: Message;
};

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    // Format time on client side only
    setFormattedTime(
      new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    );
  }, [message.createdAt]);

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl border px-4 py-3 shadow-card ${
          isUser
            ? "border-blue-500/20 bg-blue-500 text-white"
            : "border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
        }`}
      >
        <div className="whitespace-pre-wrap text-sm leading-relaxed">
          {message.content || (message.isStreaming ? "" : "")}
        </div>
        {message.isStreaming && (
          <div className="mt-2 flex items-center gap-2 text-xs text-slate-200">
            <StreamingIndicator compact />
            Thinking...
          </div>
        )}
        <div
          className={`mt-3 text-[11px] uppercase tracking-wide ${
            isUser ? "text-blue-100" : "text-slate-400"
          }`}
        >
          {formattedTime}
        </div>
      </div>
    </div>
  );
};
