import { useState, useEffect } from "react";
import { TaskBar } from "./components/TaskBar";
import type { Task } from "./components/TaskBar";
import { AddTaskDialog } from "./components/AddTaskDialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";
import { format, startOfWeek, endOfWeek, addDays, isWeekend, parseISO } from "date-fns";
import { Calendar } from "lucide-react";

// Mock Canvas/Calendar sync function
const syncExternalTasks = (date: Date): Task[] => {
  const dateStr = format(date, "yyyy-MM-dd");
  const dayOfWeek = date.getDay();
  
  // Weekend with no tasks
  if (isWeekend(date)) {
    return [];
  }

  // Mock tasks based on day of week
  const mockTasks: Task[] = [];
  
  // Workload tasks
  if (dayOfWeek === 1) { // Monday
    mockTasks.push(
      {
        id: `sync-1-${dateStr}`,
        title: "CS 101 Assignment Due",
        category: "Assignments",
        completed: false,
        duration: 90,
        date: dateStr,
      },
      {
        id: `sync-2-${dateStr}`,
        title: "Team Meeting",
        category: "Meetings",
        completed: false,
        duration: 45,
        date: dateStr,
      }
    );
  }
  
  if (dayOfWeek === 3) { // Wednesday
    mockTasks.push(
      {
        id: `sync-3-${dateStr}`,
        title: "Math Quiz",
        category: "Quizzes",
        completed: false,
        duration: 60,
        date: dateStr,
      }
    );
  }
  
  if (dayOfWeek === 5) { // Friday
    mockTasks.push(
      {
        id: `sync-4-${dateStr}`,
        title: "Project Sprint Review",
        category: "Projects",
        completed: false,
        duration: 120,
        date: dateStr,
      }
    );
  }

  // Health tasks (daily)
  mockTasks.push(
    {
      id: `health-1-${dateStr}`,
      title: "Morning Workout",
      category: "Exercise",
      completed: false,
      duration: 30,
      date: dateStr,
    },
    {
      id: `health-2-${dateStr}`,
      title: "Meditation Session",
      category: "Meditation",
      completed: false,
      duration: 15,
      date: dateStr,
    },
    {
      id: `health-3-${dateStr}`,
      title: "Lunch Break",
      category: "Meals",
      completed: false,
      duration: 45,
      date: dateStr,
    }
  );

  return mockTasks;
};

