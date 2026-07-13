/** Framer Motion presets — Dantal DS (150–250ms) */
export const motionDuration = {
  fast: 0.15,
  normal: 0.2,
  slow: 0.25,
} as const;

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: motionDuration.normal },
};

export const fadeScaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.96 },
  transition: { duration: motionDuration.normal },
};

export const slideUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: { duration: motionDuration.normal },
};

export const cardHover = {
  whileHover: { y: -2, transition: { duration: motionDuration.fast } },
};

export const buttonTap = {
  whileTap: { scale: 0.98 },
};
