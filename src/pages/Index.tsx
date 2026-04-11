import { useState, useEffect, useCallback, useMemo } from "react";
import { MessageSquare, Search } from "lucide-react";
import ConfessionForm from "@/components/ConfessionForm";
import ConfessionCard from "@/components/ConfessionCard";
import {
  getConfessions,
  addConfession,
  likeConfession,
  Confession,
} from "@/lib/confessions";

export default function Index() {
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const refresh = useCallback(async () => {
    const data = await getConfessions();
    setConfessions(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSubmit = async (text: string) => {
    await addConfession(text);
    refresh();
  };

  const handleLike = async (id: string) => {
    await likeConfession(id);
    refresh();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return confessions;
    // Support searching by #number or by text content
    const numMatch = q.match(/^#?(\d+)$/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      return confessions.filter((c) => c.confession_number === num);
    }
    return confessions.filter((c) => c.text.toLowerCase().includes(q));
  }, [confessions, search]);

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
          <MessageSquare className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          confessions
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          anonymous · numbered · unfiltered
        </p>
      </div>

      {/* Form */}
      <div className="mb-10">
        <ConfessionForm onSubmit={handleSubmit} />
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2.5">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search by #number or keyword..."
            className="w-full bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>
      </div>

      {/* Count */}
      <p className="mb-4 text-xs font-medium text-muted-foreground">
        {search
          ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`
          : `${confessions.length} confession${confessions.length !== 1 ? "s" : ""}`}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-sm text-muted-foreground">
          {search ? "no confessions match your search." : "no confessions yet. be the first."}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((c) => (
            <ConfessionCard key={c.id} confession={c} onLike={handleLike} />
          ))}
        </div>
      )}
    </div>
  );
}
