"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  CheckSquare,
  Clock,
  TrendingUp,
  FolderOpen,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Stats {
  totalDocuments: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  taskCompletionRate: number;
  categories: { name: string; count: number; color: string }[];
  recentActivity: { id: string; type: string; title: string; description: string; timestamp: string }[];
  milestones: { id: string; name: string; dueDate: string; completed: boolean }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Project Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Centre Culturel et Artistique Kahnawake
          </h1>
          <p className="text-gray-500 mt-1">
            Progiciel de Gestion Intégré avec Intelligence Artificielle
          </p>
        </div>
        <Badge variant="success" className="text-sm px-3 py-1">
          Project Active
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Documents</CardTitle>
            <FileText className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalDocuments || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Plans et specifications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Tasks</CardTitle>
            <CheckSquare className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalTasks || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.completedTasks || 0} completed, {stats?.pendingTasks || 0} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">In Progress</CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.inProgressTasks || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Active tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.taskCompletionRate || 0}%</div>
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all"
                style={{ width: `${stats?.taskCompletionRate || 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Categories */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Document Categories
            </CardTitle>
            <CardDescription>Browse documents by discipline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {(stats?.categories?.length ? stats.categories : defaultCategories).map((category) => (
                <Link
                  key={category.name}
                  href={`/documents?category=${category.name}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <span
                    className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: category.color }}
                  >
                    {category.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-medium text-sm">{category.name}</p>
                    <p className="text-xs text-gray-500">{category.count} documents</p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Milestones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upcoming Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(stats?.milestones || []).length > 0 ? (
                stats?.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-center gap-3 p-2 rounded border"
                  >
                    <div
                      className={`h-3 w-3 rounded-full ${
                        milestone.completed ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{milestone.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(milestone.dueDate).toLocaleDateString("fr-CA")}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No milestones defined yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates on the project</CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {(stats?.recentActivity || []).length > 0 ? (
            <div className="space-y-4">
              {stats?.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      activity.type === "document_added"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {activity.type === "document_added" ? (
                      <FileText className="h-4 w-4" />
                    ) : (
                      <CheckSquare className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(activity.timestamp).toLocaleTimeString("fr-CA", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No recent activity</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/documents/upload">Import Documents to Get Started</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/documents/upload" className="block">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Import Plans</h3>
                <p className="text-sm text-gray-500">Upload PDF documents</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/tasks/new" className="block">
          <Card className="hover:border-green-300 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Create Task</h3>
                <p className="text-sm text-gray-500">Add new project task</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/search" className="block">
          <Card className="hover:border-purple-300 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 p-6">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">AI Search</h3>
                <p className="text-sm text-gray-500">Search with intelligence</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}

const defaultCategories = [
  { name: "Architecture", count: 0, color: "#3B82F6" },
  { name: "Civil", count: 0, color: "#10B981" },
  { name: "Electrical", count: 0, color: "#F59E0B" },
  { name: "Mechanical", count: 0, color: "#EF4444" },
  { name: "Structure", count: 0, color: "#8B5CF6" },
  { name: "Landscape", count: 0, color: "#22C55E" },
  { name: "Scenography", count: 0, color: "#06B6D4" },
  { name: "Food-Services", count: 0, color: "#EC4899" },
  { name: "AV-Equipment", count: 0, color: "#6366F1" },
];
