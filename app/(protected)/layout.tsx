import { ProfileDropdown } from "@/app/components/ProfileDropdown/ProfileDropdown";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-screen flex-col">
      <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">AI Chat App</h1>
        <div className="flex items-center space-x-4">
          <ProfileDropdown />
        </div>
      </header>
      {children}
    </div>
  );
}
