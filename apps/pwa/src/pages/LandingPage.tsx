import React from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  PlayCircle,
  Square,
  FileText,
  Mic,
  PlaySquare,
  BarChart2,
  Quote,
} from "lucide-react";

// --- Motion Tokens & Philosophy ---
const motionTokens = {
  duration: {
    fast: 0.3,
    base: 0.6,
    slow: 0.9,
    ambient: 20,
  },
  ease: {
    premium: [0.16, 1, 0.3, 1] as const,
    out: [0.22, 1, 0.36, 1] as const,
  },
  spring: {
    gentle: { type: "spring", stiffness: 300, damping: 30 },
  },
} as const;

// Extracted aesthetic noise background pattern
const bgNoise = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E")`;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Subtle Parallax (disabled if reduced motion)
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 150],
  );

  // -- Responsive Variants --
  // Soft, structural reveal (used for Hero text, sticky notes, etc)
  const fadeUp = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.premium,
      },
    },
  };

  // Pure fade (used for Nav and subtle blocks)
  const fade = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: motionTokens.duration.base,
        ease: motionTokens.ease.premium,
      },
    },
  };

  // Dimensional blur reveal (used for standout containers like the Audio Mockup)
  const scaleBlur = {
    hidden: {
      opacity: 0,
      scale: prefersReducedMotion ? 1 : 0.98,
      filter: prefersReducedMotion ? "none" : "blur(4px)",
    },
    visible: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        duration: motionTokens.duration.slow,
        ease: motionTokens.ease.premium,
      },
    },
  };

  // Container staggering
  const staggerHero = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        // Delay opening sequence to let the eye settle on the page background
        delayChildren: 0.1,
      },
    },
  };

  const staggerProcess = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div
      className="bg-[#FDFCF8] text-stone-900 font-ui antialiased selection:bg-stone-200 selection:text-stone-900 flex flex-col min-h-screen relative overflow-x-hidden"
      style={{ backgroundImage: bgNoise }}
    >
      {/* Navigation */}
      <motion.nav
        variants={fade}
        initial="hidden"
        animate="visible"
        className="w-full px-6 py-8 flex items-center justify-between max-w-7xl mx-auto z-10 relative"
      >
        <div
          className="font-headline text-xl tracking-tighter font-semibold flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/")}
        >
          IMPROV.
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
          <a
            href="#philosophy"
            className="transition-colors hover:text-gray-900 decoration-transparent"
          >
            Philosophy
          </a>
          <a
            href="#process"
            className="transition-colors hover:text-gray-900 decoration-transparent"
          >
            Process
          </a>
          <a
            href="#stories"
            className="transition-colors hover:text-gray-900 decoration-transparent"
          >
            Stories
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/app")}
            className="hidden sm:block text-sm font-medium transition-colors text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none"
          >
            Sign in
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={motionTokens.spring.gentle}
            onClick={() => navigate("/app")}
            className="text-[#FDFCF8] px-5 py-2.5 rounded-full text-sm font-medium transition-colors bg-gray-900 hover:bg-gray-800 cursor-pointer border-none"
          >
            Start practicing
          </motion.button>
        </div>
      </motion.nav>

      <main className="flex-grow z-10 relative">
        {/* Hero Section */}
        <motion.section
          variants={staggerHero}
          initial="hidden"
          animate="visible"
          className="md:pt-28 md:pb-32 text-center max-w-5xl mx-auto pt-20 px-6 pb-20"
        >
          <motion.div variants={fadeUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-white shadow-sm mb-10 border-gray-200">
              <span className="w-2 h-2 rounded-full animate-pulse bg-gray-300"></span>
              <span className="text-xs font-medium uppercase tracking-widest text-gray-600">
                A private space to speak
              </span>
            </div>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight font-semibold mb-8 leading-[1.1] text-gray-900"
          >
            Speak{" "}
            <span className="italic font-medium transition-colors duration-500 cursor-default text-gray-500 hover:text-gray-800">
              freely.
            </span>
            <br />
            Improve quietly.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-base md:text-lg max-w-2xl mx-auto mb-12 leading-relaxed text-gray-600"
          >
            We stripped away the audience, the evaluations, and the anxiety.
            Just you, a thoughtful prompt, and sixty seconds to find your rhythm
            without pressure.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              onClick={() => navigate("/app")}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={motionTokens.spring.gentle}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium shadow-sm flex items-center justify-center gap-2 group bg-gray-900 text-gray-50 hover:bg-gray-800 cursor-pointer border-none"
            >
              Begin the 60s challenge
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform duration-300"
              />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={motionTokens.spring.gentle}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-medium transition-colors flex items-center justify-center gap-2 group text-gray-600 hover:bg-gray-100 cursor-pointer border-none bg-transparent"
            >
              <PlayCircle
                size={20}
                className="group-hover:scale-110 transition-transform duration-300"
              />
              Watch how it works
            </motion.button>
          </motion.div>
        </motion.section>

        {/* Interactive Studio Mockup */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleBlur}
          className="max-w-4xl mx-auto px-6 pb-24 md:pb-40 relative"
        >
          {/* Animated background glow */}
          {!prefersReducedMotion && (
            <div className="absolute inset-0 max-w-2xl mx-auto -translate-y-12 z-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  duration: motionTokens.duration.ambient,
                  ease: "linear",
                }}
                className="w-full h-full bg-gradient-to-tr blur-3xl rounded-full opacity-60 from-gray-200/40 via-gray-100/10 to-gray-300/40"
              />
            </div>
          )}

          <motion.div
            style={{ y: heroParallax }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 md:p-16 border shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 cursor-default border-gray-200 hover:border-gray-300 z-10"
          >
            <div className="text-xs font-semibold tracking-widest uppercase mb-8 flex items-center gap-3 text-gray-400">
              <span className="w-8 h-[1px] transition-all duration-500 group-hover:w-12 bg-gray-200 group-hover:bg-gray-300"></span>
              Current Prompt
              <span className="w-8 h-[1px] transition-all duration-500 group-hover:w-12 bg-gray-200 group-hover:bg-gray-300"></span>
            </div>
            <h3 className="font-headline text-2xl md:text-4xl tracking-tight text-center max-w-2xl mb-14 leading-snug">
              "Describe a time you had to pivot your strategy at the last minute
              and how you communicated it."
            </h3>

            {/* Active Audio Visualizer */}
            <div className="flex items-end justify-center gap-1.5 mb-10 h-16 opacity-80 w-full">
              {[0.1, 0.4, 0.2, 0.6, 0.3, 0.7, 0.5, 0.8, 0.2, 0.5].map(
                (delay, i) => (
                  <motion.div
                    key={i}
                    animate={
                      prefersReducedMotion
                        ? { scaleY: 1 }
                        : { scaleY: [0.2, 1, 0.2] }
                    }
                    transition={{
                      duration: 0.8 + (i % 3) * 0.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay,
                    }}
                    className={`w-1.5 h-16 rounded-full origin-bottom ${
                      i % 4 === 0
                        ? "bg-gray-800"
                        : i % 3 === 0
                          ? "bg-gray-300"
                          : "bg-gray-200"
                    }`}
                  />
                ),
              )}
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between w-full max-w-sm px-4">
              <span className="text-xs tabular-nums font-medium text-gray-500">
                00:14
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={motionTokens.spring.gentle}
                className="w-14 h-14 bg-red-50 text-red-500 rounded-full flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white shadow-sm hover:shadow-lg transition-colors duration-300 cursor-pointer"
              >
                <Square size={24} fill="currentColor" />
              </motion.button>
              <span className="text-xs tabular-nums font-medium text-gray-400">
                00:60
              </span>
            </div>
          </motion.div>
        </motion.section>

        {/* Philosophy Section */}
        <section
          id="philosophy"
          className="border-y bg-[#F5F4F0] overflow-hidden border-gray-200"
        >
          <div className="max-w-7xl mx-auto px-6 py-24 md:py-32 grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-8">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="md:col-span-5 flex flex-col justify-center"
            >
              <span className="text-xs font-semibold tracking-widest uppercase mb-6 text-gray-400">
                The Philosophy
              </span>
              <h2 className="font-headline text-3xl md:text-5xl tracking-tight mb-8 leading-tight">
                The art of speaking, distilled.
              </h2>
              <div className="space-y-6 text-sm md:text-base leading-relaxed text-gray-600">
                <p>
                  We realized that most people don't fear public speaking; they
                  fear public judgment. By removing the audience entirely, we
                  created a space where you can make mistakes, stumble over
                  words, and try again.
                </p>
                <p>
                  Focusing on 60-second bursts builds muscle memory for
                  articulation without the overwhelming pressure of a full
                  presentation. It's not about achieving perfection—it's about
                  becoming comfortable with being present in your own voice.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeUp}
              className="md:col-span-6 md:col-start-7 relative"
            >
              <div className="aspect-[4/5] rounded-lg overflow-hidden relative shadow-sm group bg-gray-200">
                {/* Image reveals smoothly from heavy grayscale/zoom on scroll rather than just on hover */}
                <motion.img
                  initial={
                    prefersReducedMotion
                      ? {}
                      : { scale: 1.1, filter: "grayscale(100%)" }
                  }
                  whileInView={
                    prefersReducedMotion
                      ? {}
                      : { scale: 1, filter: "grayscale(40%)" }
                  }
                  transition={{
                    duration: 1.2,
                    ease: motionTokens.ease.premium,
                  }}
                  viewport={{ once: true }}
                  src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?q=80&w=2070&auto=format&fit=crop"
                  className="object-cover w-full h-full opacity-90 contrast-125 group-hover:scale-105 group-hover:filter-none transition-all duration-1000 ease-out"
                  alt="Microphone in a studio"
                />
                <div className="absolute inset-0 mix-blend-multiply group-hover:opacity-0 transition-opacity duration-1000 bg-gray-900/10"></div>
              </div>
              <p className="absolute -bottom-6 right-0 text-xs font-headline italic text-gray-400">
                Fig. 1 — The quiet room.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Process Section */}
        <section id="process" className="max-w-7xl mx-auto px-6 py-24 md:py-32">
          <div className="flex flex-col md:flex-row gap-16 items-start">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-20%" }}
              variants={fade}
              className="md:w-1/3 sticky top-12"
            >
              <h2 className="font-headline text-3xl md:text-4xl tracking-tight mb-4">
                A deliberate process.
              </h2>
              <p className="text-sm leading-relaxed mb-8 text-gray-500">
                Three steps designed to strip away anxiety and build cognitive
                resilience when communicating.
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-2 text-sm font-medium border-b pb-0.5 transition-colors group text-gray-900 border-gray-900 hover:text-gray-600 hover:border-gray-600 decoration-transparent"
              >
                Read the full methodology
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </a>
            </motion.div>

            <motion.div
              variants={staggerProcess}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16"
            >
              {[
                {
                  icon: <FileText size={22} />,
                  title: "1. The Prompt",
                  desc: "Receive a randomized, real-world scenario. No preparation allowed, just your authentic, spontaneous reaction.",
                },
                {
                  icon: <Mic size={22} />,
                  title: "2. The 60 Seconds",
                  desc: "Speak your mind. The strict time constraint prevents rambling and forces concise, impactful articulation.",
                },
                {
                  icon: <PlaySquare size={22} />,
                  title: "3. The Review",
                  desc: "Listen back privately. Notice filler words, pacing, and clarity without the sting of external judgment.",
                },
                {
                  icon: <BarChart2 size={22} />,
                  title: "4. The Progress",
                  desc: "Track your improvement over weeks. Watch as spontaneous speaking transforms from a fear into a reflex.",
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={fadeUp}
                  className="group cursor-default"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={motionTokens.spring.gentle}
                    className="w-12 h-12 rounded-full border bg-white flex items-center justify-center mb-6 shadow-sm border-gray-200 text-gray-600 group-hover:border-gray-900 group-hover:text-gray-900 transition-colors"
                  >
                    {step.icon}
                  </motion.div>
                  <h3 className="text-base font-semibold mb-3 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Testimonial Section */}
        <section id="stories" className="border-y bg-white border-gray-200">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={scaleBlur}
            className="max-w-4xl mx-auto px-6 py-24 md:py-32 text-center"
          >
            <Quote
              size={40}
              className="mb-8 transform transition-transform group-hover:-translate-y-2 duration-500 text-gray-200 mx-auto"
            />
            <blockquote className="font-headline text-2xl md:text-4xl leading-snug tracking-tight mb-10 text-gray-800">
              "It feels less like a testing tool and more like a daily journal
              for my communication skills. The 60-second constraint is
              brilliant—it forces clarity over endless rambling."
            </blockquote>
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex flex-col items-center group cursor-default"
            >
              <div className="w-10 h-10 rounded-full mb-4 overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-500 bg-gray-100">
                <img
                  src="https://i.pravatar.cc/150?img=32"
                  alt="Sarah Jenkins"
                  className="w-full h-full object-cover"
                />
              </div>
              <cite className="not-italic text-sm font-semibold block mb-1 text-gray-900">
                Sarah Jenkins
              </cite>
              <span className="text-xs font-medium text-gray-500">
                Director of Product
              </span>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 px-6 text-center relative overflow-hidden bg-gray-900 text-gray-50">
          {/* Subtle background elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-2xl h-full bg-gradient-to-b to-transparent opacity-50 pointer-events-none from-gray-800/50"></div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            className="relative z-10"
          >
            <h2 className="font-headline text-4xl md:text-5xl tracking-tight mb-6">
              Ready to find your voice?
            </h2>
            <p className="text-sm md:text-base mb-10 max-w-lg mx-auto leading-relaxed text-gray-400">
              No credit card required. Start your first session in seconds and
              experience the clarity of unpressured practice.
            </p>
            <motion.button
              onClick={() => navigate("/app")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              transition={motionTokens.spring.gentle}
              className="bg-[#FDFCF8] px-8 py-3.5 rounded-full text-sm font-semibold shadow-sm text-gray-900 hover:bg-gray-200 cursor-pointer border-none"
            >
              Begin your 60 seconds
            </motion.button>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fade}
        className="w-full px-6 py-12 border-t border-gray-200 z-10 relative bg-[#FDFCF8]"
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div
            className="flex items-center gap-2 hover:opacity-70 transition-opacity cursor-pointer"
            onClick={() => navigate("/")}
          >
            <span className="font-headline text-lg tracking-tighter font-semibold">
              IMPROV.
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs text-gray-500">© 2026</span>
          </div>
          <div className="flex gap-6 text-xs font-medium text-gray-500">
            <a
              href="#"
              className="transition-colors hover:text-gray-900 decoration-transparent"
            >
              Privacy
            </a>
            <a
              href="#"
              className="transition-colors hover:text-gray-900 decoration-transparent"
            >
              Terms
            </a>
            <a
              href="#"
              className="transition-colors hover:text-gray-900 decoration-transparent"
            >
              Twitter
            </a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};
