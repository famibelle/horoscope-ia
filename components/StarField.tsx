'use client';

import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  duration: number;
  delay: number;
}

export default function StarField() {
  const [stars, setStars] = useState<Star[]>([]);

  useEffect(() => {
    const generated: Star[] = Array.from({ length: 140 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.65 + 0.15,
      duration: Math.random() * 5 + 2,
      delay: Math.random() * 8,
    }));
    setStars(generated);
  }, []);

  if (stars.length === 0) {
    return null; // Évite le rendu côté serveur avant l'initialisation client
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-ancestral-gold"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity * 0.7,
            animation: `twinkle ${star.duration.toFixed(1)}s ease-in-out ${star.delay.toFixed(1)}s infinite`,
            boxShadow: `0 0 ${Math.round(star.size * 4)}px rgba(210,105,30,${star.opacity.toFixed(2)})`,
          }}
        />
      ))}
    </div>
  );
}
