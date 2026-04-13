import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pencil, User, Shield, LogOut, Home, Volume2, VolumeX, Palette } from "lucide-react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import SwipeCard from "@/components/SwipeCard";
import ComposeOverlay from "@/components/ComposeOverlay";
import CommentsDrawer from "@/components/CommentsDrawer";
import {
  getConfessions, addConfession, toggleReaction,
  getAllReactions, getAllCommentCounts,
  Confession, Reaction, MoodTag,
} from "@/lib/confessions";
import { useVisitor } from "@/contexts/VisitorContext";
import { useTheme, THEMES } from "@/contexts/ThemeContext";
import { playSwipeSound } from "@/lib/sounds";

const COOLDOWN_SECONDS = 30;
const SWIPE_THRESHOLD = 80;

export default function Index() {
  const { visitor, logout, isAdmin } = useVisitor();
  const { theme, setTheme, soundEnabled, toggleSound } = useTheme();
  const navigate = useNavigate();
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
  const [showThemes, setShowThemes] = useState(false);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

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
      const [rxns, counts] = await Promise.all([getAllReactions(ids), getAllCommentCounts(ids)]);
      setReactions(rxns);
      setCommentCounts(counts);
    }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const ranked = useMemo(() => {
    const now = Date.now();
    const scored = confessions.map((c) => {
      const rxns = reactions.get(c.id) || [];
      const cmts = commentCounts.get(c.id) || 0;
      let reactionScore = 0;
      rxns.forEach((r) => {
        const weight: Record<string, number> = { "❤️": 2, "😭": 1.5, "🫂": 1.5, "😂": 1, "💀": 1.2 };
        reactionScore += weight[r.emoji] || 1;
      });
      const ageHours = (now - new Date(c.created_at).getTime()) / 3600000;
      const recencyBoost = ageHours < 24 ? Math.max(0, 5 - ageHours * 0.2) : 0;
      return { confession: c, score: reactionScore + cmts * 2 + recencyBoost + c.likes };
    });
    scored.sort((a, b) => b.score - a.score);
    return scored;
  }, [confessions, reactions, commentCounts]);

  const trendingThreshold = useMemo(() => {
    if (ranked.length < 3) return Infinity;
    return ranked[Math.max(1, Math.floor(ranked.length * 0.1)) - 1]?.score ?? Infinity;
  }, [ranked]);

  const displayNumbers = useMemo(() => {
    const map = new Map<string, number>();
    [...confessions].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .forEach((c, i) => map.set(c.id, i + 1));
    return map;
  }, [confessions]);

  const current = ranked[currentIndex];

  const goNext = useCallback(() => {
    setCurrentIndex((i) => {
      const next = Math.min(i + 1, ranked.length - 1);
      if (next !== i) {
        setDirection(1);
        if (soundEnabled) playSwipeSound();
        setSwipeCount((c) => {
          if (c + 1 === 10) { setShowBreakMsg(true); setTimeout(() => setShowBreakMsg(false), 4000); }
          return c + 1;
        });
      }
      return next;
    });
  }, [ranked.length, soundEnabled]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => {
      if (i > 0) {
        setDirection(-1);
        if (soundEnabled) playSwipeSound();
      }
      return Math.max(i - 1, 0);
    });
  }, [soundEnabled]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeY = Math.abs(offset.y);
    const swipeX = Math.abs(offset.x);

    if (swipeX > swipeY && offset.x < -SWIPE_THRESHOLD) {
      goNext();
      return;
    }
    if (swipeY > SWIPE_THRESHOLD || Math.abs(velocity.y) > 300) {
      if (offset.y < 0) goNext();
      else goPrev();
    }
  }, [goNext, goPrev]);

  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);
  const handleWheel = useCallback((e: WheelEvent) => {
    if (composeOpen || commentsOpen) return;
    if (wheelTimeout.current) return;
    if (e.deltaY > 30) goNext();
    else if (e.deltaY < -30) goPrev();
    wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 300);
  }, [composeOpen, commentsOpen, goNext, goPrev]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: true });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

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

  const variants = {
    enter: (dir: number) => ({
      y: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: { y: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      y: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.9,
    }),
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <motion.span
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-sm text-muted-foreground"
        >
          loading...
        </motion.span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background select-none">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-0.5 bg-secondary">
        <motion.div className="h-full bg-foreground/30" animate={{ width: `${progress * 100}%` }} transition={{ duration: 0.3 }} />
      </div>

      {/* Top buttons - safe area aware */}
      <div className="absolute top-4 sm:top-6 left-4 sm:left-5 z-30 flex items-center gap-2">
        <button onClick={() => navigate("/")} className="glass rounded-full p-2">
          <Home className="h-4 w-4 text-foreground/60" />
        </button>
        <button onClick={() => setShowThemes((s) => !s)} className="glass rounded-full p-2">
          <Palette className="h-4 w-4 text-foreground/60" />
        </button>
        <button onClick={toggleSound} className="glass rounded-full p-2">
          {soundEnabled ? <Volume2 className="h-4 w-4 text-foreground/60" /> : <VolumeX className="h-4 w-4 text-foreground/40" />}
        </button>
      </div>

      <button onClick={() => setShowNav((s) => !s)} className="absolute top-4 sm:top-6 right-4 sm:right-5 z-30 glass rounded-full p-2">
        <User className="h-4 w-4 text-foreground/60" />
      </button>

      {/* Theme picker dropdown */}
      <AnimatePresence>
        {showThemes && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 sm:top-20 left-4 sm:left-5 z-40 glass rounded-2xl p-3 min-w-[160px]"
          >
            {THEMES.map((t) => (
              <button
                key={t.name}
                onClick={() => { setTheme(t.name); setShowThemes(false); }}
                className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs transition-all ${
                  theme.name === t.name ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/50"
                }`}
              >
                <span>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nav dropdown */}
      <AnimatePresence>
        {showNav && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 sm:top-20 right-4 sm:right-5 z-30 glass rounded-2xl p-3 min-w-[160px]"
          >
            <Link to="/dashboard" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary" onClick={() => setShowNav(false)}>
              <User className="h-3.5 w-3.5" /> my confessions
            </Link>
            {isAdmin && (
              <>
                <Link to="/admin/reports" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary" onClick={() => setShowNav(false)}>
                  <Shield className="h-3.5 w-3.5" /> reports
                </Link>
                <Link to="/admin/panel" className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary" onClick={() => setShowNav(false)}>
                  <Shield className="h-3.5 w-3.5" /> admin
                </Link>
              </>
            )}
            <button onClick={() => { logout(); setShowNav(false); }} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-xs text-foreground/80 hover:bg-secondary">
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
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={current.confession.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="h-full w-full cursor-grab active:cursor-grabbing"
            style={{ touchAction: "none" }}
          >
            <SwipeCard
              confession={current.confession}
              displayNumber={displayNumbers.get(current.confession.id) || 0}
              reactions={reactions.get(current.confession.id) || []}
              commentCount={commentCounts.get(current.confession.id) || 0}
              isTrending={current.score >= trendingThreshold && ranked.length >= 3}
              onDoubleTap={handleDoubleTap}
              onOpenComments={openComments}
              onReaction={handleReaction}
              myReactions={myReactionsForCurrent}
            />
          </motion.div>
        </AnimatePresence>
      ) : null}

      {/* Break message */}
      <AnimatePresence>
        {showBreakMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-x-0 bottom-32 z-40 mx-auto max-w-[280px] rounded-2xl glass px-5 py-4 text-center"
          >
            <p className="text-sm text-foreground/80">you've been here a while.</p>
            <p className="mt-1 text-xs text-muted-foreground">hope you found something that helped 🫧</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose button */}
      <motion.button
        onClick={() => setComposeOpen(true)}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 sm:bottom-8 right-5 sm:right-6 z-40 glass h-14 w-14 rounded-full shadow-lg shadow-black/20 ring-1 ring-foreground/10 flex items-center justify-center mx-[50px]"
      >
        <Pencil className="h-5 w-5 text-foreground" />
      </motion.button>

      <ComposeOverlay open={composeOpen} onClose={() => setComposeOpen(false)} onSubmit={handleSubmit} cooldownRemaining={cooldown} />
      <CommentsDrawer confessionId={commentsConfessionId} open={commentsOpen} onClose={() => setCommentsOpen(false)} />
    </div>
  );
}
