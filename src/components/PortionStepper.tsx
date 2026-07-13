import { motion } from 'framer-motion';

type Props = { value: number; onChange: (v: number) => void };

export function PortionStepper({ value, onChange }: Props) {
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        aria-label="Færre porsjoner"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
      >
        −
      </button>
      <motion.span
        key={value}
        className="stepper-value"
        initial={{ scale: 1.2 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.16 }}
        aria-live="polite"
      >
        {value} {value === 1 ? 'porsjon' : 'porsjoner'}
      </motion.span>
      <button
        type="button"
        className="stepper-btn"
        aria-label="Flere porsjoner"
        onClick={() => onChange(Math.min(24, value + 1))}
        disabled={value >= 24}
      >
        +
      </button>
    </div>
  );
}
