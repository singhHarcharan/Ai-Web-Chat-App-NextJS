// app/layout.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { Inter } from "next/font/google";
import { ChatProvider } from "./context/ChatContext";
import { WorkspaceProvider } from "./context/WorkSpaceContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <WorkspaceProvider>
            <ChatProvider>
              {children}
            </ChatProvider>
          </WorkspaceProvider>
        </SessionProvider>
      </body>
    </html>
  );
}