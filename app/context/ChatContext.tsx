"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Chat, Message, Workspace } from "@/app/types/chat";

// Local storage keeps chat history between refreshes until a real backend is connected.
const STORAGE_KEY = "ai-chat-app-state-v1";

export type ChatState = {
  user: {
    id: string;
    name: string;
    email: string;
  };
  workspaces: Workspace[];
  activeWorkspaceId: string;
  activeChatId: string;
  sidebarCollapsed: boolean;
};

export type ChatContextValue = {
  state: ChatState;
  activeWorkspace: Workspace | undefined;
  activeChat: Chat | undefined;
  isStreaming: boolean;
  isMutating: boolean;
  isLoadingWorkspaces: boolean;
  selectWorkspace: (workspaceId: string) => void;
  selectChat: (chatId: string) => void;
  createChat: () => void;
  renameChat: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  createWorkspace: (name?: string) => void;
  deleteWorkspace: (workspaceId: string) => void;
  toggleSidebar: () => void;
  sendMessage: (content: string) => void;
};

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2, 10);
};

const nowIso = () => new Date().toISOString();

// Empty initial state when backend is the source of truth.
const createSeedState = (): ChatState => ({
  user: {
    id: "",
    name: "",
    email: ""
  },
  workspaces: [],
  activeWorkspaceId: "",
  activeChatId: "",
  sidebarCollapsed: false
});

const loadState = (): ChatState => {
  if (typeof window === "undefined") {
    return createSeedState();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createSeedState();
    return JSON.parse(raw) as ChatState;
  } catch {
    return createSeedState();
  }
};

