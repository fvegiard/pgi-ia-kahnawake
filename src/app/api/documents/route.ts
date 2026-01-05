import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { categorizeDocument, extractRevision } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { fileName: { contains: search } },
        { extractedText: { contains: search } },
      ];
    }

    const documents = await prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { annotations: true, comments: true },
        },
      },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("projectId") as string;

    if (!file || !projectId) {
      return NextResponse.json({ error: "File and projectId are required" }, { status: 400 });
    }

    const fileName = file.name;
    const { category, subcategory } = categorizeDocument(fileName);
    const revision = extractRevision(fileName);

    // Save file
    const uploadDir = path.join(process.cwd(), "public", "plans");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const document = await prisma.document.create({
      data: {
        name: fileName.replace(/\.pdf$/i, "").replace(/-/g, " "),
        fileName,
        filePath: `/plans/${fileName}`,
        fileSize: buffer.length,
        category,
        subcategory,
        revision,
        projectId,
      },
    });

    // Update category count
    await prisma.category.upsert({
      where: { name_projectId: { name: category, projectId } },
      update: { count: { increment: 1 } },
      create: {
        name: category,
        projectId,
        count: 1,
        color: getCategoryColor(category),
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Failed to upload document" }, { status: 500 });
  }
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    Architecture: "#3B82F6",
    Civil: "#10B981",
    Electrical: "#F59E0B",
    Mechanical: "#EF4444",
    Structure: "#8B5CF6",
    Landscape: "#22C55E",
    "Food-Services": "#EC4899",
    Scenography: "#06B6D4",
    "AV-Equipment": "#6366F1",
    Other: "#6B7280",
  };
  return colors[category] || colors.Other;
}
