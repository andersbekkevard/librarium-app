"use client";

import { TrendUpIcon } from "@phosphor-icons/react";
import * as React from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Book } from "@/lib/models/models";

interface ProgressTrackerProps {
  book: Book;
  progress: number;
  onUpdateProgress: (currentPage: number) => void;
  isUpdating: boolean;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  book,
  progress,
  onUpdateProgress,
  isUpdating,
}) => {
  const [currentPageInput, setCurrentPageInput] = useState(
    book.progress.currentPage?.toString() || ""
  );

  const handleUpdateProgress = () => {
    const newPage = parseInt(currentPageInput) || 0;
    onUpdateProgress(newPage);
  };

  // Only show for in-progress books
  if (book.state !== "in_progress") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendUpIcon className="h-5 w-5" weight="light" />
          Update Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="current-page">Current Page</Label>
            <Input
              id="current-page"
              type="number"
              value={currentPageInput}
              onChange={(e) => setCurrentPageInput(e.target.value)}
              min="0"
              max={book.progress.totalPages || undefined}
              className="mt-1"
            />
          </div>
          <div className="flex-1">
            <Label>Total Pages</Label>
            <Input
              value={book.progress.totalPages || ""}
              disabled
              className="mt-1"
            />
          </div>
          <Button
            onClick={handleUpdateProgress}
            disabled={isUpdating}
            className="px-6"
          >
            Update
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <ProgressBar value={progress} variant="md" />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressTracker;
