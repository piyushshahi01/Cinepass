import { useState, useCallback } from "react";

const KEY = "cinepass_watchlist";

function load() {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function useWatchlist() {
  const [list, setList] = useState(load);

  const add = useCallback((movie) => {
    setList((prev) => {
      if (prev.some((m) => m.id === movie.id)) return prev;
      const next = [movie, ...prev];
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id) => {
    setList((prev) => {
      const next = prev.filter((m) => m.id !== id);
      save(next);
      return next;
    });
  }, []);

  const toggle = useCallback((movie) => {
    setList((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      const next = exists ? prev.filter((m) => m.id !== movie.id) : [movie, ...prev];
      save(next);
      return next;
    });
  }, []);

  const has = useCallback((id) => list.some((m) => m.id === id), [list]);

  return { list, add, remove, toggle, has };
}
