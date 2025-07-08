import { ThemeProvider } from "@/components/theme-provider";
import { AppProviders } from "@/lib/providers";
import { Header } from "@/components/app/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppProviders>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-20">{children}</main>
        </div>
      </AppProviders>
    </ThemeProvider>
  );
}
