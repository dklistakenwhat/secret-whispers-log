import { useState } from "react";
import { useVisitor } from "@/contexts/VisitorContext";

export default function NamePrompt() {
  const { login } = useVisitor();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 20) {
      setError("1-20 characters");
      return;
    }
    setSubmitting(true);
    setError("");
    const ok = await login(trimmed);
    if (!ok) {
      setError("something went wrong. try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs text-center">
        <p className="mb-6 text-sm text-muted-foreground">
          pick a name or initials
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AK, anon42..."
          maxLength={20}
          autoFocus
          className="w-full rounded-lg border bg-card px-4 py-3 text-center text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim()}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "..." : "continue"}
        </button>
        <p className="mt-4 text-[11px] text-muted-foreground">
          returning? enter the same name to get back in.
        </p>
      </form>
    </div>
  );
}
