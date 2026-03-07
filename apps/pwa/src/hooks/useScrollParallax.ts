import {
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import {
  type MotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useReducedMotion } from "./useReducedMotion";
import { MotionTokens } from "../design/motion";

interface UseScrollParallaxOptions {
  distance: number;
  scrollRange?: number;
  mobileCap?: number;
  target?: RefObject<HTMLElement | null>;
  spring?: { stiffness: number; damping: number; mass: number };
}

interface UseScrollParallaxReturn {
  y: MotionValue<number>;
  containerRef: MutableRefObject<HTMLDivElement | null>;
}

export function useScrollParallax(
  options: UseScrollParallaxOptions,
): UseScrollParallaxReturn {
  const {
    distance,
    scrollRange = MotionTokens.parallax.scrollRange,
    mobileCap = MotionTokens.parallax.mobileCap,
    target,
    spring = MotionTokens.parallaxSpring,
  } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduce = useReducedMotion();

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  );

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const effectiveDistance = isMobile ? distance * mobileCap : distance;
  const scrollTarget = target ?? containerRef;

  const { scrollYProgress } = useScroll({
    target: scrollTarget,
    offset: ["start end", "end start"],
  });

  const rawY = useTransform(
    scrollYProgress,
    [0, scrollRange],
    [0, shouldReduce ? 0 : -effectiveDistance],
  );

  const y = useSpring(rawY, spring);

  return { y, containerRef };
}
