import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Movie } from "@/types";
import { useState } from "react";
import { useToast } from "./ui/use-toast";

const apiUrl = import.meta.env.VITE_BACKEND_URL;

interface MovieFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (movie: Omit<Movie, "id" | "averageRating">) => void;
  initialMovie?: Movie;
}

export function MovieForm({
  open,
  onOpenChange,
  onSubmit,
  initialMovie,
}: MovieFormProps) {
  const [name, setName] = useState(initialMovie?.name || "");
  const [releaseDate, setReleaseDate] = useState(
    initialMovie?.releaseDate || ""
  );
  const { toast } = useToast();

  // Define the mutation for adding/updating a movie
  const addMovieMutation = useMutation({
    mutationFn: async (newMovie: Omit<Movie, "id" | "averageRating">) => {
      const response = await fetch(`${apiUrl}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMovie),
      });

      if (!response.ok) {
        throw new Error("Failed to add movie");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: `Movie ${initialMovie ? "updated" : "added"} successfully`,
      });

      // Call the onSubmit prop with the new movie data
      onSubmit(data);

      // Reset form fields and close the dialog
      setName("");
      setReleaseDate("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name || !releaseDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newMovie = {
      name,
      release_date: releaseDate,
    };

    // Trigger the mutation
    addMovieMutation.mutate(newMovie);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {initialMovie ? "Edit Movie" : "Add New Movie"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Name
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter movie name"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="releaseDate" className="text-sm font-medium">
              Release Date
            </label>
            <Input
              id="releaseDate"
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={addMovieMutation.isPending} // Disable button while mutation is in progress
          >
            {addMovieMutation.isPending
              ? "Submitting..."
              : initialMovie
              ? "Update Movie"
              : "Create Movie"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}