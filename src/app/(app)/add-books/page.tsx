"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AddBooksPage from "@/components/app/books/AddBooksPage";

function AddBooksContent() {
  const searchParams = useSearchParams();
  
  const searchQuery = searchParams.get("q") || "";
  const searchType = searchParams.get("type") || "title";
  const activeTab = searchParams.get("tab") || "search";

  return (
    <AddBooksPage
      searchQuery={searchQuery}
      searchType={searchType as "title" | "author"}
      activeTab={activeTab as "search" | "manual" | "scan"}
    />
  );
}

export default function AddBooksPageRoute() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background">Loading...</div>}>
      <AddBooksContent />
    </Suspense>
  );
}