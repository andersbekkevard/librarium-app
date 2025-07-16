"use client";

import { Header } from "@/components/app/Header";
import { Sidebar } from "@/components/app/Sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppProviders } from "@/lib/providers";
import { useState } from "react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppProviders>
        <ErrorBoundary
          context={{
            component: "AppLayout",
            action: "render",
          }}
        >
          <div className="min-h-screen bg-background">
            <Header onMenuClick={toggleSidebar} />
            
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
              <>
                {/* Backdrop */}
                <div 
                  className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                  onClick={closeSidebar}
                />
                
                {/* Mobile sidebar */}
                <div className={`
                  fixed left-0 top-0 h-full w-64 z-50
                  transform transition-transform duration-300 ease-in-out
                  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                  lg:hidden
                `}>
                  <div className="pt-[72px] h-full">
                    <Sidebar />
                  </div>
                </div>
              </>
            )}
            
            {/* Desktop sidebar - always visible */}
            <div className="hidden lg:block fixed left-0 top-[72px] w-64 h-[calc(100vh-72px)] z-40">
              <Sidebar />
            </div>
            
            {/* Main content with responsive margins */}
            <main className="pt-20 lg:ml-64">
              <ErrorBoundary
                context={{
                  component: "AppMain",
                  action: "render",
                }}
              >
                {children}
              </ErrorBoundary>
            </main>
          </div>
        </ErrorBoundary>
      </AppProviders>
    </ThemeProvider>
  );
}
