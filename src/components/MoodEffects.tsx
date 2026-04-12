import { useMemo } from "react";
import { MoodTag } from "@/lib/confessions";

interface Props {
  mood?: MoodTag | null;
}

function SadParticles() {
  const particles = useMemo(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 3,
      size: 2 + Math.random() * 3,
    })), []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-blue-400/30"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            animation: `falling-particles ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

function ConfettiEffect() {
  const pieces = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: 20 + Math.random() * 60,
      top: 20 + Math.random() * 60,
      delay: Math.random() * 2,
      color: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96E6A1'][i % 5],
    })), []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="absolute h-2 w-2 rounded-sm"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            backgroundColor: p.color,
            animation: `confetti-burst 3s ease-out ${p.delay}s infinite`,
            opacity: 0.4,
          }}
        />
      ))}
    </div>
  );
}

export default function MoodEffects({ mood }: Props) {
  if (!mood) return null;

  switch (mood) {
    case "😭":
      return <SadParticles />;
    case "😂":
      return <ConfettiEffect />;
    case "😤":
      return <div className="pointer-events-none absolute inset-0 mood-angry" />;
    case "🌙":
      return <div className="pointer-events-none absolute inset-0 mood-moon" />;
    case "💀":
      return <div className="pointer-events-none absolute inset-0 mood-skull" />;
    default:
      return null;
  }
}

export function getMoodGradient(mood?: MoodTag | null): string {
  switch (mood) {
    case "😭": return "from-blue-950/40 via-background to-background";
    case "😂": return "from-amber-950/30 via-background to-background";
    case "😤": return "from-red-950/40 via-background to-background";
    case "🌙": return "from-indigo-950/50 via-background to-background";
    case "💀": return "from-zinc-900 via-background to-background";
    default: return "from-background to-background";
  }
}
