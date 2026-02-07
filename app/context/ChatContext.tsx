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
  selectWorkspace: (workspaceId: string) => void;
  selectChat: (chatId: string) => void;
  createChat: () => void;
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

// Seed data lives in context to keep components purely presentational.
const createSeedState = (): ChatState => {
  const workspaceId = createId();
  const chatId = createId();

  return {
    user: {
      id: createId(),
      name: "Alex Morgan",
      email: "alex@workspace.dev"
    },
    workspaces: [
      {
        id: workspaceId,
        name: "Product Strategy",
        chats: [
          {
            id: chatId,
            title: "Q1 Planning Assistant",
            messages: [
              {
                id: createId(),
                role: "assistant",
                content:
                  "Hi Alex! I can help you organize ideas and prepare briefs. Ask me anything to get started.",
                createdAt: nowIso()
              }
            ]
          },
          {
            id: createId(),
            title: "Competitive Research",
            messages: []
          }
        ]
      },
      {
        id: createId(),
        name: "Client Proposals",
        chats: [
          {
            id: createId(),
            title: "Launch Deck Outline",
            messages: []
          }
        ]
      }
    ],
    activeWorkspaceId: workspaceId,
    activeChatId: chatId,
    sidebarCollapsed: false
  };
};

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

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ChatState>(() => createSeedState());
  const streamTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setState(loadState());
  }, []);

  useEffect(() => {
    saveState(state);
  }, [state]);

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

  const createChat = () => {
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
  };

  const createWorkspace = (name?: string) => {
    setState((prev) => {
      const workspaceId = createId();
      const chatId = createId();
      const workspaceName = name?.trim() || `Workspace ${prev.workspaces.length + 1}`;
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
  };

  const deleteWorkspace = (workspaceId: string) => {
    setState((prev) => {
      const remaining = prev.workspaces.filter((workspace) => workspace.id !== workspaceId);
      if (remaining.length === 0) {
        const fallback = createSeedState();
        return { ...fallback, sidebarCollapsed: prev.sidebarCollapsed };
      }
      const nextActiveWorkspace =
        prev.activeWorkspaceId === workspaceId ? remaining[0] : remaining.find((w) => w.id === prev.activeWorkspaceId);
      return {
        ...prev,
        workspaces: remaining,
        activeWorkspaceId: nextActiveWorkspace?.id ?? remaining[0].id,
        activeChatId: nextActiveWorkspace?.chats[0]?.id ?? remaining[0].chats[0]?.id ?? ""
      };
    });
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
    selectWorkspace,
    selectChat,
    createChat,
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
