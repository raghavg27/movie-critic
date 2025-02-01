import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Review } from "@/types";
import { useToast } from "@/components/ui/use-toast";
const apiUrl = "http://localhost:8080";

interface EditReviewModalProps {
  open: boolean;
  onClose: () => void;
  review: Review | null;
  onSave: (updatedReview: Review) => void;
}

export function EditReviewModal({
  open,
  onClose,
  review,
  onSave,
}: EditReviewModalProps) {
  const { toast } = useToast();
  const [reviewerName, setReviewerName] = useState(review?.reviewer_name || "");
  const [rating, setRating] = useState(review?.rating || 0);
  const [comments, setComments] = useState(review?.review_comments || "");

  const handleSave = async () => {
    if (!review) return;

    const updatedReview = {
      ...review,
      reviewer_name: reviewerName,
      rating,
      review_comments: comments,
    };

    try {
      const response = await fetch(`${apiUrl}/reviews/${review.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedReview),
      });

      if (!response.ok) {
        throw new Error("Failed to update review");
      }

      onSave(updatedReview);
      onClose();
      toast({
        title: "Success",
        description: "Review updated successfully",
      });
    } catch (error) {
      console.error("Error updating review:", error);
      toast({
        title: "Error",
        description: "Failed to update review",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="reviewerName" className="text-sm font-medium">
              Your Name (optional)
            </label>
            <Input
              id="reviewerName"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="rating" className="text-sm font-medium">
              Rating (0-10)
            </label>
            <Input
              id="rating"
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={rating}
              onChange={(e) => setRating(parseFloat(e.target.value))}
              placeholder="Enter rating"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="comments" className="text-sm font-medium">
              Review Comments
            </label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Write your review"
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
