import { useState } from "react";
import { Send } from "lucide-react";

interface Props {
  onSubmit: (text: string) => void;
}

export default function ConfessionForm({ onSubmit }: Props) {
  const [text, setText] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 500) return;
    onSubmit(trimmed);
    setText("");
  };

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
          <button
            type="submit"
            disabled={!text.trim()}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            Confess
          </button>
        </div>
      </div>
    </form>
  );
}
