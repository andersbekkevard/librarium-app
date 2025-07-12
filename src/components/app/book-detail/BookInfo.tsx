"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Calendar, ChevronDown, ChevronUp, Hash } from "lucide-react";
import * as React from "react";
import { useState } from "react";

import { Book } from "@/lib/models/models";

interface BookInfoProps {
  book: Book;
}

export const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{book.title}</CardTitle>
        <p className="text-lg text-muted-foreground">by {book.author}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Book metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {book.publishedDate && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Published:</span>
              <span className="text-muted-foreground">
                {book.publishedDate}
              </span>
            </div>
          )}
          {book.isbn && (
            <div className="flex items-center gap-2 text-sm">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">ISBN:</span>
              <span className="text-muted-foreground">{book.isbn}</span>
            </div>
          )}
          {book.progress.totalPages && (
            <div className="flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Pages:</span>
              <span className="text-muted-foreground">
                {book.progress.totalPages}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {book.description && (
          <>
            <Separator />
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Description</h3>
              <div className="space-y-2">
                <p
                  className={`text-muted-foreground text-sm leading-relaxed ${
                    isDescriptionExpanded ? "" : "line-clamp-4"
                  }`}
                >
                  {book.description}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleDescription}
                  className="text-brand-primary hover:text-brand-primary/80 p-0 h-auto font-medium"
                >
                  {isDescriptionExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Read less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Read more
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BookInfo;
