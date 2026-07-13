type Props = { value: number; onChange: (hearts: number) => void };

/** Fem hjerter — trykk for å vurdere, trykk samme hjerte igjen for å fjerne. */
export function HeartRating({ value, onChange }: Props) {
  return (
    <div className="rating" role="group" aria-label="Julies vurdering">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`rating-heart${n <= value ? ' filled' : ''}`}
          aria-label={`${n} av 5 hjerter`}
          aria-pressed={n <= value}
          onClick={() => onChange(n === value ? 0 : n)}
        >
          {n <= value ? '♥' : '♡'}
        </button>
      ))}
    </div>
  );
}
