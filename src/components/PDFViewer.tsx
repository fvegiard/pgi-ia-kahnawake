"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Sparkles, Loader2 } from "lucide-react";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  filePath: string;
  fileName: string;
  onAnalyze?: (imageData: string, pageNum: number) => void;
}

export function PDFViewer({ filePath, fileName, onAnalyze }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [analyzing, setAnalyzing] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setPageNumber((prev) => Math.min(prev + 1, numPages));
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  const capturePageAsImage = useCallback(async () => {
    setAnalyzing(true);
    try {
      // Get the canvas element from the rendered page
      const canvas = document.querySelector(".react-pdf__Page__canvas") as HTMLCanvasElement;
      if (canvas && onAnalyze) {
        const imageData = canvas.toDataURL("image/png");
        onAnalyze(imageData, pageNumber);
      }
    } finally {
      setAnalyzing(false);
    }
  }, [pageNumber, onAnalyze]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b bg-white">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {pageNumber} / {numPages}
          </span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={zoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm w-16 text-center">{Math.round(scale * 100)}%</span>
          <Button variant="outline" size="sm" onClick={zoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {onAnalyze && (
          <Button onClick={capturePageAsImage} disabled={analyzing} className="gap-2">
            {analyzing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Analyser avec IA
          </Button>
        )}
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4 flex justify-center">
        <Document
          file={filePath}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          }
          error={
            <div className="text-red-500 p-4">
              Erreur de chargement du PDF. Vérifiez le chemin du fichier.
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>

      {/* File info */}
      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500 truncate">
        {fileName}
      </div>
    </div>
  );
}