const saveState = (state: ChatState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

type ApiWorkspace = {
  id: string;
  name: string;
  projects?: Array<{
    id: string;
    name: string;
    messages?: Array<{
      id: string;
      role: string;
      content: string;
      createdAt: string;
    }>;
  }>;
};

const mapApiWorkspace = (workspace: ApiWorkspace): Workspace => ({
  id: workspace.id,
  name: workspace.name,
  chats:
    workspace.projects?.map((project) => ({
      id: project.id,
      title: project.name,
      messages:
        project.messages?.map((message) => ({
          id: message.id,
          role: message.role === "assistant" ? "assistant" : "user",
          content: message.content,
          createdAt: message.createdAt
        })) ?? []
    })) ?? []
});

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ChatState>(() => createSeedState());
  const [isApiBacked, setIsApiBacked] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const streamTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    const loadFromApi = async () => {
      setIsLoadingWorkspaces(true);
      try {
        const response = await fetch("/api/workspaces", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as ApiWorkspace[];
        const mapped = Array.isArray(data) ? data.map(mapApiWorkspace) : [];
        setState((prev) => ({
          ...prev,
          workspaces: mapped,
          activeWorkspaceId: mapped[0]?.id ?? "",
          activeChatId: mapped[0]?.chats[0]?.id ?? ""
        }));
        setIsApiBacked(true);
      } catch (error) {
        console.error("Failed to load workspaces:", error);
      } finally {
        setIsLoadingWorkspaces(false);
      }
    };

    loadFromApi();
  }, []);

  useEffect(() => {
    if (isApiBacked) return;
    saveState(state);
  }, [state, isApiBacked]);

  useEffect(() => {
    return () => {
      if (streamTimer.current) {
        clearInterval(streamTimer.current);
      }
    };
  }, []);

  const activeWorkspace = useMemo(
    () => state.workspaces.find((workspace) => workspace.id === state.activeWorkspaceId),
    [state.activeWorkspaceId, state.workspaces]
  );

  const activeChat = useMemo(
    () => activeWorkspace?.chats.find((chat) => chat.id === state.activeChatId),
    [activeWorkspace, state.activeChatId]
  );

  const isStreaming = useMemo(
    () => activeChat?.messages.some((message) => message.isStreaming) ?? false,
    [activeChat]
  );

  const isMutating = pendingCount > 0;

  const beginMutation = () => {
    setPendingCount((count) => count + 1);
    return () => setPendingCount((count) => Math.max(0, count - 1));
  };

  const selectWorkspace = (workspaceId: string) => {
    setState((prev) => {
      const workspace = prev.workspaces.find((item) => item.id === workspaceId);
      if (!workspace) return prev;
      return {
        ...prev,
        activeWorkspaceId: workspaceId,
        activeChatId: workspace.chats[0]?.id ?? ""
      };
    });
  };

  const selectChat = (chatId: string) => {
    setState((prev) => ({ ...prev, activeChatId: chatId }));
  };

  const createChat = async () => {
    const end = beginMutation();
    const workspaceId = state.activeWorkspaceId;
    if (!workspaceId) {
      end();
      return;
    }

    if (!isApiBacked) {
      setState((prev) => {
        const newChat: Chat = {
          id: createId(),
          title: "New Conversation",
          messages: []
        };
        const workspaces = prev.workspaces.map((workspace) =>
          workspace.id === prev.activeWorkspaceId
            ? { ...workspace, chats: [newChat, ...workspace.chats] }
            : workspace
        );
        return {
          ...prev,
          workspaces,
          activeChatId: newChat.id
        };
      });
      end();
      return;
    }

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceId, name: "New Conversation" })
      });
      if (!response.ok) return;
      const project = await response.json();
      const newChat: Chat = {
        id: project.id,
        title: project.name,
        messages: []
      };
      setState((prev) => {
        const workspaces = prev.workspaces.map((workspace) =>
          workspace.id === workspaceId
            ? { ...workspace, chats: [newChat, ...workspace.chats] }
            : workspace
        );
        return { ...prev, workspaces, activeChatId: newChat.id };
      });
    } catch (error) {
      console.error("Failed to create chat:", error);
    } finally {
      end();
    }
  };

  const renameChat = async (chatId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const end = beginMutation();
    if (!isApiBacked) {
      setState((prev) => {
        const workspaces = prev.workspaces.map((workspace) => {
          if (workspace.id !== prev.activeWorkspaceId) return workspace;
          const chats = workspace.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title: trimmed } : chat
          );
          return { ...workspace, chats };
        });
        return { ...prev, workspaces };
      });
      end();
      return;
    }

    try {
      const response = await fetch(`/api/projects/${chatId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed })
      });
      if (!response.ok) return;
      setState((prev) => {
        const workspaces = prev.workspaces.map((workspace) => {
          if (workspace.id !== prev.activeWorkspaceId) return workspace;
          const chats = workspace.chats.map((chat) =>
            chat.id === chatId ? { ...chat, title: trimmed } : chat
          );
          return { ...workspace, chats };
        });
        return { ...prev, workspaces };
      });
    } catch (error) {
      console.error("Failed to rename chat:", error);
    } finally {
      end();
    }
  };

  const deleteChat = async (chatId: string) => {
    const end = beginMutation();
    if (!isApiBacked) {
      setState((prev) => {
        const workspaces = prev.workspaces.map((workspace) => {
          if (workspace.id !== prev.activeWorkspaceId) return workspace;
          const chats = workspace.chats.filter((chat) => chat.id !== chatId);
          if (chats.length > 0) return { ...workspace, chats };
          const fallbackChat: Chat = {
            id: createId(),
            title: "New Conversation",
            messages: []
          };
          return { ...workspace, chats: [fallbackChat] };
        });
        const activeWorkspace = workspaces.find((workspace) => workspace.id === prev.activeWorkspaceId);
        const nextActiveChatId =
          prev.activeChatId === chatId ? activeWorkspace?.chats[0]?.id ?? "" : prev.activeChatId;
        return { ...prev, workspaces, activeChatId: nextActiveChatId };
      });
      end();
      return;
    }

    try {
      const response = await fetch(`/api/projects/${chatId}`, { method: "DELETE" });
      if (!response.ok) return;
      setState((prev) => {
        const workspaces = prev.workspaces.map((workspace) => {
          if (workspace.id !== prev.activeWorkspaceId) return workspace;
          const chats = workspace.chats.filter((chat) => chat.id !== chatId);
          return { ...workspace, chats };
        });
        const activeWorkspace = workspaces.find((workspace) => workspace.id === prev.activeWorkspaceId);
        const nextActiveChatId =
          prev.activeChatId === chatId ? activeWorkspace?.chats[0]?.id ?? "" : prev.activeChatId;
        return { ...prev, workspaces, activeChatId: nextActiveChatId };
      });
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      end();
    }
  };

  const createWorkspace = async (name?: string) => {
    const workspaceName = name?.trim() || `Workspace ${state.workspaces.length + 1}`;
    if (!workspaceName) return;
    const end = beginMutation();

    if (!isApiBacked) {
      setState((prev) => {
        const workspaceId = createId();
        const chatId = createId();
        const newWorkspace: Workspace = {
          id: workspaceId,
          name: workspaceName,
          chats: [
            {
              id: chatId,
              title: "New Chat",
              messages: []
            }
          ]
        };
        return {
          ...prev,
          workspaces: [newWorkspace, ...prev.workspaces],
          activeWorkspaceId: workspaceId,
          activeChatId: chatId
        };
      });
      end();
      return;
    }

    try {
      const response = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: workspaceName })
      });
      if (!response.ok) return;
      const workspace = await response.json();
      const mapped: Workspace = {
        id: workspace.id,
        name: workspace.name,
        chats: []
      };
      setState((prev) => ({
        ...prev,
        workspaces: [mapped, ...prev.workspaces],
        activeWorkspaceId: mapped.id,
        activeChatId: ""
      }));
    } catch (error) {
      console.error("Failed to create workspace:", error);
    } finally {
      end();
    }
  };

  const deleteWorkspace = async (workspaceId: string) => {
    const end = beginMutation();
    if (!isApiBacked) {
      setState((prev) => {
        const remaining = prev.workspaces.filter((workspace) => workspace.id !== workspaceId);
        if (remaining.length === 0) {
          return { ...prev, workspaces: [], activeWorkspaceId: "", activeChatId: "" };
        }
        const nextActiveWorkspace =
          prev.activeWorkspaceId === workspaceId
            ? remaining[0]
            : remaining.find((w) => w.id === prev.activeWorkspaceId);
        return {
          ...prev,
          workspaces: remaining,
          activeWorkspaceId: nextActiveWorkspace?.id ?? remaining[0].id,
          activeChatId: nextActiveWorkspace?.chats[0]?.id ?? remaining[0].chats[0]?.id ?? ""
        };
      });
      end();
      return;
    }

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}`, { method: "DELETE" });
      if (!response.ok) return;
      setState((prev) => {
        const remaining = prev.workspaces.filter((workspace) => workspace.id !== workspaceId);
        const nextActiveWorkspace =
          prev.activeWorkspaceId === workspaceId
            ? remaining[0]
            : remaining.find((w) => w.id === prev.activeWorkspaceId);
        return {
          ...prev,
          workspaces: remaining,
          activeWorkspaceId: nextActiveWorkspace?.id ?? "",
          activeChatId: nextActiveWorkspace?.chats[0]?.id ?? ""
        };
      });
    } catch (error) {
      console.error("Failed to delete workspace:", error);
    } finally {
      end();
    }
  };

  const toggleSidebar = () => {
    setState((prev) => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  };

  const updateChatMessages = (chatId: string, updater: (messages: Message[]) => Message[]) => {
    setState((prev) => {
      const workspaces = prev.workspaces.map((workspace) => {
        if (workspace.id !== prev.activeWorkspaceId) return workspace;
        const chats = workspace.chats.map((chat) =>
          chat.id === chatId ? { ...chat, messages: updater(chat.messages) } : chat
        );
        return { ...workspace, chats };
      });
      return { ...prev, workspaces };
    });
  };

  // Frontend-only streaming simulation so the UI behaves like a real agent stream.
  const sendMessage = (content: string) => {
    if (!activeChat || isStreaming) return;
    const trimmed = content.trim();
    if (!trimmed) return;

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: trimmed,
      createdAt: nowIso()
    };

    const assistantMessage: Message = {
      id: createId(),
      role: "assistant",
      content: "",
      createdAt: nowIso(),
      isStreaming: true
    };

    updateChatMessages(activeChat.id, (messages) => [...messages, userMessage, assistantMessage]);

    const simulatedResponse =
      "Thanks for the context. This is a simulated streaming response to demonstrate how the UI will render token-by-token once OpenRouter and your agent backend are connected.";
    const words = simulatedResponse.split(" ");
    let index = 0;

    if (streamTimer.current) {
      clearInterval(streamTimer.current);
    }

    streamTimer.current = setInterval(() => {
      index += 1;
      updateChatMessages(activeChat.id, (messages) =>
        messages.map((message) => {
          if (message.id !== assistantMessage.id) return message;
          const nextContent = words.slice(0, index).join(" ");
          const done = index >= words.length;
          return {
            ...message,
            content: nextContent,
            isStreaming: !done
          };
        })
      );

      if (index >= words.length && streamTimer.current) {
        clearInterval(streamTimer.current);
        streamTimer.current = null;
      }
    }, 60);
  };

  const value: ChatContextValue = {
    state,
    activeWorkspace,
    activeChat,
    isStreaming,
    isMutating,
    isLoadingWorkspaces,
    selectWorkspace,
    selectChat,
    createChat,
    renameChat,
    deleteChat,
    createWorkspace,
    deleteWorkspace,
    toggleSidebar,
    sendMessage
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within ChatProvider");
  }
  return context;
};
