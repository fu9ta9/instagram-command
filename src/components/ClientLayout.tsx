"use client";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { MainContent } from "@/components/MainContent";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const hideLayout = pathname === "/" || pathname === "/login" || pathname === "/manual";

  return (
    <SidebarProvider>
      {hideLayout ? (
        <main className="flex-1 w-full min-w-0 max-w-full">{children}</main>
      ) : (
        <div className="flex min-h-screen bg-gray-50 w-full min-w-0 max-w-full overflow-x-hidden">
          <Sidebar session={session} />
          <MainContent>
            <Header session={session} />
            <main className="flex-1 w-full min-w-0 max-w-full p-4 md:p-6">
              {children}
            </main>
          </MainContent>
        </div>
      )}
    </SidebarProvider>
  );
} 