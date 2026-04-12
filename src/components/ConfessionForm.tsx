import { useState, useEffect, useCallback } from "react";
import { Send, Clock } from "lucide-react";

interface Props {
  onSubmit: (text: string) => void;
}

const COOLDOWN_SECONDS = 30;

export default function ConfessionForm({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 500 || cooldown > 0) return;
    onSubmit(trimmed);
    setText("");
    setCooldown(COOLDOWN_SECONDS);
  }, [text, cooldown, onSubmit]);

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="rounded-lg border bg-card p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="spill your confession anonymously..."
          maxLength={500}
          rows={3}
          className="w-full resize-none bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {text.length}/500
          </span>
          {cooldown > 0 ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              wait {cooldown}s
            </span>
          ) : (
            <button
              type="submit"
              disabled={!text.trim()}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
              Confess
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
