import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Flame, Share2, SmilePlus } from "lucide-react";
import { Confession, MoodTag, Reaction } from "@/lib/confessions";
import MoodEffects, { getMoodGradient } from "./MoodEffects";
import ReportDialog from "./ReportDialog";
import ReactionParticles from "./ReactionParticles";
import { useTheme } from "@/contexts/ThemeContext";
import { playHeartSound, playReactionSound } from "@/lib/sounds";
import { toast } from "sonner";

interface Props {
  confession: Confession;
  displayNumber: number;
  reactions: Reaction[];
  commentCount: number;
  isTrending: boolean;
  onDoubleTap: () => void;
  onOpenComments: () => void;
  onReaction: (emoji: string) => void;
  myReactions: Set<string>;
}

const REACTION_EMOJIS = ["💀", "❤️", "😭", "🫂", "😂"];

function getTimeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function SwipeCard({
  confession, displayNumber, reactions, commentCount,
  isTrending, onDoubleTap, onOpenComments, onReaction, myReactions,
}: Props) {
  const { soundEnabled } = useTheme();
  const [heartBurst, setHeartBurst] = useState(0);
  const [reactionBurst, setReactionBurst] = useState<{ emoji: string; count: number }>({ emoji: "", count: 0 });
  const [showReactionBar, setShowReactionBar] = useState(false);
  const lastTap = useRef(0);
  const mood = confession.mood_tag as MoodTag | null;

  const reactionCounts = new Map<string, number>();
  reactions.forEach((r) => {
    reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) || 0) + 1);
  });

  // Only double-tap on the card body for heart
  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      setHeartBurst((c) => c + 1);
      if (soundEnabled) playHeartSound();
      onDoubleTap();
    }
    lastTap.current = now;
  }, [onDoubleTap, soundEnabled]);

  const handleReaction = (emoji: string) => {
    onReaction(emoji);
    setReactionBurst({ emoji, count: reactionBurst.count + 1 });
    if (soundEnabled) playReactionSound();
    setShowReactionBar(false);
  };

  const handleShare = async () => {
    const text = `"${confession.text}" — confession #${displayNumber}`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
      } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-b ${getMoodGradient(mood)}`}
      onClick={handleTap}
    >
      <MoodEffects mood={mood} />

      <ReactionParticles emoji="❤️" trigger={heartBurst} />
      {reactionBurst.emoji && (
        <ReactionParticles emoji={reactionBurst.emoji} trigger={reactionBurst.count} />
      )}

      {/* Top info row */}
      <div className="absolute top-20 left-5 right-5 flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground/60">#{displayNumber}</span>
        {isTrending && (
          <div className="flex items-center gap-1 text-orange-400/60">
            <Flame className="h-4 w-4" />
            <span className="text-[10px]">trending</span>
          </div>
        )}
      </div>

      {/* Mood tag */}
      {mood && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2">
          <span className="text-lg">{mood}</span>
        </div>
      )}

      {/* Confession text */}
      <div className="max-w-[85%] px-4 sm:px-6">
        <p className="text-center text-lg font-light leading-relaxed text-foreground/90 sm:text-2xl">
          {confession.text}
        </p>
        <p className="mt-4 text-center text-xs text-muted-foreground/50">
          {getTimeAgo(new Date(confession.created_at).getTime())}
        </p>
      </div>

      {/* Heart burst animation */}
      <AnimatePresence>
        {heartBurst > 0 && (
          <motion.div
            key={heartBurst}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute text-6xl"
          >
            ❤️
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction picker popup */}
      <AnimatePresence>
        {showReactionBar && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-36 sm:bottom-40 left-1/2 -translate-x-1/2 glass rounded-full px-3 py-2 flex items-center gap-1 z-20"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 1.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction(emoji);
                }}
                className={`rounded-full px-2 py-1.5 text-lg sm:text-xl transition-transform ${
                  myReactions.has(emoji) ? "bg-secondary" : ""
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom section */}
      <div className="absolute bottom-16 sm:bottom-20 left-0 right-0 px-5 sm:px-6 space-y-3">
        {/* Existing reaction counts */}
        {REACTION_EMOJIS.some((e) => reactionCounts.has(e)) && (
          <div className="flex flex-wrap gap-1.5">
            {REACTION_EMOJIS.filter((e) => reactionCounts.has(e)).map((emoji) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 1.3 }}
                onClick={(e) => { e.stopPropagation(); handleReaction(emoji); }}
                className={`glass-light flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-all ${
                  myReactions.has(emoji) ? "ring-1 ring-foreground/20" : ""
                }`}
              >
                <span className="text-sm">{emoji}</span>
                <span className="text-muted-foreground">{reactionCounts.get(emoji)}</span>
              </motion.button>
            ))}
          </div>
        )}

        {/* Action buttons row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* React button */}
            <button
              onClick={(e) => { e.stopPropagation(); setShowReactionBar((s) => !s); }}
              className="flex items-center gap-1.5 glass-light rounded-full px-3 py-1.5 text-xs text-muted-foreground/70 hover:text-foreground/80 transition-colors"
            >
              <SmilePlus className="h-4 w-4" />
              <span>react</span>
            </button>

            {/* Comments button */}
            <button
              onClick={(e) => { e.stopPropagation(); onOpenComments(); }}
              className="flex items-center gap-1.5 glass-light rounded-full px-3 py-1.5 text-xs text-muted-foreground/70 hover:text-foreground/80 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {commentCount > 0 && <span>{commentCount}</span>}
            </button>

            {/* Share button */}
            <button
              onClick={(e) => { e.stopPropagation(); handleShare(); }}
              className="flex items-center gap-1.5 glass-light rounded-full px-3 py-1.5 text-xs text-muted-foreground/70 hover:text-foreground/80 transition-colors"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <ReportDialog confessionId={confession.id} />
        </div>
      </div>
    </div>
  );
}
