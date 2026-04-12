import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  onContinue: () => void;
}

const features = [
  {
    emoji: "🫧",
    title: "Anonymous",
    desc: "Nothing you post is tied to your name. Ever.",
  },
  {
    emoji: "🤝",
    title: "Mutual",
    desc: "Everyone here has something they needed to say. You're not alone.",
  },
  {
    emoji: "🗑️",
    title: "In your control",
    desc: "Edit, delete, or hide your confessions whenever you want.",
  },
];

export default function WelcomeScreen({ onContinue }: Props) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Breathing gradient background */}
      <div className="absolute inset-0 animate-breathe bg-gradient-to-br from-[hsl(var(--background))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))]" />

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 flex w-full max-w-md flex-col items-center px-6 py-12"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-4 h-20 w-20 overflow-hidden rounded-full border-2 border-border shadow-lg"
            >
              <img
                src="/logo.png"
                alt="Confessioni"
                className="h-full w-full object-cover"
              />
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-3 text-2xl font-bold tracking-tight text-foreground"
            >
              confessioni
            </motion.h1>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mb-10 max-w-xs text-center text-sm leading-relaxed text-muted-foreground"
            >
              Some things are too heavy to keep inside and too real to say out
              loud.
            </motion.p>

            {/* Feature cards */}
            <div className="mb-10 flex w-full flex-col gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.8 + i * 0.15 }}
                  className="rounded-xl border bg-card/80 px-4 py-3 backdrop-blur-sm"
                >
                  <p className="text-sm font-medium text-card-foreground">
                    {f.emoji} {f.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Enter button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.3 }}
              onClick={onContinue}
              className="rounded-xl bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-[0_0_20px_hsl(var(--primary)/0.2)] transition-all hover:shadow-[0_0_30px_hsl(var(--primary)/0.35)] hover:opacity-90"
            >
              Enter Confessioni →
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
