import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Header } from "@/components/app/Header";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="pt-20">
            {children}
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}