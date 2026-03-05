export const MotionTokens = {
    durations: {
        micro: 0.14,
        standard: 0.22,
        page: 0.34,
        hero: 0.52
    },
    easings: {
        entrance: [0.22, 1, 0.36, 1],
        exit: [0.4, 0, 0.2, 1]
    },
    staggerDelay: 0.04,
    spring: {
        stiffness: 280,
        damping: 30,
        mass: 0.8
    }
} as const;

export const PageTransitions = {
    fadeSlideUp: {
        custom: { direction: 1 },
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0, transition: { duration: MotionTokens.durations.page, ease: MotionTokens.easings.entrance } },
        exit: { opacity: 0, y: -12, transition: { duration: MotionTokens.durations.page, ease: MotionTokens.easings.exit } }
    },
    reduced: {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.12 } },
        exit: { opacity: 0, transition: { duration: 0.12 } }
    }
};
