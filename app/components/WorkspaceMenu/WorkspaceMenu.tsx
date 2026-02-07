'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@/app/context/ChatContext';

type WorkspaceMenuProps = {
  onRename: () => void;
  onDelete: () => void;
  onCreateNew: () => void;
};

export const WorkspaceMenu = ({ onRename, onDelete, onCreateNew }: WorkspaceMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { state } = useChat();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        aria-label="Workspace options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-slate-800">
          <button
            onClick={() => {
              onCreateNew();
              setIsOpen(false);
            }}
            className="flex w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            New Workspace
          </button>
          <button
            onClick={() => {
              onRename();
              setIsOpen(false);
            }}
            disabled={!state.activeWorkspaceId}
            className="flex w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Rename Workspace
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            disabled={!state.activeWorkspaceId || state.workspaces.length <= 1}
            className="flex w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-900/30"
          >
            Delete Workspace
          </button>
        </div>
      )}
    </div>
  );
};
