import { useReducedMotion } from "./useReducedMotion";
import { PageTransitions } from "../design/motion";

export function useMotionPreset() {
    const shouldReduceMotion = useReducedMotion();

    return {
        pageTransition: shouldReduceMotion ? PageTransitions.reduced : PageTransitions.fadeSlideUp,
        reduced: shouldReduceMotion
    };
}
