"use client";

import { useState } from "react";

type Props = {
  value: number; // 0 to 5, in 0.5 steps
  onChange?: (v: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
};

const SIZE_MAP = { sm: 14, md: 22, lg: 30 } as const;

const STAR_PATH =
  "M12 2.5l2.95 5.98 6.6.96 -4.78 4.66 1.13 6.58L12 17.77 6.1 20.86l1.13 -6.58L2.45 9.44l6.6 -.96L12 2.5z";

export function RatingStars({ value, onChange, size = "md", readOnly }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const display = hover ?? value;
  const px = SIZE_MAP[size];

  function set(v: number) {
    if (readOnly || !onChange) return;
    if (v === value) onChange(0);
    else onChange(v);
  }

  function pickFromEvent(idx: number, e: React.MouseEvent<HTMLButtonElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const half = e.clientX - rect.left < rect.width / 2;
    return idx + (half ? 0.5 : 1.0);
  }

  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`Rating ${value} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const filled = Math.max(0, Math.min(1, display - i));
        const gradId = `grad_${i}_${px}_${Math.round(filled * 1000)}`;
        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onMouseMove={(e) => !readOnly && setHover(pickFromEvent(i, e))}
            onMouseLeave={() => setHover(null)}
            onClick={(e) => set(pickFromEvent(i, e))}
            className={readOnly ? "cursor-default" : "cursor-pointer"}
            style={{ width: px, height: px }}
          >
            <svg viewBox="0 0 24 24" width={px} height={px} aria-hidden>
              <defs>
                <linearGradient id={gradId}>
                  <stop offset={`${filled * 100}%`} stopColor="#E5B962" />
                  <stop offset={`${filled * 100}%`} stopColor="#3a4254" />
                </linearGradient>
              </defs>
              <path
                d={STAR_PATH}
                fill={`url(#${gradId})`}
                stroke="#525b6e"
                strokeWidth="1"
              />
            </svg>
          </button>
        );
      })}
      <span className="ml-2 text-xs tabular-nums text-ink-300">
        {display ? display.toFixed(1) : readOnly ? "0.0" : "rate"}
      </span>
    </div>
  );
}
