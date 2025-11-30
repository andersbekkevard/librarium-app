"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  READING_STATE_OPTIONS,
  ValidationResult,
  validateEditedBook,
  validateNumericField,
  validateStringField,
} from "@/lib/books/book-validation";
import { Book } from "@/lib/models/models";
import { useBooksContext } from "@/lib/providers/BooksProvider";
import {
  WarningCircleIcon,
  CaretDownIcon,
  CaretUpIcon,
  FloppyDiskIcon,
  StarIcon,
  TrashIcon,
  XIcon,
} from "@phosphor-icons/react";
import * as React from "react";
import { useState } from "react";

interface EditBookSheetProps {
  book: Book;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBookDeleted?: () => void;
}

export const EditBookSheet: React.FC<EditBookSheetProps> = ({
  book,
  open,
  onOpenChange,
  onBookDeleted,
}) => {
  const { updateBookManual, deleteBook, error } = useBooksContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<Partial<Book>>({
    title: book.title,
    author: book.author,
    description: book.description || "",
    state: book.state,
    progress: {
      currentPage: book.progress.currentPage,
      totalPages: book.progress.totalPages,
    },
    rating: book.rating,
    isbn: book.isbn || "",
    genre: book.genre || "",
    publishedDate: book.publishedDate || "",
    coverImage: book.coverImage || "",
    isOwned: book.isOwned,
  });

  // Individual field errors for real-time validation
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Add local state for description expansion
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  /**
   * Updates form data and validates the specific field
   */
  const updateFormField = (field: keyof typeof formData, value: unknown) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Clear existing errors for this field
    const newFieldErrors = { ...fieldErrors };
    delete newFieldErrors[field];
    setFieldErrors(newFieldErrors);

    // Validate the specific field
    validateField(field, value);
  };

  /**
   * Updates nested progress data
   */
  const updateProgressField = (
    field: "currentPage" | "totalPages",
    value: string
  ) => {
    const numValue = parseInt(value) || 0;
    const newProgress = { ...formData.progress!, [field]: numValue };
    setFormData({ ...formData, progress: newProgress });

    // Validate progress data
    if (field === "currentPage") {
      const validation = validateNumericField(
        numValue,
        "Current page",
        0,
        newProgress.totalPages
      );
      setFieldErrors({
        ...fieldErrors,
        currentPage: validation.isValid ? [] : validation.errors,
      });
    } else {
      const validation = validateNumericField(numValue, "Total pages", 1);
      setFieldErrors({
        ...fieldErrors,
        totalPages: validation.isValid ? [] : validation.errors,
      });
    }
  };

  /**
   * Validates individual fields for real-time feedback
   */
  const validateField = (field: keyof typeof formData, value: unknown) => {
    let validation: ValidationResult;

    switch (field) {
      case "title":
        validation = validateStringField(value as string, "Title", true);
        break;
      case "author":
        validation = validateStringField(value as string, "Author", true);
        break;
      case "description":
        validation = validateStringField(value as string, "Description", false);
        break;
      case "isbn":
        validation = validateStringField(value as string, "ISBN", false);
        break;
      case "genre":
        validation = validateStringField(value as string, "Genre", false);
        break;
      case "publishedDate":
        validation = validateStringField(
          value as string,
          "Published Date",
          false
        );
        break;
      case "coverImage":
        validation = validateStringField(
          value as string,
          "Cover Image URL",
          false
        );
        break;
      default:
        return;
    }

    if (!validation.isValid) {
      setFieldErrors({
        ...fieldErrors,
        [field]: validation.errors,
      });
    }
  };

  /**
   * Handles rating changes from star component
   */
  const handleRatingChange = (newRating: number) => {
    updateFormField("rating", newRating);
  };

  /**
   * Resets form to original book data
   */
  const handleReset = () => {
    setFormData({
      title: book.title,
      author: book.author,
      description: book.description || "",
      state: book.state,
      progress: {
        currentPage: book.progress.currentPage,
        totalPages: book.progress.totalPages,
      },
      rating: book.rating,
      isbn: book.isbn || "",
      genre: book.genre || "",
      publishedDate: book.publishedDate || "",
      coverImage: book.coverImage || "",
      isOwned: book.isOwned,
    });
    setFieldErrors({});
    setValidationErrors([]);
  };

  /**
   * Filters out undefined values from form data for Firebase compatibility
   */
  const filterUndefinedValues = (data: Partial<Book>): Partial<Book> => {
    const filtered: Partial<Book> = {};

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        (filtered as any)[key] = value;
      }
    });

    return filtered;
  };

  /**
   * Handles form submission with validation
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setValidationErrors([]);

    // Validate entire form
    const validation = validateEditedBook(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Filter out undefined values to prevent Firebase errors
      const filteredData = filterUndefinedValues(formData);

      // Update book with new data using manual update to bypass state machine
      await updateBookManual(book.id, filteredData);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by BooksProvider, but log locally for debugging
      console.error("Error updating book:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handles book deletion with confirmation
   */
  const handleDeleteBook = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteBook(book.id);
      if (result.success) {
        setShowDeleteDialog(false);
        onOpenChange(false);
        onBookDeleted?.();
      }
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="center" className="overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Edit Book</SheetTitle>
          <SheetDescription>
            Make changes to your book details. You can manually adjust any
            field, including reading state, to fix errors or make corrections.
          </SheetDescription>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Global validation errors */}
          {(validationErrors.length > 0 || error) && (
            <div className="p-4 bg-status-error/10 border border-status-error/20 rounded-lg">
              <div className="flex items-start gap-2">
                <WarningCircleIcon className="h-4 w-4 text-status-error mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  {validationErrors.map((err, index) => (
                    <p key={index} className="text-sm text-status-error">
                      {err}
                    </p>
                  ))}
                  {error && (
                    <p className="text-sm text-status-error">
                      {error.userMessage}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => updateFormField("title", e.target.value)}
                placeholder="Enter book title"
              />
              {fieldErrors.title && (
                <p className="text-sm text-status-error">
                  {fieldErrors.title[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                value={formData.author || ""}
                onChange={(e) => updateFormField("author", e.target.value)}
                placeholder="Enter author name"
              />
              {fieldErrors.author && (
                <p className="text-sm text-status-error">
                  {fieldErrors.author[0]}
                </p>
              )}
            </div>

            {/* Description Field - Read more/less pattern */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {!isDescriptionExpanded ? (
                <>
                  <div
                    className="border border-input rounded-md px-3 py-2 bg-white dark:bg-input/30 text-muted-foreground text-sm leading-relaxed line-clamp-1 min-h-[3.85rem] transition-[color,box-shadow]"
                    aria-label="Book description preview"
                  >
                    {formData.description || (
                      <span className="italic text-muted-foreground">
                        No description
                      </span>
                    )}
                  </div>
                  {formData.description && formData.description.length > 60 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setIsDescriptionExpanded(true)}
                      className="text-brand-primary hover:text-brand-primary/80 p-0 h-auto font-medium"
                      aria-label="Expand description to edit"
                    >
                      <CaretDownIcon className="h-4 w-4 mr-1" />
                      Read more
                    </Button>
                  )}
                </>
              ) : (
                <>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) =>
                      updateFormField("description", e.target.value)
                    }
                    placeholder="Enter book description"
                    rows={3}
                    className="text-base"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => setIsDescriptionExpanded(false)}
                    className="text-brand-primary hover:text-brand-primary/80 p-0 h-auto font-medium"
                    aria-label="Collapse description field"
                  >
                    <CaretUpIcon className="h-4 w-4 mr-1" />
                    Read less
                  </Button>
                </>
              )}
              {fieldErrors.description && (
                <p className="text-sm text-status-error">
                  {fieldErrors.description[0]}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Reading Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Reading Status</h3>

            <div className="space-y-2">
              <Label>Reading State</Label>
              <div className="flex gap-2">
                {READING_STATE_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={
                      formData.state === option.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => updateFormField("state", option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPage">Current Page</Label>
                <Input
                  id="currentPage"
                  type="number"
                  value={formData.progress?.currentPage || 0}
                  onChange={(e) =>
                    updateProgressField("currentPage", e.target.value)
                  }
                  min="0"
                />
                {fieldErrors.currentPage && (
                  <p className="text-sm text-status-error">
                    {fieldErrors.currentPage[0]}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalPages">Total Pages</Label>
                <Input
                  id="totalPages"
                  type="number"
                  value={formData.progress?.totalPages || 0}
                  onChange={(e) =>
                    updateProgressField("totalPages", e.target.value)
                  }
                  min="1"
                />
                {fieldErrors.totalPages && (
                  <p className="text-sm text-status-error">
                    {fieldErrors.totalPages[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-5 w-5 cursor-pointer transition-colors ${
                        i < (formData.rating || 0)
                          ? "fill-status-warning text-status-warning"
                          : "fill-muted text-muted hover:text-status-warning"
                      }`}
                      onClick={() => handleRatingChange(i + 1)}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({formData.rating || 0}/5)
                </span>
                {formData.rating && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFormField("rating", undefined)}
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Metadata</h3>

            <div className="space-y-2">
              <Label htmlFor="isbn">ISBN</Label>
              <Input
                id="isbn"
                value={formData.isbn || ""}
                onChange={(e) => updateFormField("isbn", e.target.value)}
                placeholder="Enter ISBN (10 or 13 digits)"
              />
              {fieldErrors.isbn && (
                <p className="text-sm text-status-error">
                  {fieldErrors.isbn[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre || ""}
                onChange={(e) => updateFormField("genre", e.target.value)}
                placeholder="Enter book genre"
              />
              {fieldErrors.genre && (
                <p className="text-sm text-status-error">
                  {fieldErrors.genre[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="publishedDate">Published Date</Label>
              <Input
                id="publishedDate"
                value={formData.publishedDate || ""}
                onChange={(e) =>
                  updateFormField("publishedDate", e.target.value)
                }
                placeholder="YYYY or YYYY-MM or YYYY-MM-DD"
              />
              {fieldErrors.publishedDate && (
                <p className="text-sm text-status-error">
                  {fieldErrors.publishedDate[0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Cover Image URL</Label>
              <Input
                id="coverImage"
                value={formData.coverImage || ""}
                onChange={(e) => updateFormField("coverImage", e.target.value)}
                placeholder="Enter cover image URL"
              />
              {fieldErrors.coverImage && (
                <p className="text-sm text-status-error">
                  {fieldErrors.coverImage[0]}
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Ownership */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ownership</h3>

            <div className="space-y-2">
              <Label>Ownership Status</Label>
              <div className="flex gap-2">
                <Button
                  variant={formData.isOwned ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFormField("isOwned", true)}
                >
                  Owned
                </Button>
                <Button
                  variant={!formData.isOwned ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateFormField("isOwned", false)}
                >
                  Wishlist
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-status-error">Danger Zone</h3>
            <div className="p-4 border border-status-error/20 rounded-lg bg-status-error/5">
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-status-error mb-1">Delete Book</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this book from your library. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isSubmitting || isDeleting}
                  className="bg-status-error hover:bg-status-error/90 text-white"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete Book
                </Button>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            <XIcon className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isDeleting}>
            <FloppyDiskIcon className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-status-error">Delete Book</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;<strong>{book.title}</strong>&quot; by {book.author}?
              <br />
              <br />
              This action cannot be undone. All reading progress, notes, and ratings will be permanently lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteBook}
              disabled={isDeleting}
              className="bg-status-error hover:bg-status-error/90 text-white"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              {isDeleting ? "Deleting..." : "Delete Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Sheet>
  );
};
