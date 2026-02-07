export type MessageRole = "user" | "assistant";

export type Message = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  isStreaming?: boolean;
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
};

export type Workspace = {
  id: string;
  name: string;
  chats: Chat[];
};
