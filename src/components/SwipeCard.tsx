import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Flame } from "lucide-react";
import { Confession, MoodTag, Reaction } from "@/lib/confessions";
import MoodEffects, { getMoodGradient } from "./MoodEffects";
import ReportDialog from "./ReportDialog";
import ReactionParticles from "./ReactionParticles";
import { useTheme } from "@/contexts/ThemeContext";
import { playHeartSound, playReactionSound } from "@/lib/sounds";

interface Props {
  confession: Confession;
  displayNumber: number;
  reactions: Reaction[];
  commentCount: number;
  isTrending: boolean;
  onDoubleTap: () => void;
  onHold: () => void;
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
  isTrending, onDoubleTap, onHold, onReaction, myReactions,
}: Props) {
  const { soundEnabled } = useTheme();
  const [heartBurst, setHeartBurst] = useState(0);
  const [reactionBurst, setReactionBurst] = useState<{ emoji: string; count: number }>({ emoji: "", count: 0 });
  const [showReactionBar, setShowReactionBar] = useState(false);
  const lastTap = useRef(0);
  const holdTimer = useRef<NodeJS.Timeout | null>(null);
  const reactionTimer = useRef<NodeJS.Timeout | null>(null);
  const mood = confession.mood_tag as MoodTag | null;

  const reactionCounts = new Map<string, number>();
  reactions.forEach((r) => {
    reactionCounts.set(r.emoji, (reactionCounts.get(r.emoji) || 0) + 1);
  });

  const handleTouchStart = useCallback(() => {
    holdTimer.current = setTimeout(() => {
      onHold();
    }, 600);
    reactionTimer.current = setTimeout(() => {
      setShowReactionBar(true);
    }, 400);
  }, [onHold]);

  const handleTouchEnd = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    if (reactionTimer.current) clearTimeout(reactionTimer.current);

    const now = Date.now();
    if (now - lastTap.current < 300) {
      setHeartBurst((c) => c + 1);
      if (soundEnabled) playHeartSound();
      onDoubleTap();
    }
    lastTap.current = now;

    setTimeout(() => setShowReactionBar(false), 2500);
  }, [onDoubleTap, soundEnabled]);

  const handleReaction = (emoji: string) => {
    onReaction(emoji);
    setReactionBurst({ emoji, count: reactionBurst.count + 1 });
    if (soundEnabled) playReactionSound();
    setShowReactionBar(false);
  };

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-b ${getMoodGradient(mood)}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
    >
      <MoodEffects mood={mood} />

      {/* Heart burst particles */}
      <ReactionParticles emoji="❤️" trigger={heartBurst} />
      {reactionBurst.emoji && (
        <ReactionParticles emoji={reactionBurst.emoji} trigger={reactionBurst.count} />
      )}

      {/* Trending */}
      {isTrending && (
        <div className="absolute top-16 right-5 flex items-center gap-1 text-orange-400/60">
          <Flame className="h-5 w-5 my-[50px]" />
        </div>
      )}

      {/* Number */}
      <div className="absolute top-16 left-5">
        <span className="text-xs font-medium text-muted-foreground/60 mx-0 py-0 mb-0 text-left my-[10px]">{"\n"}#{displayNumber}</span>
      </div>

      {/* Mood tag */}
      {mood && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2">
          <span className="text-lg">{mood}</span>
        </div>
      )}

      {/* Confession text */}
      <div className="max-w-[85%] px-6">
        <p className="text-center text-xl font-light leading-relaxed text-foreground/90 sm:text-2xl">
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

      {/* Reaction bar */}
      <AnimatePresence>
        {showReactionBar && (
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.6, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute bottom-40 left-1/2 -translate-x-1/2 glass rounded-full px-3 py-2 flex items-center gap-1"
          >
            {REACTION_EMOJIS.map((emoji) => (
              <motion.button
                key={emoji}
                whileTap={{ scale: 1.5 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleReaction(emoji);
                }}
                className={`rounded-full px-2.5 py-1.5 text-xl transition-transform ${
                  myReactions.has(emoji) ? "bg-secondary" : ""
                }`}
              >
                {emoji}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom bar */}
      <div className="absolute bottom-20 left-0 right-0 flex items-end justify-between px-6">
        <div className="flex flex-wrap gap-1.5">
          {REACTION_EMOJIS.filter((e) => reactionCounts.has(e)).map((emoji) => (
            <motion.button
              key={emoji}
              whileTap={{ scale: 1.3 }}
              onClick={() => handleReaction(emoji)}
              className={`glass-light flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-all ${
                myReactions.has(emoji) ? "ring-1 ring-foreground/20" : ""
              }`}
            >
              <span className="text-sm">{emoji}</span>
              <span className="text-muted-foreground">{reactionCounts.get(emoji)}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ReportDialog confessionId={confession.id} />
          <button
            onClick={onHold}
            className="flex items-center gap-1 text-xs text-muted-foreground/60"
          >
            <MessageCircle className="h-4 w-4" />
            {commentCount > 0 && <span>{commentCount}</span>}
          </button>
        </div>
      </div>
    </div>
  );
}
