import { Header } from "@/components/app/Header";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { AppProviders } from "@/lib/providers";

export default function AppLayout({ children }: { children: React.ReactNode }) {
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
            <Header />
            <main className="pt-20">
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
