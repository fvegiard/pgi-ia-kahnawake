"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PDFViewer } from "@/components/PDFViewer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface Document {
  id: string;
  name: string;
  fileName: string;
  filePath: string;
  category: string;
  subcategory: string | null;
  revision: string | null;
  fileSize: number;
}

export default function DocumentViewerPage() {
  const params = useParams();
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetch(`/api/documents/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          setDocument(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params.id]);

  const handleAnalyze = async (imageData: string, pageNum: number) => {
    setAnalyzing(true);
    setAnalysis(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: imageData,
          documentName: document?.name,
          pageNumber: pageNum,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data.analysis);
      } else {
        setAnalysis("Erreur lors de l'analyse. Vérifiez votre clé API Claude.");
      }
    } catch (error) {
      setAnalysis("Erreur de connexion à l'API.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="p-6">
        <p className="text-red-500">Document non trouvé</p>
        <Link href="/documents">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux documents
          </Button>
        </Link>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/documents">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {document.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{document.category}</Badge>
              {document.subcategory && (
                <Badge variant="outline">{document.subcategory}</Badge>
              )}
              {document.revision && (
                <Badge variant="secondary">Rev. {document.revision}</Badge>
              )}
              <span className="text-xs text-gray-500">
                {formatFileSize(document.fileSize)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div className="flex-1 flex flex-col">
          <PDFViewer
            filePath={document.filePath}
            fileName={document.fileName}
            onAnalyze={handleAnalyze}
          />
        </div>

        {/* Analysis Panel */}
        {(analysis || analyzing) && (
          <div className="w-96 border-l bg-white overflow-auto">
            <Card className="m-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Analyse IA du Plan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyzing ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyse en cours...
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap text-sm">{analysis}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
