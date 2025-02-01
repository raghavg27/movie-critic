import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Movie } from "@/types";
import { useToast } from "@/components/ui/use-toast";
const apiUrl = "http://localhost:8080";

interface EditMovieModalProps {
  open: boolean;
  movie: Movie | null;
  onClose: () => void;
  onSave: (updatedMovie: Movie) => void;
}

export function EditMovieModal({
  open,
  movie,
  onClose,
  onSave,
}: EditMovieModalProps) {
  const { toast } = useToast();
  const [name, setName] = useState(movie?.name || "");
  const [releaseDate, setReleaseDate] = useState(movie?.release_date || "");

  const handleSave = async () => {
    if (!movie) return;

    const updatedMovie = { ...movie, name, release_date: releaseDate };

    try {
      const response = await fetch(`${apiUrl}/movies/${movie.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMovie),
      });

      if (!response.ok) throw new Error("Failed to update movie");

      onSave(updatedMovie);
      onClose();
      toast({
        title: "Success",
        description: "Movie edited successfully",
      });
    } catch (error) {
      console.error("Error updating movie:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Movie</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Movie Name
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
              placeholder="Select release date"
            />
          </div>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
