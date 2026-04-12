import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const rules = [
  "No violence — not even as a joke.",
  "No sexual content.",
  "No personal info or real names of others.",
  "No repeatedly targeting one specific person.",
  "No self-harm content — if you're struggling, please reach out to someone who can help.",
];

interface Props {
  visitorId: string;
  onAgree: () => void;
}

export default function GuidelinesScreen({ visitorId, onAgree }: Props) {
  const [submitting, setSubmitting] = useState(false);

  const handleAgree = async () => {
    setSubmitting(true);
    await supabase
      .from("guideline_agreements")
      .upsert({ visitor_id: visitorId }, { onConflict: "visitor_id" });
    onAgree();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex min-h-screen flex-col items-center justify-center bg-background px-6"
    >
      <div className="w-full max-w-sm">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 text-center text-lg font-semibold text-foreground"
        >
          community guidelines
        </motion.h2>

        <div className="mb-6 flex flex-col gap-2.5">
          {rules.map((rule, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="rounded-lg border bg-card px-4 py-2.5 text-xs leading-relaxed text-card-foreground"
            >
              {rule}
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-6 text-center text-[11px] leading-relaxed text-muted-foreground"
        >
          By continuing you agree to keep this space what it's meant to be — a
          place to breathe, not a place to harm.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          onClick={handleAgree}
          disabled={submitting}
          className="w-full rounded-xl bg-primary px-6 py-2.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {submitting ? "..." : "I agree — let me in"}
        </motion.button>
      </div>
    </motion.div>
  );
}
