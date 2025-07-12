"use client";

import { FileText, Loader2, Plus, X } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { convertManualEntryToBook } from "@/lib/books/book-utils";
import { Book } from "@/lib/models/models";

interface ManualEntryFormProps {
  onAddBook: (book: Book) => Promise<void>;
  isAdding: boolean;
}

export const ManualEntryForm: React.FC<ManualEntryFormProps> = ({
  onAddBook,
  isAdding,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    pages: "",
    publishedYear: "",
    ownership: "wishlist",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const book = convertManualEntryToBook(formData);
    await onAddBook(book);

    // Reset form
    setFormData({
      title: "",
      author: "",
      genre: "",
      pages: "",
      publishedYear: "",
      ownership: "wishlist",
      description: "",
    });
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const clearForm = () => {
    setFormData({
      title: "",
      author: "",
      genre: "",
      pages: "",
      publishedYear: "",
      ownership: "wishlist",
      description: "",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Add Book Manually
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="Enter book title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => updateField("author", e.target.value)}
                placeholder="Enter author name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre (optional)</Label>
              <Input
                id="genre"
                value={formData.genre}
                onChange={(e) => updateField("genre", e.target.value)}
                placeholder="Enter genre (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pages">Pages</Label>
              <Input
                id="pages"
                type="number"
                value={formData.pages}
                onChange={(e) => updateField("pages", e.target.value)}
                placeholder="Number of pages"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedYear">Published Year</Label>
              <Input
                id="publishedYear"
                type="number"
                value={formData.publishedYear}
                onChange={(e) => updateField("publishedYear", e.target.value)}
                placeholder="Year published"
                min="1000"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownership">Ownership Status</Label>
              <select
                id="ownership"
                value={formData.ownership || "wishlist"}
                onChange={(e) => updateField("ownership", e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-2 text-sm w-full"
              >
                <option value="wishlist">Wishlist</option>
                <option value="owned">Owned</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Book description (optional)"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add to Library
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isAdding}
              onClick={clearForm}
            >
              <X className="h-4 w-4 mr-2" />
              Clear Form
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ManualEntryForm;
