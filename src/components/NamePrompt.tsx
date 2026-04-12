import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useVisitor } from "@/contexts/VisitorContext";

export default function NamePrompt() {
  const { login } = useVisitor();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 40) {
      setError("Name: 1-40 characters");
      return;
    }
    if (password.length < 4) {
      setError("Password: at least 4 characters");
      return;
    }
    setSubmitting(true);
    setError("");
    const result = await login(trimmed, password);
    if (result.banned) {
      const expiry = result.is_permanent
        ? "You are permanently banned."
        : result.expires_at
          ? `Banned until ${new Date(result.expires_at).toLocaleString()}.`
          : "You are banned.";
      setError(`${expiry} Reason: ${result.reason || "No reason given"}`);
    } else if (result.wrongPassword) {
      setError("Wrong password for this name.");
    } else if (!result.success) {
      setError("something went wrong. try again.");
    }
    setSubmitting(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs text-center">
        <p className="mb-6 text-sm text-muted-foreground">
          pick a name & set a password
        </p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. AK, anon42..."
          maxLength={40}
          autoFocus
          className="w-full rounded-lg border bg-card px-4 py-3 text-center text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <div className="relative mt-3">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password (min 4 chars)"
            className="w-full rounded-lg border bg-card px-4 py-3 text-center text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {error && (
          <p className="mt-2 text-xs text-destructive">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting || !name.trim() || password.length < 4}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "..." : "continue"}
        </button>
        <p className="mt-4 text-[11px] text-muted-foreground">
          returning? enter the same name & password.
        </p>
      </form>
    </div>
  );
}
