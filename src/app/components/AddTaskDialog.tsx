import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (task: { title: string; category: string; duration: number }) => void;
  type: "workload" | "health";
}

const workloadCategories = [
  "Assignments",
  "Quizzes",
  "Projects",
  "Reading",
  "Study Sessions",
  "Meetings",
];

const healthCategories = [
  "Exercise",
  "Meditation",
  "Meals",
  "Sleep",
  "Breaks",
  "Social Time",
];

export function AddTaskDialog({ open, onClose, onAdd, type }: AddTaskDialogProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("30");

  const categories = type === "workload" ? workloadCategories : healthCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && category && duration) {
      onAdd({
        title,
        category,
        duration: parseInt(duration),
      });
      setTitle("");
      setCategory("");
      setDuration("30");
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add {type === "workload" ? "Workload" : "Health"} Task
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Task Name</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task name..."
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Add Task</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
