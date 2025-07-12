"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Calendar,
  Hash,
} from "lucide-react";
import * as React from "react";

import { Book } from "@/lib/models";

interface BookInfoProps {
  book: Book;
}

export const BookInfo: React.FC<BookInfoProps> = ({ book }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{book.title}</CardTitle>
        <p className="text-lg text-muted-foreground">
          by {book.author}
        </p>
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
            <Accordion type="single" collapsible>
              <AccordionItem value="description">
                <AccordionTrigger>Description</AccordionTrigger>
                <AccordionContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {book.description}
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BookInfo;