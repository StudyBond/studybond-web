import type { Variants } from "framer-motion";

// ─── Beat 1: The Bridge (0ms–600ms) ───
// An amber line that expands horizontally, signaling "there's more" after the result screen.

export const bridgeLineVariants: Variants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
  },
  visible: {
    scaleX: 1,
    opacity: 1,
    transition: {
      scaleX: {
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
      },
      opacity: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  },
};

export const bridgeGlowVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    opacity: [0, 0.6, 0.3],
    scale: [0.8, 1.2, 1],
    transition: {
      duration: 0.8,
      ease: "easeOut",
      times: [0, 0.5, 1],
    },
  },
};

// ─── Beat 2: The Headline Entrance (600ms–1000ms) ───
// Words slide up from a clip mask with stagger — lands with weight.

export const headlineContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.6,
      staggerChildren: 0.06,
    },
  },
};

export const headlineWordVariants: Variants = {
  hidden: {
    y: 40,
    opacity: 0,
    filter: "blur(4px)",
  },
  visible: {
    y: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const subCopyVariants: Variants = {
  hidden: {
    y: 16,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      delay: 0.9,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ─── Beat 3: The Benefits Cascade (1000ms–2200ms) ───
// Benefits appear one by one with spring-physics slide-up and subtle scale.

export const benefitsContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 1.0,
      staggerChildren: 0.12,
    },
  },
};

export const benefitCardVariants: Variants = {
  hidden: {
    y: 24,
    opacity: 0,
    scale: 0.92,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
      mass: 0.8,
    },
  },
};

// ─── Beat 4: The Social Proof Pulse (2200ms–3000ms) ───
// A subtle social proof element fades in with a soft glow pulse.

export const socialProofVariants: Variants = {
  hidden: {
    y: 12,
    opacity: 0,
    scale: 0.96,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      delay: 2.2,
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ─── Beat 5: The CTA Lock-In (3000ms–3500ms) ───
// The CTA button enters and then breathes with a persistent micro-animation.

export const ctaContainerVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: {
      delay: 3.0,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export const dismissVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      delay: 3.3,
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

// ─── Overlay backdrop ───

export const overlayBackdropVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: "easeIn",
    },
  },
};

export const overlayPanelVariants: Variants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 28,
      mass: 1,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: [0.4, 0, 1, 1],
    },
  },
};
