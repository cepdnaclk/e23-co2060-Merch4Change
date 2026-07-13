import { useState, useEffect } from "react";
import { searchAll } from "../api/searchService";

export function useSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults(null);
      setOpen(false);
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await searchAll(query, { signal: abortController.signal });
        setResults(data.data.results);
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
    }, 400);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  return { query, setQuery, results, loading, error, open, setOpen };
}
