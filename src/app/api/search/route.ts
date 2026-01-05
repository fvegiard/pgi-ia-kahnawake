import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const projectId = searchParams.get("projectId");

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const searchLower = query.toLowerCase();

    // Search documents
    const documents = await prisma.document.findMany({
      where: {
        ...(projectId && { projectId }),
        OR: [
          { name: { contains: searchLower } },
          { fileName: { contains: searchLower } },
          { description: { contains: searchLower } },
          { extractedText: { contains: searchLower } },
          { category: { contains: searchLower } },
          { subcategory: { contains: searchLower } },
        ],
      },
      take: 20,
    });

    // Search tasks
    const tasks = await prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        OR: [
          { title: { contains: searchLower } },
          { description: { contains: searchLower } },
        ],
      },
      take: 10,
    });

    // Search annotations
    const annotations = await prisma.annotation.findMany({
      where: {
        content: { contains: searchLower },
        ...(projectId && {
          document: { projectId },
        }),
      },
      include: { document: true },
      take: 10,
    });

    // Save search history
    await prisma.searchHistory.create({
      data: {
        query,
        results: JSON.stringify({
          documentsCount: documents.length,
          tasksCount: tasks.length,
          annotationsCount: annotations.length,
        }),
      },
    });

    const results = [
      ...documents.map((doc) => ({
        id: doc.id,
        type: "document" as const,
        title: doc.name,
        snippet: doc.description || `${doc.category} - ${doc.subcategory || "General"}`,
        score: calculateScore(doc.name, query) + calculateScore(doc.extractedText || "", query),
        metadata: {
          category: doc.category,
          revision: doc.revision,
          filePath: doc.filePath,
        },
      })),
      ...tasks.map((task) => ({
        id: task.id,
        type: "task" as const,
        title: task.title,
        snippet: task.description || `Status: ${task.status}, Priority: ${task.priority}`,
        score: calculateScore(task.title, query),
        metadata: {
          status: task.status,
          priority: task.priority,
        },
      })),
      ...annotations.map((ann) => ({
        id: ann.id,
        type: "annotation" as const,
        title: `Annotation on ${ann.document?.name || "Document"}`,
        snippet: ann.content,
        score: calculateScore(ann.content, query),
        metadata: {
          documentId: ann.documentId,
          page: ann.page,
        },
      })),
    ].sort((a, b) => b.score - a.score);

    return NextResponse.json({
      query,
      total: results.length,
      results,
    });
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

function calculateScore(text: string, query: string): number {
  if (!text) return 0;
  const textLower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  const words = queryLower.split(/\s+/);
  let score = 0;

  // Exact match bonus
  if (textLower.includes(queryLower)) score += 10;

  // Word matches
  for (const word of words) {
    if (textLower.includes(word)) score += 2;
  }

  // Position bonus (earlier matches score higher)
  const position = textLower.indexOf(queryLower);
  if (position !== -1) {
    score += Math.max(0, 5 - position / 10);
  }

  return score;
}
