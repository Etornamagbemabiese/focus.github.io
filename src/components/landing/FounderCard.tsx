import React, { useState } from 'react';
import { User } from 'lucide-react';

interface FounderCardProps {
  name: string;
  image: string;
  bullets: string;
  bio: string;
  role?: string;
}

export function FounderCard({ name, image, bullets, bio, role }: FounderCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="h-[280px] sm:h-[320px] cursor-pointer [perspective:1000px] touch-manipulation min-h-[280px]"
      onClick={() => setIsFlipped(!isFlipped)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsFlipped((f) => !f)}
      aria-label={`${name} - ${isFlipped ? 'Tap to flip back' : 'Tap to learn more'}`}
    >
      <div
        className="relative h-full w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front - Photo */}
        <div
          className="absolute inset-0 rounded-2xl border border-border overflow-hidden shadow-lg"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-full h-full bg-muted/50 flex items-center justify-center">
            {!imgError ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <User className="h-24 w-24 text-primary/50" />
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <p className="text-white font-semibold text-lg">{name}</p>
            {role && <p className="text-white/80 text-sm">{role}</p>}
            <p className="text-white/60 text-xs mt-1">Tap to learn more</p>
          </div>
        </div>

        {/* Back - Bio */}
        <div
          className="absolute inset-0 rounded-2xl border border-border bg-card p-4 sm:p-6 overflow-y-auto shadow-lg overscroll-contain"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <h3 className="font-semibold text-lg text-foreground mb-2">{name}</h3>
          {role && <p className="text-primary text-sm mb-4">{role}</p>}
          <ul className="text-muted-foreground text-sm leading-relaxed list-disc list-inside space-y-1 mb-4">
            {bullets.split('\n').map((line, i) => (
              <li key={i}>{line.replace(/^[•\-]\s*/, '')}</li>
            ))}
          </ul>
          <p className="text-muted-foreground text-sm leading-relaxed">{bio}</p>
          <p className="text-xs text-muted-foreground mt-4">Tap to flip back</p>
        </div>
      </div>
    </div>
  );
}
