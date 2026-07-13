import { useState, useEffect } from "react";
import { searchAll } from "../api/searchService";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Reset page when query changes
  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setOpen(false);
      setLoading(false);
      setHasMore(false);
      return;
    }

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await searchAll(query, page, 8, { signal: abortController.signal });
        const newResults = data.data.results;
        setHasMore(data.data.hasMore);
        
        if (page === 1) {
          setResults(newResults);
        } else {
          setResults(prev => {
            if (!prev) return newResults;
            return {
              users: [...prev.users, ...newResults.users],
              charities: [...prev.charities, ...newResults.charities],
              projects: [...prev.projects, ...newResults.projects],
              products: [...prev.products, ...newResults.products],
              totalCount: prev.totalCount + newResults.totalCount
            };
          });
        }
        setOpen(true);
      } catch (err) {
        if (err.name !== "CanceledError" && err.message !== "canceled") {
          setError(err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }, page === 1 ? 400 : 0);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query, page]);

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  };

  return { query, setQuery, results, loading, error, open, setOpen, hasMore, loadMore };
}
