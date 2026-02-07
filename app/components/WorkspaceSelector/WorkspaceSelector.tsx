"use client";

import type { Workspace } from "@/app/types/chat";

type WorkspaceSelectorProps = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelect: (workspaceId: string) => void;
  onCreate: () => void;
  onDelete: (workspaceId: string) => void;
};

export const WorkspaceSelector = ({
  workspaces,
  activeWorkspaceId,
  onSelect,
  onCreate,
  onDelete
}: WorkspaceSelectorProps) => {
  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspaces</p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCreate}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            New
          </button>
          <button
            type="button"
            disabled={!activeWorkspace || workspaces.length <= 1}
            onClick={() => activeWorkspace && onDelete(activeWorkspace.id)}
            className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-rose-300 dark:hover:bg-rose-500/10"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-card dark:border-slate-800 dark:bg-slate-950">
        <select
          value={activeWorkspaceId}
          onChange={(event) => onSelect(event.target.value)}
          className="w-full bg-transparent text-sm font-medium text-slate-800 outline-none dark:text-slate-100"
        >
          {workspaces.map((workspace) => (
            <option key={workspace.id} value={workspace.id}>
              {workspace.name}
            </option>
          ))}
        </select>
      </div>
      <p className="text-xs text-slate-500">Switch projects or organize chats by workspace.</p>
    </div>
  );
};
