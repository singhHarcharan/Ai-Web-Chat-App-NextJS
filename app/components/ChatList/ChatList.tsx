"use client";

import type { Chat } from "@/app/types/chat";
import { ChatItem } from '../ChatItem/ChatItem';

type ChatListProps = {
  chats: Chat[];
  activeChatId: string;
  onSelect: (chatId: string) => void;
  onCreate: () => void;
  onRename: (chatId: string, newTitle: string) => void;
  onDelete: (chatId: string) => void;
  collapsed?: boolean;
};

export const ChatList = ({
  chats,
  activeChatId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  collapsed = false
}: ChatListProps) => {
  return (
    <div className="flex h-full flex-col">
      {!collapsed && (
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Chats</p>
          <button
            type="button"
            onClick={onCreate}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            New Chat
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-2">
        {chats.length > 0 ? (
          <div className="space-y-2">
            {chats.map((chat) => (
              <ChatItem
                key={chat.id}
                chat={chat}
                isActive={chat.id === activeChatId}
                collapsed={collapsed}
                onSelect={onSelect}
                onRename={onRename}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : !collapsed ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
            <svg
              className="mx-auto h-12 w-12 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 01-6 2.292m0-14.25v14.25"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-white">No chats yet</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Get started by creating a new chat
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={onCreate}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <svg
                  className="-ml-0.5 mr-1.5 h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                New Chat
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {collapsed && (
        <div className="border-t border-slate-200 p-2 dark:border-slate-800">
          <button
            type="button"
            onClick={onCreate}
            className="flex w-full items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="New chat"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
