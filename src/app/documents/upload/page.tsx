"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Upload, FolderOpen, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function UploadPage() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [sourcePath, setSourcePath] = useState("/mnt/c/Users/fvegi/Downloads/Cultural-Art-Center-Kahnawake_-_Drawings (2)");
  const [results, setResults] = useState<{
    imported: number;
    skipped: number;
    errors: string[];
    documents: { name: string; category: string }[];
  } | null>(null);

  const handleImport = async () => {
    setImporting(true);
    setResults(null);

    try {
      // First ensure project exists
      let projectId: string;

      const projectsRes = await fetch("/api/projects");
      const projects = await projectsRes.json();

      if (projects.length === 0) {
        // Create the project
        const createRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "Centre Culturel et Artistique Kahnawake",
            description: "Cultural Art Center project with complete architectural and engineering documentation",
            status: "active",
            location: "Kahnawake, Quebec",
          }),
        });
        const newProject = await createRes.json();
        projectId = newProject.id;
      } else {
        projectId = projects[0].id;
      }

      // Import documents
      const importRes = await fetch("/api/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourcePath, projectId }),
      });

      const data = await importRes.json();
      setResults(data);
    } catch (error) {
      console.error("Import failed:", error);
      setResults({
        imported: 0,
        skipped: 0,
        errors: ["Import failed: " + String(error)],
        documents: [],
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Import Documents</h1>
        <p className="text-gray-500">Import PDF documents from a folder</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Source Directory
          </CardTitle>
          <CardDescription>
            Enter the path to the folder containing the PDF documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={sourcePath}
            onChange={(e) => setSourcePath(e.target.value)}
            placeholder="/path/to/documents"
            className="font-mono text-sm"
          />

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Expected folder structure:</h4>
            <div className="text-sm text-gray-600 font-mono space-y-1">
              <p>Cultural-Art-Center-Kahnawake_-_Drawings/</p>
              <p className="pl-4">Architecture/ (92 PDFs)</p>
              <p className="pl-4">Civil/ (12 PDFs)</p>
              <p className="pl-4">Electrical/ (51 PDFs)</p>
              <p className="pl-4">Mechanical/ (45 PDFs)</p>
              <p className="pl-4">Structure/ (26 PDFs)</p>
              <p className="pl-4">Landscape/ (16 PDFs)</p>
              <p className="pl-4">Scenography/ (37 PDFs)</p>
              <p className="pl-4">Food-Services/ (6 PDFs)</p>
              <p className="pl-4">AV-Equipment/ (14 PDFs)</p>
            </div>
          </div>

          <Button
            onClick={handleImport}
            disabled={importing || !sourcePath}
            className="w-full"
            size="lg"
          >
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing documents...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Start Import
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {results.errors.length === 0 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Import Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{results.imported}</div>
                <div className="text-sm text-green-700">Imported</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-600">{results.skipped}</div>
                <div className="text-sm text-gray-700">Skipped</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{results.errors.length}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            </div>

            {results.documents.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Imported Documents:</h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {results.documents.slice(0, 20).map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="flex-1 truncate">{doc.name}</span>
                      <Badge variant="outline">{doc.category}</Badge>
                    </div>
                  ))}
                  {results.documents.length > 20 && (
                    <p className="text-sm text-gray-500">
                      ... and {results.documents.length - 20} more
                    </p>
                  )}
                </div>
              </div>
            )}

            {results.errors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 text-red-600">Errors:</h4>
                <div className="text-sm text-red-500 space-y-1">
                  {results.errors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button onClick={() => router.push("/documents")} className="flex-1">
                View Documents
              </Button>
              <Button variant="outline" onClick={() => router.push("/")}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
