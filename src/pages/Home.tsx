import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronRight, Palette, Volume2, VolumeX } from "lucide-react";
import { useTheme, THEMES } from "@/contexts/ThemeContext";
import { useState } from "react";

export default function Home() {
  const navigate = useNavigate();
  const { theme, setTheme, soundEnabled, toggleSound } = useTheme();
  const [showThemes, setShowThemes] = useState(false);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background overflow-hidden px-6">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[300px] w-[300px] rounded-full bg-primary/[0.04] blur-[100px]" />
      </div>

      {/* Top bar */}
      <div className="absolute top-14 left-5 right-5 z-10 flex items-center justify-between">
        <button
          onClick={() => setShowThemes((s) => !s)}
          className="glass rounded-full p-2.5"
        >
          <Palette className="h-4 w-4 text-foreground/60" />
        </button>
        <button
          onClick={toggleSound}
          className="glass rounded-full p-2.5"
        >
          {soundEnabled ? (
            <Volume2 className="h-4 w-4 text-foreground/60" />
          ) : (
            <VolumeX className="h-4 w-4 text-foreground/40" />
          )}
        </button>
      </div>

      {/* Theme picker */}
      {showThemes && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-28 left-5 z-20 glass rounded-2xl p-2 min-w-[150px]"
        >
          {THEMES.map((t) => (
            <button
              key={t.name}
              onClick={() => { setTheme(t.name); setShowThemes(false); }}
              className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs transition-all ${
                theme.name === t.name ? "bg-primary/15 text-foreground" : "text-foreground/70 hover:bg-secondary/50"
              }`}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
          confessions
        </h1>
        <p className="mt-4 text-base text-muted-foreground font-light max-w-[280px] mx-auto leading-relaxed">
          say the things you can't say out loud. completely anonymous.
        </p>
      </motion.div>

      {/* Tags */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-8 flex items-center gap-4 text-xs text-muted-foreground/60"
      >
        <span>anonymous</span>
        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
        <span>no judgement</span>
        <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
        <span>just us</span>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/confessions")}
        className="mt-12 flex items-center gap-2 rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-all active:scale-95"
      >
        start reading
        <ChevronRight className="h-4 w-4" />
      </motion.button>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-10 text-[10px] text-muted-foreground/30"
      >
        swipe through confessions · react · share yours
      </motion.p>
    </div>
  );
}
