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

  // Function to call backend and add movie
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate the fields
    if (!name || !releaseDate) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    // Create the movie object to send to the backend
    const newMovie = {
      name,
      release_date: releaseDate,
    };

    try {
      // API call to add a new movie
      const response = await fetch("http://localhost:8080/movies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMovie),
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error("Failed to add movie");
      }

      const movie = await response.json();

      // Notify the user of success
      toast({
        title: "Success",
        description: `Movie added successfully`,
      });

      // Call onSubmit with the new movie data
      onSubmit(newMovie);

      // Reset form fields and close dialog
      setName("");
      setReleaseDate("");
      onOpenChange(false);
    } catch (error) {
      // Handle errors (e.g., network issues, server errors)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
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
          <Button type="submit" className="w-full">
            {initialMovie ? "Update Movie" : "Create Movie"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
