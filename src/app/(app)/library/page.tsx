"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import MyLibraryPage from "@/components/app/MyLibraryPage";

function LibraryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const searchQuery = searchParams.get("search") || "";
  const filterStatus = searchParams.get("filter") || "all";
  const filterOwnership = searchParams.get("ownership") || "all";
  const filterGenre = searchParams.get("genre") || "all";
  const sortBy = searchParams.get("sort") || "title";
  const sortDirection = searchParams.get("direction") || "asc";
  const viewMode = searchParams.get("view") || "grid";

  const handleBookClick = (bookId: string) => {
    router.push(`/books/${bookId}`);
  };

  return (
    <MyLibraryPage
      searchQuery={searchQuery}
      onBookClick={handleBookClick}
      filterStatus={filterStatus}
      filterOwnership={filterOwnership}
      filterGenre={filterGenre}
      sortBy={sortBy}
      sortDirection={sortDirection as "asc" | "desc"}
      viewMode={viewMode as "grid" | "list"}
    />
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background">Loading...</div>}>
      <LibraryContent />
    </Suspense>
  );
}