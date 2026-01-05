"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, FileText, CheckSquare, TrendingUp, PieChart } from "lucide-react";

interface Stats {
  totalDocuments: number;
  totalTasks: number;
  completedTasks: number;
  taskCompletionRate: number;
  categories: { name: string; count: number; color: string }[];
  documentsByCategory: { category: string; _count: number; _sum: { fileSize: number } }[];
}

export default function AnalyticsPage() {
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

  const totalFileSize = stats?.documentsByCategory?.reduce(
    (acc, cat) => acc + (cat._sum?.fileSize || 0),
    0
  ) || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Analytics
        </h1>
        <p className="text-gray-500">Project statistics and insights</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Documents</p>
                <p className="text-3xl font-bold">{stats?.totalDocuments || 0}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tasks</p>
                <p className="text-3xl font-bold">{stats?.totalTasks || 0}</p>
              </div>
              <CheckSquare className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Completion Rate</p>
                <p className="text-3xl font-bold">{stats?.taskCompletionRate || 0}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Size</p>
                <p className="text-3xl font-bold">
                  {totalFileSize > 1024 * 1024 * 1024
                    ? `${(totalFileSize / (1024 * 1024 * 1024)).toFixed(1)} GB`
                    : `${(totalFileSize / (1024 * 1024)).toFixed(1)} MB`}
                </p>
              </div>
              <PieChart className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Documents by Category</CardTitle>
          <CardDescription>Distribution of documents across disciplines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats?.categories?.map((category) => {
              const percentage =
                stats.totalDocuments > 0
                  ? Math.round((category.count / stats.totalDocuments) * 100)
                  : 0;
              return (
                <div key={category.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{category.count}</Badge>
                      <span className="text-sm text-gray-500 w-10 text-right">{percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {(!stats?.categories || stats.categories.length === 0) && (
              <p className="text-gray-500 text-center py-8">No documents imported yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Progress */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className="text-green-500"
                      strokeWidth="8"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                      strokeDasharray={`${(stats?.taskCompletionRate || 0) * 3.52} 352`}
                    />
                  </svg>
                  <span className="absolute text-2xl font-bold">
                    {stats?.taskCompletionRate || 0}%
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{stats?.completedTasks || 0}</p>
                  <p className="text-sm text-gray-500">Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {(stats?.totalTasks || 0) - (stats?.completedTasks || 0)}
                  </p>
                  <p className="text-sm text-gray-500">Remaining</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Categories</span>
                <span className="font-bold">{stats?.categories?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Avg. docs per category</span>
                <span className="font-bold">
                  {stats?.categories?.length
                    ? Math.round((stats.totalDocuments || 0) / stats.categories.length)
                    : 0}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Largest category</span>
                <span className="font-bold">
                  {stats?.categories?.length
                    ? stats.categories.reduce((max, c) => (c.count > max.count ? c : max)).name
                    : "-"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
