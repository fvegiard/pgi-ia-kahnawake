"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Search, Filter, Grid, List, Download, Eye, Upload } from "lucide-react";
import Link from "next/link";
import { formatFileSize, formatDate } from "@/lib/utils";

interface Document {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  category: string;
  subcategory?: string;
  revision?: string;
  createdAt: string;
  _count?: { annotations: number; comments: number };
}

function DocumentsContent() {
  const searchParams = useSearchParams();
  const categoryFilter = searchParams.get("category");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    async function fetchDocuments() {
      try {
        const params = new URLSearchParams();
        if (categoryFilter) params.set("category", categoryFilter);
        if (searchQuery) params.set("search", searchQuery);

        const res = await fetch(`/api/documents?${params}`);
        if (res.ok) {
          const data = await res.json();
          setDocuments(data);
        }
      } catch (error) {
        console.error("Failed to fetch documents:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDocuments();
  }, [categoryFilter, searchQuery]);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Architecture: "bg-blue-100 text-blue-700",
      Civil: "bg-emerald-100 text-emerald-700",
      Electrical: "bg-amber-100 text-amber-700",
      Mechanical: "bg-red-100 text-red-700",
      Structure: "bg-purple-100 text-purple-700",
      Landscape: "bg-green-100 text-green-700",
      Scenography: "bg-cyan-100 text-cyan-700",
      "Food-Services": "bg-pink-100 text-pink-700",
      "AV-Equipment": "bg-indigo-100 text-indigo-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
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
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-gray-500">
            {categoryFilter ? `Showing ${categoryFilter} documents` : "All project documents"}
          </p>
        </div>
        <Button asChild>
          <Link href="/documents/upload">
            <Upload className="mr-2 h-4 w-4" />
            Import Documents
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
        <div className="flex border rounded-lg">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Documents */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">No documents found</h3>
            <p className="text-gray-500 mb-4">
              {categoryFilter
                ? `No documents in ${categoryFilter} category`
                : "Start by importing documents"}
            </p>
            <Button asChild>
              <Link href="/documents/upload">Import Documents</Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                  <Badge className={getCategoryColor(doc.category)}>{doc.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium text-sm line-clamp-2 mb-2" title={doc.name}>
                  {doc.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span>{formatFileSize(doc.fileSize)}</span>
                  {doc.revision && <span>Rev. {doc.revision}</span>}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/documents/${doc.id}`}>
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={doc.filePath} download>
                      <Download className="h-3 w-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-4 font-medium text-sm">Name</th>
                  <th className="text-left p-4 font-medium text-sm">Category</th>
                  <th className="text-left p-4 font-medium text-sm">Size</th>
                  <th className="text-left p-4 font-medium text-sm">Revision</th>
                  <th className="text-left p-4 font-medium text-sm">Date</th>
                  <th className="text-right p-4 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-medium">{doc.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge className={getCategoryColor(doc.category)}>{doc.category}</Badge>
                    </td>
                    <td className="p-4 text-sm text-gray-500">{formatFileSize(doc.fileSize)}</td>
                    <td className="p-4 text-sm text-gray-500">{doc.revision || "-"}</td>
                    <td className="p-4 text-sm text-gray-500">{formatDate(doc.createdAt)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/documents/${doc.id}`}>View</Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.filePath} download>Download</a>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function DocumentsPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <DocumentsContent />
    </Suspense>
  );
}