// Generate weekly tasks
const generateWeeklyTasks = (currentDate: Date): Task[] => {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const allTasks: Task[] = [];

  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    allTasks.push(...syncExternalTasks(date));
  }

  return allTasks;
};

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weeklyTasks, setWeeklyTasks] = useState<Task[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addTaskType, setAddTaskType] = useState<"workload" | "health">("workload");

  // Load tasks from localStorage and sync on mount
  useEffect(() => {
    const storedTasks = localStorage.getItem("work-health-tasks");
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      // First time - sync with Canvas/Calendar
      const synced = syncExternalTasks(currentDate);
      setTasks(synced);
      localStorage.setItem("work-health-tasks", JSON.stringify(synced));
    }

    const weekly = generateWeeklyTasks(currentDate);
    setWeeklyTasks(weekly);
  }, []);

  // Auto-sync at start of new day
  useEffect(() => {
    const checkNewDay = () => {
      const lastSync = localStorage.getItem("last-sync-date");
      const today = format(new Date(), "yyyy-MM-dd");
      
      if (lastSync !== today) {
        const synced = syncExternalTasks(new Date());
        setTasks(synced);
        localStorage.setItem("work-health-tasks", JSON.stringify(synced));
        localStorage.setItem("last-sync-date", today);
      }
    };

    checkNewDay();
    const interval = setInterval(checkNewDay, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem("work-health-tasks", JSON.stringify(tasks));
    }
  }, [tasks]);

  // Filter tasks based on date and view mode
  const filteredTasks = tasks.filter((task) => {
    const taskDate = parseISO(task.date);
    if (viewMode === "daily") {
      return format(taskDate, "yyyy-MM-dd") === format(currentDate, "yyyy-MM-dd");
    } else {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return taskDate >= weekStart && taskDate <= weekEnd;
    }
  });

  const workloadTasks = filteredTasks.filter((t) => 
    ["Assignments", "Quizzes", "Projects", "Reading", "Study Sessions", "Meetings"].includes(t.category)
  );
  
  const healthTasks = filteredTasks.filter((t) => 
    ["Exercise", "Meditation", "Meals", "Sleep", "Breaks", "Social Time"].includes(t.category)
  );

  // Calculate percentages
  const calculatePercentage = (taskList: Task[]) => {
    if (taskList.length === 0) return 100; // Health bar at 100% when no tasks
    const completedDuration = taskList.filter(t => t.completed).reduce((sum, t) => sum + t.duration, 0);
    const totalDuration = taskList.reduce((sum, t) => sum + t.duration, 0);
    return totalDuration > 0 ? Math.round((completedDuration / totalDuration) * 100) : 0;
  };

  const workloadPercentage = calculatePercentage(workloadTasks);
  const healthPercentage = calculatePercentage(healthTasks);

  const allTasksDone = tasks.length > 0 && tasks.every((t) => t.completed);

  const handleToggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (type: "workload" | "health") => {
    setAddTaskType(type);
    setAddTaskOpen(true);
  };

  const handleCreateTask = (newTask: { title: string; category: string; duration: number }) => {
    const task: Task = {
      id: `custom-${Date.now()}`,
      ...newTask,
      completed: false,
      date: format(currentDate, "yyyy-MM-dd"),
    };
    setTasks((prev) => [...prev, task]);
  };

  const handleExpandCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleDateChange = (value: string) => {
    const [mode, dateStr] = value.split("|");
    if (mode === "daily" || mode === "weekly") {
      setViewMode(mode);
      if (dateStr) {
        setCurrentDate(parseISO(dateStr));
      }
    }
  };

  // Generate date options
  const dateOptions = [];
  for (let i = -3; i <= 3; i++) {
    const date = addDays(new Date(), i);
    dateOptions.push({
      label: i === 0 ? "Today" : format(date, "MMM d, yyyy"),
      value: `daily|${format(date, "yyyy-MM-dd")}`,
    });
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm px-4 py-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-3">
          Work-Health Tracker
        </h1>
        
        {/* Date Selector */}
        <Select value={`${viewMode}|${format(currentDate, "yyyy-MM-dd")}`} onValueChange={handleDateChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {dateOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
            <SelectItem value={`weekly|${format(currentDate, "yyyy-MM-dd")}`}>
              This Week
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      {allTasksDone ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-4xl font-bold text-gray-800 mb-2">All Tasks Done!!</h2>
            <p className="text-gray-600">Great work! Time to rest and recharge.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-2 gap-4 p-4 overflow-hidden">
          {/* Workload Bar (Left) */}
          <TaskBar
            title="Workload"
            type="workload"
            percentage={workloadPercentage}
            tasks={workloadTasks}
            onToggleTask={handleToggleTask}
            onAddTask={() => handleAddTask("workload")}
            onExpandCategory={handleExpandCategory}
            expandedCategories={expandedCategories}
            weeklyTasks={weeklyTasks.filter((t) => 
              ["Assignments", "Quizzes", "Projects", "Reading", "Study Sessions", "Meetings"].includes(t.category)
            )}
          />

          {/* Health Bar (Right) */}
          <TaskBar
            title="Health"
            type="health"
            percentage={healthPercentage}
            tasks={healthTasks}
            onToggleTask={handleToggleTask}
            onAddTask={() => handleAddTask("health")}
            onExpandCategory={handleExpandCategory}
            expandedCategories={expandedCategories}
            weeklyTasks={weeklyTasks.filter((t) => 
              ["Exercise", "Meditation", "Meals", "Sleep", "Breaks", "Social Time"].includes(t.category)
            )}
          />
        </div>
      )}

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onAdd={handleCreateTask}
        type={addTaskType}
      />
    </div>
  );
}

export default App;
