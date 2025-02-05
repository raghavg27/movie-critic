import { useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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

  // Debug: Log the review object when it changes
  useEffect(() => {
    console.log("Review passed to modal:", review);
  }, [review]);

  // Define the mutation for updating a review
  const updateReviewMutation = useMutation({
    mutationFn: async (updatedReview: Review) => {
      console.log("Sending payload:", JSON.stringify(updatedReview));

      const response = await fetch(`${apiUrl}/reviews/${updatedReview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewer_name: updatedReview.reviewer_name,
          rating: updatedReview.rating, // Ensure it's a number
          review_comments: updatedReview.review_comments,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update review");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Review updated successfully",
      });

      // Call the onSave prop with the updated review data
      onSave(data);

      // Close the modal
      onClose();
    },
    onError: (error) => {
      console.error("Error updating review:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    },
  });

  const handleSave = async () => {
    console.log("Review being updated:", review);

    if (!review || !review.id) {
      toast({
        title: "Error",
        description: "Review data is incomplete. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const updatedReview: Review = {
      ...review,
      reviewer_name: reviewerName || "", // Ensure it's not undefined
      rating: Number(rating), // Convert rating to a number
      review_comments: comments || "", // Ensure it's not undefined
    };

    console.log("Updated review data:", updatedReview);

    updateReviewMutation.mutate(updatedReview);
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
            <Button
              type="submit"
              disabled={updateReviewMutation.isPending} // Disable button while mutation is in progress
            >
              {updateReviewMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
