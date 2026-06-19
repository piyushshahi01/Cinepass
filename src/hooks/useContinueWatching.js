import { useState, useCallback } from "react";

const KEY = "cinepass_continue";

// Seed with some demo data so the section isn't empty on first load
const DEMO = [
  { id: 533535, title: "Deadpool & Wolverine", progress: 0.42, genre: "Action", poster_path: "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg" },
  { id: 945961, title: "Alien: Romulus",        progress: 0.71, genre: "Horror", poster_path: "/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg" },
  { id: 1022789, title: "Inside Out 2",         progress: 0.28, genre: "Animation", poster_path: "/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg" },
];

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || "null");
    return stored || DEMO;
  } catch { return DEMO; }
}

function save(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function useContinueWatching() {
  const [list, setList] = useState(load);

  const updateProgress = useCallback((movie, progress) => {
    setList((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      let next;
      if (exists) {
        next = prev.map((m) => m.id === movie.id ? { ...m, progress } : m);
      } else {
        next = [{ ...movie, progress }, ...prev].slice(0, 10);
      }
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

  return { list, updateProgress, remove };
}
