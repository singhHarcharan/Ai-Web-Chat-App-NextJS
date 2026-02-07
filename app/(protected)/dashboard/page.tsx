"use client";

import { Sidebar } from "@/app/components/Sidebar/Sidebar";
import { ChatWindow } from "@/app/components/ChatWindow/ChatWindow";

export default function DashboardPage() {
  return (
    <main className="flex h-[calc(100vh-4rem)] w-screen flex-col overflow-hidden bg-slate-100 dark:bg-slate-950 md:flex-row">
      <Sidebar />
      <ChatWindow />
    </main>
  );
}
