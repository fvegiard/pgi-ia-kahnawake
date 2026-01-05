"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, CheckCircle, Circle, Clock } from "lucide-react";

interface Milestone {
  id: string;
  name: string;
  description?: string;
  dueDate: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate?: string;
}

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [milestonesRes, tasksRes] = await Promise.all([
          fetch("/api/milestones"),
          fetch("/api/tasks"),
        ]);

        if (milestonesRes.ok) {
          const data = await milestonesRes.json();
          setMilestones(data);
        }
        if (tasksRes.ok) {
          const data = await tasksRes.json();
          setTasks(data.filter((t: Task) => t.dueDate));
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const getMonthData = () => {
    const now = new Date();
    const months: { month: string; year: number; items: (Milestone | Task)[] }[] = [];

    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = date.toLocaleDateString("fr-CA", { month: "long", year: "numeric" });

      const monthMilestones = milestones.filter((m) => {
        const d = new Date(m.dueDate);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });

      const monthTasks = tasks.filter((t) => {
        if (!t.dueDate) return false;
        const d = new Date(t.dueDate);
        return d.getMonth() === date.getMonth() && d.getFullYear() === date.getFullYear();
      });

      months.push({
        month: monthName,
        year: date.getFullYear(),
        items: [...monthMilestones, ...monthTasks].sort((a, b) => {
          const dateA = "completed" in a ? new Date(a.dueDate) : new Date((a as Task).dueDate || Date.now());
          const dateB = "completed" in b ? new Date(b.dueDate) : new Date((b as Task).dueDate || Date.now());
          return dateA.getTime() - dateB.getTime();
        }),
      });
    }

    return months;
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const monthData = getMonthData();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Project Timeline
          </h1>
          <p className="text-gray-500">Track milestones and deadlines</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Milestone
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-blue-100">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{milestones.length}</p>
              <p className="text-sm text-gray-500">Total Milestones</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{milestones.filter((m) => m.completed).length}</p>
              <p className="text-sm text-gray-500">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{tasks.filter((t) => t.dueDate).length}</p>
              <p className="text-sm text-gray-500">Scheduled Tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {monthData.map((month, monthIndex) => (
          <Card key={month.month}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg capitalize">{month.month}</CardTitle>
            </CardHeader>
            <CardContent>
              {month.items.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
                  <div className="space-y-4">
                    {month.items.map((item, index) => {
                      const isMilestone = "completed" in item;
                      const date = new Date(isMilestone ? item.dueDate : (item as Task).dueDate!);

                      return (
                        <div key={`${isMilestone ? "m" : "t"}-${item.id}`} className="relative pl-10">
                          <div
                            className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                              isMilestone
                                ? item.completed
                                  ? "bg-green-500 border-green-500"
                                  : "bg-white border-blue-500"
                                : "bg-white border-gray-300"
                            }`}
                          >
                            {isMilestone && item.completed && (
                              <CheckCircle className="h-4 w-4 text-white -mt-0.5 -ml-0.5" />
                            )}
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium">
                                {isMilestone ? item.name : (item as Task).title}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                  {date.toLocaleDateString("fr-CA", { day: "numeric", month: "short" })}
                                </span>
                                <Badge variant={isMilestone ? "default" : "secondary"}>
                                  {isMilestone ? "Milestone" : "Task"}
                                </Badge>
                              </div>
                            </div>
                            {isMilestone && item.description && (
                              <p className="text-sm text-gray-500">{item.description}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-400 text-center py-4">No items scheduled</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
