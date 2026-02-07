"use client";

import { ChatProvider } from "@/app/context/ChatContext";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return <ChatProvider>{children}</ChatProvider>;
};
