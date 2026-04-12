import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  angle: number;
  distance: number;
  scale: number;
  rotation: number;
}

interface Props {
  emoji: string;
  trigger: number; // increment to trigger burst
  x?: number;
  y?: number;
}

let particleId = 0;

export default function ReactionParticles({ emoji, trigger, x = 50, y = 50 }: Props) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger === 0) return;
    const count = emoji === "❤️" ? 12 : 8;
    const newParticles: Particle[] = Array.from({ length: count }, () => ({
      id: ++particleId,
      emoji,
      x,
      y,
      angle: Math.random() * 360,
      distance: 60 + Math.random() * 100,
      scale: 0.5 + Math.random() * 1,
      rotation: Math.random() * 360,
    }));
    setParticles((prev) => [...prev, ...newParticles]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
    }, 900);
  }, [trigger]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]">
      <AnimatePresence>
        {particles.map((p) => {
          const rad = (p.angle * Math.PI) / 180;
          const endX = Math.cos(rad) * p.distance;
          const endY = Math.sin(rad) * p.distance;
          return (
            <motion.div
              key={p.id}
              initial={{
                x: `${p.x}%`,
                y: `${p.y}%`,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: `calc(${p.x}% + ${endX}px)`,
                y: `calc(${p.y}% + ${endY}px)`,
                scale: p.scale,
                opacity: 0,
                rotate: p.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute text-2xl"
              style={{ left: 0, top: 0 }}
            >
              {p.emoji}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
