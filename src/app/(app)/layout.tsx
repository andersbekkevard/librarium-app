import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/AuthProvider";
import { BooksProvider } from "@/lib/BooksProvider";
import { Header } from "@/components/app/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <BooksProvider>
          <div className="min-h-screen bg-background">
            <Header />
            <main className="pt-20">{children}</main>
          </div>
        </BooksProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
