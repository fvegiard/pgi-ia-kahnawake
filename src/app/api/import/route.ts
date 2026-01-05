import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { categorizeDocument, extractRevision } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";

// Import documents from a directory
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourcePath, projectId } = body;

    if (!sourcePath || !projectId) {
      return NextResponse.json(
        { error: "sourcePath and projectId are required" },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
      documents: [] as { name: string; category: string }[],
    };

    // Function to recursively scan directory
    async function scanDirectory(dirPath: string, categoryOverride?: string) {
      try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);

          if (entry.isDirectory()) {
            // Use directory name as category hint
            await scanDirectory(fullPath, entry.name);
          } else if (entry.name.toLowerCase().endsWith(".pdf")) {
            try {
              const stats = await fs.stat(fullPath);
              const fileName = entry.name;

              // Check if already imported
              const existing = await prisma.document.findFirst({
                where: { fileName, projectId },
              });

              if (existing) {
                results.skipped++;
                continue;
              }

              // Categorize document
              const { category: detectedCategory, subcategory } = categorizeDocument(fileName);
              const category = (categoryOverride && detectedCategory === "Other")
                ? categoryOverride
                : detectedCategory;
              const revision = extractRevision(fileName);

              // Create document record
              const document = await prisma.document.create({
                data: {
                  name: fileName.replace(/\.pdf$/i, "").replace(/-/g, " "),
                  fileName,
                  filePath: fullPath,
                  fileSize: stats.size,
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

              results.imported++;
              results.documents.push({ name: document.name, category });
            } catch (err) {
              results.errors.push(`Error importing ${entry.name}: ${err}`);
            }
          }
        }
      } catch (err) {
        results.errors.push(`Error scanning ${dirPath}: ${err}`);
      }
    }

    await scanDirectory(sourcePath);

    // Create notification
    await prisma.notification.create({
      data: {
        title: "Import Complete",
        message: `Imported ${results.imported} documents, skipped ${results.skipped}`,
        type: results.errors.length > 0 ? "warning" : "success",
      },
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error importing documents:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
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
