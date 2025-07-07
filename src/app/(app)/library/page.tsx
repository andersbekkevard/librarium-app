"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MyLibraryPage from "@/components/app/MyLibraryPage";
import Sidebar from "@/components/app/Sidebar";

export default function LibraryPage() {
  const [searchQuery] = useState("");
  const router = useRouter();

  const handleBookClick = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  const handleAddBookClick = () => {
    router.push('/add-books');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onAddBookClick={handleAddBookClick} />
      <div className="ml-64">
        <MyLibraryPage
          searchQuery={searchQuery}
          onBookClick={handleBookClick}
        />
      </div>
    </div>
  );
}