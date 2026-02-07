"use client";

import { useChat } from "@/app/context/ChatContext";
import { WorkspaceSelector } from "@/app/components/WorkspaceSelector/WorkspaceSelector";
import { ChatList } from "@/app/components/ChatList/ChatList";

export const Sidebar = () => {
  const {
    state,
    selectWorkspace,
    selectChat,
    createChat,
    renameChat,
    deleteChat,
    createWorkspace,
    deleteWorkspace,
    toggleSidebar,
    isMutating
  } = useChat();
  const activeWorkspace = state.workspaces.find(
    (workspace) => workspace.id === state.activeWorkspaceId
  );

  return (
    <aside
      className={`flex h-auto flex-col border-b border-slate-200 bg-white/80 backdrop-blur transition-all duration-200 dark:border-slate-800 dark:bg-slate-950/80 md:h-full md:border-b-0 md:border-r ${
        state.sidebarCollapsed ? "md:w-20" : "md:w-72"
      } w-full`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className={`flex items-center gap-2 ${state.sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-slate-900 to-slate-700" />
          {!state.sidebarCollapsed && (
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Workspace</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Navigator</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
          aria-label="Toggle sidebar"
        >
          {state.sidebarCollapsed ? ">" : "<"}
        </button>
      </div>

      {!state.sidebarCollapsed && (
        <div className="px-4 py-4">
          <WorkspaceSelector
            workspaces={state.workspaces}
            activeWorkspaceId={state.activeWorkspaceId}
            onSelect={selectWorkspace}
            onCreate={createWorkspace}
            onDelete={(workspaceId) => {
              const confirmed = window.confirm("Delete this workspace? This cannot be undone.");
              if (confirmed) deleteWorkspace(workspaceId);
            }}
            isMutating={isMutating}
          />
        </div>
      )}

      <div className={`flex-1 overflow-y-auto px-4 pb-6 ${state.sidebarCollapsed ? "pt-4" : ""}`}>
        <ChatList
          chats={activeWorkspace?.chats ?? []}
          activeChatId={state.activeChatId}
          onSelect={selectChat}
          onCreate={createChat}
          onRename={renameChat}
          onDelete={deleteChat}
          collapsed={state.sidebarCollapsed}
          isMutating={isMutating}
        />
      </div>
    </aside>
  );
};
