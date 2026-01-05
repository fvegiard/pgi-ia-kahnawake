import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    const where = projectId ? { projectId } : {};

    const [
      totalDocuments,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      categories,
      recentDocuments,
      recentTasks,
      milestones,
    ] = await Promise.all([
      prisma.document.count({ where }),
      prisma.task.count({ where }),
      prisma.task.count({ where: { ...where, status: "completed" } }),
      prisma.task.count({ where: { ...where, status: "todo" } }),
      prisma.task.count({ where: { ...where, status: "in_progress" } }),
      prisma.category.findMany({
        where: projectId ? { projectId } : {},
        orderBy: { count: "desc" },
      }),
      prisma.document.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.task.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        take: 5,
      }),
      prisma.milestone.findMany({
        where: projectId ? { projectId } : {},
        orderBy: { dueDate: "asc" },
        take: 5,
      }),
    ]);

    // Calculate document size by category
    const documentsByCategory = await prisma.document.groupBy({
      by: ["category"],
      where,
      _count: true,
      _sum: { fileSize: true },
    });

    // Build activity timeline
    const recentActivity = [
      ...recentDocuments.map((doc) => ({
        id: doc.id,
        type: "document_added" as const,
        title: "Document Added",
        description: doc.name,
        timestamp: doc.createdAt,
      })),
      ...recentTasks
        .filter((t) => t.status === "completed")
        .map((task) => ({
          id: task.id,
          type: "task_completed" as const,
          title: "Task Completed",
          description: task.title,
          timestamp: task.updatedAt,
        })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json({
      totalDocuments,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      taskCompletionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      categories: categories.map((c) => ({
        name: c.name,
        count: c.count,
        color: c.color,
      })),
      documentsByCategory,
      recentActivity,
      milestones: milestones.map((m) => ({
        id: m.id,
        name: m.name,
        dueDate: m.dueDate,
        completed: m.completed,
      })),
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
