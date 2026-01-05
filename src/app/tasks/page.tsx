"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  CheckSquare,
  Plus,
  Clock,
  AlertTriangle,
  CheckCircle,
  Circle,
  MoreVertical,
} from "lucide-react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  createdAt: string;
}

const statusConfig = {
  todo: { label: "To Do", color: "bg-gray-100 text-gray-700", icon: Circle },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: Clock },
  review: { label: "Review", color: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
  completed: { label: "Completed", color: "bg-green-100 text-green-700", icon: CheckCircle },
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-600" },
  medium: { label: "Medium", color: "bg-blue-100 text-blue-600" },
  high: { label: "High", color: "bg-orange-100 text-orange-600" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-600" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTasks();
  }, []);

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTasks(tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus as Task["status"] } : t)));
      }
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const filteredTasks = filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const tasksByStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    review: tasks.filter((t) => t.status === "review"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tasks</h1>
          <p className="text-gray-500">Manage project tasks and assignments</p>
        </div>
        <Button asChild>
          <Link href="/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const StatusIcon = config.icon;
          const count = tasksByStatus[status as keyof typeof tasksByStatus].length;
          return (
            <Card
              key={status}
              className={`cursor-pointer transition-all ${filter === status ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setFilter(filter === status ? "all" : status)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <div className={`p-2 rounded-lg ${config.color}`}>
                  <StatusIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-500">{config.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(statusConfig).map(([status, config]) => {
          const StatusIcon = config.icon;
          const statusTasks = tasksByStatus[status as keyof typeof tasksByStatus];
          return (
            <div key={status} className="space-y-3">
              <div className="flex items-center gap-2 px-2">
                <StatusIcon className="h-4 w-4" />
                <h3 className="font-semibold text-sm">{config.label}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {statusTasks.length}
                </Badge>
              </div>
              <div className="space-y-2 min-h-[200px]">
                {statusTasks.map((task) => (
                  <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-1">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge className={priorityConfig[task.priority].color}>
                          {priorityConfig[task.priority].label}
                        </Badge>
                        {task.dueDate && (
                          <span className="text-xs text-gray-400">
                            {new Date(task.dueDate).toLocaleDateString("fr-CA")}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {statusTasks.length === 0 && (
                  <div className="border-2 border-dashed rounded-lg p-4 text-center text-gray-400 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {tasks.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckSquare className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
            <p className="text-gray-500 mb-4">Create your first task to get started</p>
            <Button asChild>
              <Link href="/tasks/new">Create Task</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
