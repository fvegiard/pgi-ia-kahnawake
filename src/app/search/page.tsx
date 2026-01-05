"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, CheckSquare, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  id: string;
  type: "document" | "task" | "annotation";
  title: string;
  snippet: string;
  score: number;
  metadata?: Record<string, unknown>;
}

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
    handleSearch(query);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "document":
        return <FileText className="h-5 w-5 text-blue-500" />;
      case "task":
        return <CheckSquare className="h-5 w-5 text-green-500" />;
      case "annotation":
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document":
        return "bg-blue-100 text-blue-700";
      case "task":
        return "bg-green-100 text-green-700";
      case "annotation":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-500" />
          <h1 className="text-3xl font-bold">AI Search</h1>
        </div>
        <p className="text-gray-500">
          Search across all documents, tasks, and annotations with intelligent matching
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for floor plans, electrical diagrams, theatre specifications..."
            className="pl-12 pr-24 h-14 text-lg"
          />
          <Button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
          </Button>
        </div>
      </form>

      {/* Quick Searches */}
      <div className="flex flex-wrap gap-2 justify-center">
        <span className="text-sm text-gray-500">Try:</span>
        {["floor plan", "electrical", "theatre", "mechanical", "roof details"].map((term) => (
          <Button
            key={term}
            variant="outline"
            size="sm"
            onClick={() => {
              setQuery(term);
              router.push(`/search?q=${encodeURIComponent(term)}`);
              handleSearch(term);
            }}
          >
            {term}
          </Button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Found {results.length} result{results.length !== 1 ? "s" : ""} for &quot;{initialQuery || query}&quot;
            </p>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No results found</h3>
                <p className="text-gray-500">Try different keywords or import more documents</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {results.map((result) => (
                <Card key={`${result.type}-${result.id}`} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">{getTypeIcon(result.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Link
                            href={
                              result.type === "document"
                                ? `/documents/${result.id}`
                                : result.type === "task"
                                ? `/tasks/${result.id}`
                                : "#"
                            }
                            className="font-medium hover:text-blue-600 truncate"
                          >
                            {result.title}
                          </Link>
                          <Badge className={getTypeColor(result.type)}>{result.type}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{result.snippet}</p>
                        {result.metadata ? (
                          <div className="flex gap-2 mt-2">
                            {result.metadata.category ? (
                              <Badge variant="outline">{String(result.metadata.category)}</Badge>
                            ) : null}
                            {result.metadata.revision ? (
                              <Badge variant="outline">Rev. {String(result.metadata.revision)}</Badge>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Score</div>
                        <div className="font-medium">{result.score.toFixed(1)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
