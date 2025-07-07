"use client";

import { useRouter } from "next/navigation";
import { Heart, BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Sidebar from "@/components/app/Sidebar";

export default function WishlistPage() {
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
          Wishlist
        </h1>
        <p className="text-muted-foreground">
          Books you want to read in the future.
        </p>
      </div>

      {/* Add to Wishlist Button */}
      <div className="mb-6">
        <Button className="bg-brand-primary hover:bg-brand-primary/90 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add to Wishlist
        </Button>
      </div>

      {/* Empty State */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="text-center py-16">
          <div className="h-16 w-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="h-8 w-8 text-brand-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Your wishlist is empty
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Start building your reading wishlist by adding books you want to read.
          </p>
          <Button variant="outline" className="border-brand-primary text-brand-primary hover:bg-brand-primary/10">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Books
          </Button>
        </div>
      </div>
    </div>
    </div>
  );
}