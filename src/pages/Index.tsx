import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { Pencil, User, Shield, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import ComposeOverlay from "@/components/ComposeOverlay";
import CommentsDrawer from "@/components/CommentsDrawer";
import {
  getConfessions,
  addConfession,
  toggleReaction,
  getAllReactions,
  getAllCommentCounts,
  Confession,
  Reaction,
  MoodTag,
} from "@/lib/confessions";
import { useVisitor } from "@/contexts/VisitorContext";

const COOLDOWN_SECONDS = 30;

export default function Index() {
  const { visitor, logout, isAdmin } = useVisitor();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [reactions, setReactions] = useState<Map<string, Reaction[]>>(new Map());
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [composeOpen, setComposeOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsConfessionId, setCommentsConfessionId] = useState("");
  const [swipeCount, setSwipeCount] = useState(0);
  const [showBreakMsg, setShowBreakMsg] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showNav, setShowNav] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const touchStartX = useRef(0);
  const swiping = useRef(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const refresh = useCallback(async () => {
    const data = await getConfessions();
    setConfessions(data);
    if (data.length > 0) {
      const ids = data.map((c) => c.id);
      const [rxns, counts] = await Promise.all([
        getAllReactions(ids),
        getAllCommentCounts(ids),
      ]);
      setReactions(rxns);
      setCommentCounts(counts);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Algorithm: rank confessions
  const ranked = useMemo(() => {
    const now = Date.now();
    const scored = confessions.map((c) => {
      const rxns = reactions.get(c.id) || [];
      const cmts = commentCounts.get(c.id) || 0;
      // Weight reactions by type
      let reactionScore = 0;
      rxns.forEach((r) => {
        const weight: Record<string, number> = { "❤️": 2, "😭": 1.5, "🫂": 1.5, "😂": 1, "💀": 1.2 };
        reactionScore += weight[r.emoji] || 1;
      });
      const commentScore = cmts * 2;
      const ageHours = (now - new Date(c.created_at).getTime()) / 3600000;
      const recencyBoost = ageHours < 24 ? Math.max(0, 5 - ageHours * 0.2) : 0;
      return { confession: c, score: reactionScore + commentScore + recencyBoost + c.likes };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [confessions, reactions, commentCounts]);

  // Top 10% threshold for trending
  const trendingThreshold = useMemo(() => {
    if (ranked.length < 3) return Infinity;
    const idx = Math.max(1, Math.floor(ranked.length * 0.1));
    return ranked[idx - 1]?.score ?? Infinity;
  }, [ranked]);

  // Display numbers (oldest = #1)
  const displayNumbers = useMemo(() => {
    const map = new Map<string, number>();
    const sorted = [...confessions].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    sorted.forEach((c, i) => map.set(c.id, i + 1));
    return map;
  }, [confessions]);

  const current = ranked[currentIndex];

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartX.current = e.touches[0].clientX;
    swiping.current = true;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!swiping.current) return;
    swiping.current = false;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    const dx = touchStartX.current - e.changedTouches[0].clientX;

    // Horizontal swipe left = skip
    if (Math.abs(dx) > Math.abs(dy) && dx > 60) {
      goNext();
      return;
    }

    // Vertical swipe
    if (dy > 60) goNext();
    else if (dy < -60) goPrev();
  };

  // Mouse wheel for desktop
  const handleWheel = useCallback((e: WheelEvent) => {
    if (composeOpen || commentsOpen) return;
    if (e.deltaY > 30) goNext();
    else if (e.deltaY < -30) goPrev();
  }, [composeOpen, commentsOpen, ranked.length, currentIndex]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  const goNext = () => {
    setCurrentIndex((i) => {
      const next = Math.min(i + 1, ranked.length - 1);
      if (next !== i) {
        setSwipeCount((c) => {
          const newC = c + 1;
          if (newC === 10) {
            setShowBreakMsg(true);
            setTimeout(() => setShowBreakMsg(false), 4000);
          }
          return newC;
        });
      }
      return next;
    });
  };

  const goPrev = () => {
    setCurrentIndex((i) => Math.max(i - 1, 0));
  };

  const handleSubmit = async (text: string, mood: MoodTag) => {
    await addConfession(text, visitor?.id, mood);
    setCooldown(COOLDOWN_SECONDS);
    refresh();
  };

  const handleDoubleTap = async () => {
    if (!visitor || !current) return;
    await toggleReaction(current.confession.id, visitor.id, "❤️");
    refresh();
  };

  const handleReaction = async (emoji: string) => {
    if (!visitor || !current) return;
    await toggleReaction(current.confession.id, visitor.id, emoji);
    refresh();
  };

  const openComments = () => {
    if (!current) return;
    setCommentsConfessionId(current.confession.id);
    setCommentsOpen(true);
  };

  const myReactionsForCurrent = useMemo(() => {
    if (!visitor || !current) return new Set<string>();
    const rxns = reactions.get(current.confession.id) || [];
    return new Set(rxns.filter((r) => r.visitor_id === visitor.id).map((r) => r.emoji));
  }, [visitor, current, reactions]);

  const progress = ranked.length > 0 ? (currentIndex + 1) / ranked.length : 0;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <span className="text-sm text-muted-foreground">loading...</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background select-none">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-0.5 bg-secondary">
        <motion.div
          className="h-full bg-foreground/30"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Nav toggle */}
      <button
        onClick={() => setShowNav((s) => !s)}
        className="absolute top-12 right-5 z-30 glass rounded-full p-2"
      >
        <User className="h-4 w-4 text-foreground/60" />
      </button>

      {/* Nav dropdown */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-24 right-5 z-30 glass rounded-2xl p-3 min-w-[160px]"
          >
            <Link
              to="/dashboard"
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary"
              onClick={() => setShowNav(false)}
            >
              <User className="h-3.5 w-3.5" /> my confessions
            </Link>
            {isAdmin && (
              <>
                <Link
                  to="/admin/reports"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary"
                  onClick={() => setShowNav(false)}
                >
                  <Shield className="h-3.5 w-3.5" /> reports
                </Link>
                <Link
                  to="/admin/panel"
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary"
                  onClick={() => setShowNav(false)}
                >
                  <Shield className="h-3.5 w-3.5" /> admin
                </Link>
              </>
            )}
            <button
              onClick={() => { logout(); setShowNav(false); }}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary"
            >
              <LogOut className="h-3.5 w-3.5" /> log out
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main card area */}
      {ranked.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground">no confessions yet.</p>
          <p className="mt-2 text-xs text-muted-foreground/60">tap ✏️ to be the first</p>
        </div>
      ) : current ? (
        <div
          className="h-full w-full"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.confession.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="h-full w-full"
            >
              <SwipeCard
                confession={current.confession}
                displayNumber={displayNumbers.get(current.confession.id) || 0}
                reactions={reactions.get(current.confession.id) || []}
                commentCount={commentCounts.get(current.confession.id) || 0}
                isTrending={current.score >= trendingThreshold && ranked.length >= 3}
                onDoubleTap={handleDoubleTap}
                onHold={openComments}
                onReaction={handleReaction}
                myReactions={myReactionsForCurrent}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      ) : null}

      {/* "You've been here a while" message */}
      <AnimatePresence>
        {showBreakMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 bottom-32 z-40 mx-auto max-w-[280px] rounded-2xl glass px-5 py-4 text-center"
          >
            <p className="text-sm text-foreground/80">
              you've been here a while.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              hope you found something that helped 🫧
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating compose button */}
      <motion.button
        onClick={() => setComposeOpen(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-6 z-40 glass flex h-14 w-14 items-center justify-center rounded-full shadow-lg shadow-black/20 ring-1 ring-foreground/10"
      >
        <Pencil className="h-5 w-5 text-foreground" />
      </motion.button>

      {/* Compose overlay */}
      <ComposeOverlay
        open={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSubmit={handleSubmit}
        cooldownRemaining={cooldown}
      />

      {/* Comments drawer */}
      <CommentsDrawer
        confessionId={commentsConfessionId}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </div>
  );
}
