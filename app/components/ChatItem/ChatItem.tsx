'use client';

import { useState, useRef, useEffect } from 'react';

type ChatItemProps = {
  chat: {
    id: string;
    title: string;
  };
  isActive: boolean;
  collapsed?: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
};

export const ChatItem = ({
  chat,
  isActive,
  collapsed = false,
  onSelect,
  onRename,
  onDelete,
}: ChatItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState(chat.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  const commitRename = () => {
    const trimmedTitle = newTitle.trim();
    if (trimmedTitle && trimmedTitle !== chat.title) {
      try {
        onRename(chat.id, trimmedTitle);
        setIsRenaming(false);
      } catch (error) {
        console.error('Failed to rename chat:', error);
        // Reset to original title if rename fails
        setNewTitle(chat.title);
      }
    } else {
      // If title is empty or unchanged, reset and exit rename mode
      setNewTitle(chat.title);
      setIsRenaming(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    commitRename();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === 'Escape') {
      setNewTitle(chat.title);
      setIsRenaming(false);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commitRename();
    }
  };

  if (collapsed) {
    return (
      <button
        onClick={() => onSelect(chat.id)}
        className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
          isActive
            ? 'bg-blue-100 text-blue-900 dark:bg-blue-500/20 dark:text-blue-100'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'
        }`}
      >
        {chat.title.charAt(0).toUpperCase()}
      </button>
    );
  }

  return (
    <div className="group relative">
      <div
        onClick={() => onSelect(chat.id)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (isRenaming) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect(chat.id);
          }
        }}
        className={`flex w-full items-center justify-between rounded-xl border px-3 py-3 text-left text-sm transition cursor-pointer ${
          isActive
            ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-card dark:border-blue-400 dark:bg-blue-500/10 dark:text-blue-100'
            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
        }`}
      >
        {isRenaming ? (
          <form
            onSubmit={handleSubmit}
            className="flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={commitRename}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent outline-none"
              onClick={(e) => e.stopPropagation()}
              onKeyUp={(e) => e.stopPropagation()}
            />
          </form>
        ) : (
          <span className="truncate">{chat.title}</span>
        )}
        
        {!isRenaming && (
          <div 
            className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              setIsMenuOpen(!isMenuOpen);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }
            }}
            role="button"
            tabIndex={0}
            aria-label="Chat options"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </div>
        )}
      </div>

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 z-10 mt-1 w-40 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              setNewTitle(chat.title);
              setIsRenaming(true);
              setIsMenuOpen(false);
              // Focus the input field after a small delay to ensure it's rendered
              setTimeout(() => {
                inputRef.current?.focus();
              }, 0);
            }}
            className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Rename
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this chat? This action cannot be undone.')) {
                try {
                  onDelete(chat.id);
                } catch (error) {
                  console.error('Failed to delete chat:', error);
                }
              }
              setIsMenuOpen(false);
            }}
            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>
      )}
    </div>
  );
};
