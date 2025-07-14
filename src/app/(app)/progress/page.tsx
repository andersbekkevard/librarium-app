"use client";

import Sidebar from "@/components/app/Sidebar";
import { Target } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProgressPage() {
  const router = useRouter();

  const handleAddBookClick = () => {
    router.push("/add-books");
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onAddBookClick={handleAddBookClick} />
      <div className="ml-64 flex items-center justify-center min-h-screen p-6">
        <div className="bg-card border border-border rounded-2xl p-12 flex flex-col items-center w-full max-w-xl shadow-lg hover:shadow-xl transition-shadow gap-y-6">
          <span className="text-sm text-muted-foreground mb-2 tracking-wide uppercase">
            Feature Preview
          </span>
          <div className="bg-muted/50 rounded-full p-5 mb-4 ring-2 ring-brand-primary flex items-center justify-center">
            <Target
              className="h-10 w-10 text-brand-primary"
              aria-hidden="true"
            />
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2 text-center">
            Personal Reading Goals
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-1">
            Coming soon
          </p>
          <p className="text-base text-muted-foreground text-center opacity-80">
            Track your personal reading goals and milestones here soon! Stay
            tuned for updates.
          </p>
        </div>
      </div>
    </div>
  );
}
