"use client";

import type { Workspace } from "@/app/types/chat";

type WorkspaceSelectorProps = {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelect: (workspaceId: string) => void;
};

export const WorkspaceSelector = ({
  workspaces,
  activeWorkspaceId,
  onSelect
}: WorkspaceSelectorProps) => {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspaces</p>
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
