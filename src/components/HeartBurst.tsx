import { motion } from 'framer-motion';

const OFFSETS = [-22, -8, 6, 20, 0];

/** Små hjerter som svever opp når noe legges i handlelista. */
export function HeartBurst({ burst }: { burst: number }) {
  if (burst === 0) return null;
  return (
    <span className="heart-burst" aria-hidden>
      {OFFSETS.map((x, i) => (
        <motion.span
          key={`${burst}-${i}`}
          className="heart"
          initial={{ opacity: 1, y: 0, x, scale: 0.6 }}
          animate={{ opacity: 0, y: -52 - i * 6, x: x * 1.6, scale: 1 }}
          transition={{ duration: 0.75, delay: i * 0.04, ease: 'easeOut' }}
        >
          ♥
        </motion.span>
      ))}
    </span>
  );
}
