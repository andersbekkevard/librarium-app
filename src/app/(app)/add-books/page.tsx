"use client";

import { useRouter } from "next/navigation";
import AddBooksPage from "@/components/app/AddBooksPage";
import Sidebar from "@/components/app/Sidebar";

export default function AddBooksPageRoute() {
  const router = useRouter();

  const handleAddBookClick = () => {
    router.push('/add-books');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onAddBookClick={handleAddBookClick} />
      <div className="ml-64">
        <AddBooksPage />
      </div>
    </div>
  );
}