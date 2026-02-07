// app/components/WorkspaceSelector/WorkspaceSelector.tsx
"use client";

import { useState } from "react";
import type { Workspace } from "@/app/types/chat";

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelect: (workspaceId: string) => void;
  onCreate: (name: string) => Promise<void> | void;
  onDelete: (workspaceId: string) => void;
  isMutating?: boolean;
  isLoading?: boolean;
}

export function WorkspaceSelector({
  workspaces,
  activeWorkspaceId,
  onSelect,
  onCreate,
  onDelete,
  isMutating = false,
  isLoading = false,
}: WorkspaceSelectorProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (workspaceName.trim()) {
      setIsSubmitting(true);
      try {
        await onCreate(workspaceName);
      } finally {
        setIsSubmitting(false);
      }
      setWorkspaceName("");
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspaces</h3>
        <button
          onClick={() => setIsCreating((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white shadow-card transition hover:bg-slate-800"
          disabled={isSubmitting || isMutating}
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M10 4v12M4 10h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          New
        </button>
      </div>

      {isCreating && (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-card dark:border-slate-800 dark:bg-slate-950">
          <label className="text-xs font-medium text-slate-500">Workspace name</label>
          <input
            type="text"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="e.g. Growth Experiments"
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            disabled={isSubmitting || isMutating}
          />
          <div className="mt-3 flex items-center justify-between">
            <button
              onClick={() => {
                setIsCreating(false);
                setWorkspaceName("");
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
              disabled={isSubmitting || isMutating}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-card hover:from-blue-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || isMutating}
            >
              {isSubmitting && (
                <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 20 20" fill="none">
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    opacity="0.2"
                  />
                  <path
                    d="M18 10a8 8 0 0 0-8-8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              {isSubmitting ? "Creating..." : "Create workspace"}
            </button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {isLoading ? (
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-800">
            Loading workspaces...
          </div>
        ) : (
        workspaces.map((workspace) => {
          const isActive = activeWorkspaceId === workspace.id;
          return (
            <div
              key={workspace.id}
              className={`group flex items-center justify-between rounded-lg px-3 py-2 transition ${
                isActive
                  ? "border border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100"
                  : "border border-transparent text-slate-600 hover:border-slate-200 hover:bg-white dark:text-slate-300 dark:hover:border-slate-800 dark:hover:bg-slate-950"
              }`}
            >
              <button
                onClick={() => onSelect(workspace.id)}
                className="flex-1 text-left text-sm font-medium"
              >
                {workspace.name}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(workspace.id);
                }}
                className="invisible rounded-md px-1.5 py-1 text-slate-400 hover:text-rose-500 group-hover:visible disabled:cursor-not-allowed disabled:opacity-50"
                title="Delete workspace"
                disabled={isMutating}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M7.5 4h5m-7 2h9m-1 0-.6 9a1 1 0 0 1-1 .9H7.1a1 1 0 0 1-1-.9L5.5 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          );
        }))}
      </div>
    </div>
  );
}
