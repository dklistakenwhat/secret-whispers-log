import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { MoodTag } from "@/lib/confessions";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (text: string, mood: MoodTag) => void;
  cooldownRemaining: number;
}

const PLACEHOLDERS = [
  "what's been on your mind?",
  "say the thing you can't say out loud",
  "it's just us here.",
  "no one will know it's you.",
  "get it off your chest.",
];

const MOODS: MoodTag[] = ["😭", "😂", "😤", "🌙", "💀"];
const MOOD_LABELS: Record<MoodTag, string> = {
  "😭": "sad",
  "😂": "funny",
  "😤": "angry",
  "🌙": "late night",
  "💀": "unhinged",
};

const MAX_CHARS = 500;

export default function ComposeOverlay({ open, onClose, onSubmit, cooldownRemaining }: Props) {
  const [text, setText] = useState("");
  const [mood, setMood] = useState<MoodTag>("🌙");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    if (open) {
      setText("");
      setMood("🌙");
    }
  }, [open]);

  const handleSubmit = useCallback(() => {
    if (!text.trim() || cooldownRemaining > 0) return;
    onSubmit(text.trim(), mood);
    onClose();
  }, [text, mood, cooldownRemaining, onSubmit, onClose]);

  const charRatio = text.length / MAX_CHARS;
  const circumference = 2 * Math.PI * 14;
  const strokeDashoffset = circumference * (1 - charRatio);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-50 flex flex-col bg-background"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-14 pb-4">
            <button onClick={onClose} className="text-muted-foreground">
              <X className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              {/* Char circle */}
              <svg width="36" height="36" className="rotate-[-90deg]">
                <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(var(--secondary))" strokeWidth="2.5" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke={charRatio > 0.9 ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="char-circle"
                  style={{ opacity: text.length > 0 ? 1 : 0 }}
                />
              </svg>
            </div>
          </div>

          {/* Text area */}
          <div className="flex-1 px-6 pt-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              autoFocus
              className="h-full w-full resize-none bg-transparent text-xl font-light leading-relaxed text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
              style={{ fontFamily: "inherit" }}
            />
          </div>

          {/* Mood selector + submit */}
          <div className="px-6 pb-10 pt-4">
            {/* Mood pills */}
            <div className="mb-5 flex items-center gap-2 overflow-x-auto no-scrollbar">
              {MOODS.map((m) => (
                <button
                  key={m}
                  onClick={() => setMood(m)}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${
                    mood === m
                      ? "glass-light ring-1 ring-foreground/20 scale-105"
                      : "bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  <span className="text-base">{m}</span>
                  <span className="text-xs">{MOOD_LABELS[m]}</span>
                </button>
              ))}
            </div>

            {/* Submit */}
            <AnimatePresence>
              {text.trim().length > 0 && (
                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={handleSubmit}
                  disabled={cooldownRemaining > 0}
                  className="w-full rounded-2xl bg-primary py-4 text-center text-sm font-semibold text-primary-foreground transition-all active:scale-[0.98] disabled:opacity-40"
                >
                  {cooldownRemaining > 0 ? `wait ${cooldownRemaining}s` : "confess"}
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
