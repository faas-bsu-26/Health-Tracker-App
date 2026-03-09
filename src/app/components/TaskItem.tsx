import { Checkbox } from "./ui/checkbox";
import type { Task } from "./TaskBar";
import { formatDate } from "date-fns";

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  type: "workload" | "health";
  isWeekly?: boolean;
}

export function TaskItem({ task, onToggle, type, isWeekly = false }: TaskItemProps) {
  const textColor = type === "workload" ? "text-blue-900" : "text-green-900";
  const bgColor = type === "workload" ? "bg-blue-50" : "bg-green-50";
  const borderColor = type === "workload" ? "border-blue-200" : "border-green-200";

  return (
    <div
      className={`flex items-start gap-2 p-3 rounded-lg border ${borderColor} ${bgColor} ${
        task.completed ? "opacity-50" : ""
      }`}
    >
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="mt-0.5"
        disabled={isWeekly}
      />
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${textColor} ${task.completed ? "line-through" : ""}`}>
          {task.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500">{task.duration} min</span>
          {isWeekly && (
            <span className="text-xs text-gray-400">
              • {formatDate(new Date(task.date), "MMM d")}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
