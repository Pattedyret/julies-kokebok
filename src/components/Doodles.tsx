import type { CSSProperties } from 'react';

type DoodleProps = { className?: string; style?: CSSProperties; size?: number };

/* Håndtegnede små kruseduller — bevisst litt skjeve streker. */

export function DoodleHeart({ className, style, size = 34 }: DoodleProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size * 0.9}
      viewBox="0 0 40 36"
      aria-hidden="true"
    >
      <path
        d="M20 31 C9 24 3.5 16 5.5 10.5 C7.5 4.5 14.5 3.5 19 8.5 L20 9.5 L21 8.3 C25.5 3.2 32.5 4.2 34.5 10 C36.5 16 31 24 20 31 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DoodleWhisk({ className, style, size = 52 }: DoodleProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size * 0.6}
      height={size}
      viewBox="0 0 36 60"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="18" cy="5.5" r="2.6" />
        <path d="M18 8 C17.5 12 17.6 16 18 20" />
        <path d="M18 20 C6.5 30 6 46 18 55 C30 46 29.5 30 18 20 Z" />
        <path d="M18 20 C12 31 12 46 18 55 C24 46 24 31 18 20" />
      </g>
    </svg>
  );
}

export function DoodleStrawberry({ className, style, size = 42 }: DoodleProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size * 0.9}
      height={size}
      viewBox="0 0 40 44"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 40 C10 36 5 27 6.5 19 C8 12 14 10 20 12 C26 10 32 12 33.5 19 C35 27 30 36 20 40 Z" />
        <path d="M20 12 C17 8 13 6.5 9.5 7.5 C12.5 10 16 11.2 20 12 Z" />
        <path d="M20 12 C23 8 27 6.5 30.5 7.5 C27.5 10 24 11.2 20 12 Z" />
        <path d="M20 11 C19.5 8.5 19.5 6.5 20 4.5" />
      </g>
      <g fill="currentColor" stroke="none">
        <circle cx="14.5" cy="21.5" r="1.1" />
        <circle cx="21" cy="19" r="1.1" />
        <circle cx="26" cy="23.5" r="1.1" />
        <circle cx="17" cy="28.5" r="1.1" />
        <circle cx="23.5" cy="31" r="1.1" />
      </g>
    </svg>
  );
}

export function DoodleSteam({ className, style, size = 38 }: DoodleProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M10 34 C7 28 13 24 10 18 C8 13.5 12 9 14 6.5" />
        <path d="M20 36 C17 30 23 26 20 20 C18 15.5 22 11 24 8.5" />
        <path d="M30 34 C27 28 33 24 30 18 C28 13.5 32 9 34 6.5" />
      </g>
    </svg>
  );
}

export function DoodleSparkles({ className, style, size = 38 }: DoodleProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      <g fill="currentColor" stroke="none">
        <path d="M12 5 L13.6 10.4 L19 12 L13.6 13.6 L12 19 L10.4 13.6 L5 12 L10.4 10.4 Z" />
        <path d="M28 19 L29.1 22.9 L33 24 L29.1 25.1 L28 29 L26.9 25.1 L23 24 L26.9 22.9 Z" />
        <circle cx="19" cy="33" r="1.6" />
      </g>
    </svg>
  );
}

export function CoffeeRing({ className, style, size = 92 }: DoodleProps) {
  return (
    <svg
      className={className}
      style={style}
      width={size}
      height={size}
      viewBox="0 0 90 90"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeLinecap="round">
        <path
          d="M45 8 C67 7 82 22 83 43 C84 66 66 82 45 83 C24 84 8 66 7 44 C6 23 23 9 45 8 Z"
          strokeWidth="5"
          opacity="0.5"
        />
        <path
          d="M45 14 C62 13 76 26 77 43 C78 62 63 76 45 77 C27 78 13 62 12 44 C11 27 26 15 45 14 Z"
          strokeWidth="1.8"
          opacity="0.4"
        />
      </g>
    </svg>
  );
}

export function WashiTape({
  className,
  style,
  variant = 'gronn',
}: {
  className?: string;
  style?: CSSProperties;
  variant?: 'gronn' | 'gul' | 'blaa';
}) {
  return <span className={`washi-tape washi-${variant} ${className ?? ''}`} style={style} aria-hidden />;
}
