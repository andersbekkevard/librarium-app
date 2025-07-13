"use client";

import * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "@/lib/models/models";

interface ReadingTimelineProps {
  book: Book;
}

export const ReadingTimeline: React.FC<ReadingTimelineProps> = ({ book }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reading Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 bg-brand-primary rounded-full mt-2"></div>
            <div>
              <p className="text-sm font-medium">Added to library</p>
              <p className="text-xs text-muted-foreground">
                {book.addedAt?.toDate?.()?.toLocaleDateString() || "Unknown"}
              </p>
            </div>
          </div>

          {book.startedAt && (
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-status-info rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Started reading</p>
                <p className="text-xs text-muted-foreground">
                  {book.startedAt?.toDate?.()?.toLocaleDateString() ||
                    "Unknown"}
                </p>
              </div>
            </div>
          )}

          {book.finishedAt && (
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-status-success rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium">Finished reading</p>
                <p className="text-xs text-muted-foreground">
                  {book.finishedAt?.toDate?.()?.toLocaleDateString() ||
                    "Unknown"}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReadingTimeline;
