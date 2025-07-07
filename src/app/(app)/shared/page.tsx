"use client";

import { useRouter } from "next/navigation";
import { Users, BookOpen, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/app/Sidebar";

export default function SharedPage() {
  const router = useRouter();

  const handleAddBookClick = () => {
    router.push('/add-books');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onAddBookClick={handleAddBookClick} />
      <div className="ml-64 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Shared Books
        </h1>
        <p className="text-muted-foreground">
          Books shared with you by friends and family.
        </p>
      </div>

      {/* Share Button */}
      <div className="mb-6">
        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">
          <Share2 className="h-4 w-4 mr-2" />
          Share Your Library
        </Button>
      </div>

      {/* Empty State */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-16">
          <div className="h-16 w-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-brand-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No shared books yet
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Connect with friends and family to share your favorite books and discover new ones.
          </p>
          <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary/10">
            <BookOpen className="h-4 w-4 mr-2" />
            Invite Friends
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}