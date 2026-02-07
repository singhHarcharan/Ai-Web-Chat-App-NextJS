import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/app/globals.css";
import { Plus_Jakarta_Sans } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap"
});

export const metadata: Metadata = {
  title: "AI Chat Workspace",
  description: "Frontend UI for an AI chat workspace"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-[var(--font-jakarta)]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
