"use client";

import { useChat } from "@/app/context/ChatContext";
import { MessageBubble } from "@/app/components/MessageBubble/MessageBubble";
import { ChatInput } from "@/app/components/ChatInput/ChatInput";
import { StreamingIndicator } from "@/app/components/StreamingIndicator/StreamingIndicator";

export const ChatWindow = () => {
  const { activeWorkspace, activeChat, isStreaming, toggleSidebar } = useChat();

  if (!activeWorkspace || !activeChat) {
    return (
      <section className="flex h-full flex-1 flex-col items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Select a workspace to begin.</p>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-slate-500">{activeWorkspace.name}</p>
          <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {activeChat.title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSidebar}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Toggle Sidebar
          </button>
          <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500 dark:border-slate-800">
            {activeChat.messages.length} messages
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 to-white px-6 py-6 dark:from-slate-950 dark:to-slate-900">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          {activeChat.messages.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-card dark:border-slate-800 dark:bg-slate-950">
              Start the conversation. Your AI assistant will stream responses here.
            </div>
          )}

          {activeChat.messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isStreaming && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <StreamingIndicator />
              Streaming response...
            </div>
          )}
        </div>
      </div>

      <ChatInput />
    </section>
  );
};
