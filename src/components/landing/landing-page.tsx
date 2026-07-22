"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import {
  motion,
  MotionConfig,
  useScroll,
  useTransform,
  AnimatePresence,
  useInView,
} from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  LayoutDashboard,
  Menu,
  PieChart,
  Rocket,
  X,
} from "lucide-react";

//
const EASE = [0.21, 0.47, 0.32, 0.98] as const;

// Reusable variants
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE },
  },
};

const staggerContainer = (delay = 0) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: delay },
  },
});

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className=" inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 mb-5">
      <span className=" text-xs font-semibold tracking-widest uppercase text-violet-400">
        {children}
      </span>
    </span>
  );
}

function LandingNav() {
  const { scrollY } = useScroll();

  // Blur + background opacity on scroll
  const navBg = useTransform(
    scrollY,
    [0, 72],
    ["rgba(5,5,5,0)", "rgba(5,5,5,0.92)"],
  );
  const borderOpacity = useTransform(scrollY, [0, 72], [0, 1]);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <motion.div
      style={{ backgroundColor: navBg }}
      className=" fixed inset-x-0 top-0 z-50 h-16 backdrop-blur-md"
    >
      {/* Bottom border fades in on scroll */}
      <motion.div
        style={{ opacity: borderOpacity }}
        className=" absolute inset-x-0 bottom-0 h-px bg-white/8"
      />

      <div className=" mx-auto flex h-full max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-linear-to-br from-violet-500 to-violet-700">
            <LayoutDashboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-[15px] font-bold tracking-tight text-white">
            Content<span className="text-violet-400">Planner</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 md:flex">
          {[
            { label: "Features", href: "#features" },
            { label: "How it works", href: "#how-it-works" },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[13px] font-medium text-[#9ca3af] no-underline transition-colors duration-200 hover:text-white"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href={"/sign-in" as Route}
            className="rounded-lg px-4 py-2 text-[13px] text-[#9ca3af] no-underline transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href={"/sign-up" as Route}
            className="rounded-[9px] bg-linear-to-br from-violet-600 to-violet-700 px-5 py-2 text-[13px] font-semibold text-white no-underline transition-shadow duration-300 hover:shadow-[0_0_28px_rgba(124,58,237,.5)]"
          >
            Get started
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="text-[#9ca3af] transition-colors hover:text-white md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: EASE }}
            className="overflow-hidden border-b border-white/6 md:hidden"
            style={{ background: "#0a0a0a" }}
          >
            <div className="flex flex-col gap-4 px-6 py-5">
              {["Features", "How it works"].map((l) => (
                <a
                  key={l}
                  href={`#${l.toLowerCase().replace(/ /g, "-")}`}
                  className="text-sm text-[#9ca3af] no-underline"
                  onClick={() => setMenuOpen(false)}
                >
                  {l}
                </a>
              ))}
              <Link
                href={"/sign-in" as Route}
                className="text-sm text-[#9ca3af] no-underline"
              >
                Sign in
              </Link>
              <Link
                href={"/sign-up" as Route}
                className="rounded-lg bg-violet-600 px-4 py-2 text-center text-sm font-semibold text-white no-underline"
              >
                Get started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Kanban mini card
type ColId = "draft" | "review" | "approved";
const COL_STATUS: Record<ColId, { label: string; color: string }> = {
  draft: { label: "Draft", color: "#6b7280" },
  review: { label: "In Review", color: "#f59e0b" },
  approved: { label: "Approved", color: "#10b981" },
};

interface MiniCardData {
  emoji: string;
  platColor: string;
  platLabel: string;
  title: string;
  time: string;
  col: ColId;
}

function MiniCard({
  emoji,
  platColor,
  platLabel,
  title,
  time,
  col,
}: MiniCardData) {
  const { label, color } = COL_STATUS[col];
  return (
    <div
      className="rounded-[7px] p-2"
      style={{
        background: "#1a1a1a",
        border: `1px solid ${color}22`,
      }}
    >
      <div className="flex items-center gap-1.5 mb-1.5 text-[9px] font-medium">
        <span
          className="px-1.5 py-px rounded-[3px]"
          style={{
            background: `${platColor}18`,
            border: `1px solid ${platColor}30`,
            color: platColor,
          }}
        >
          {emoji} {platLabel}
        </span>
        <span
          className="px-1.5 py-px rounded-[3px] ml-auto"
          style={{ background: `${color}15`, color }}
        >
          {label}
        </span>
      </div>
      <p
        className="text-[10px] font-semibold leading-snug"
        style={{ color: "#e5e7eb" }}
      >
        {title}
      </p>
      <p className="text-[9px] mt-1" style={{ color: "#4b5563" }}>
        {time}
      </p>
    </div>
  );
}

//  Browser + Kanban mockup
const CYCLE: ColId[] = ["draft", "review", "approved"];

// The one card that travels between columns (layoutId)
const FEATURED: Omit<MiniCardData, "col"> = {
  emoji: "📸",
  platColor: "#E1306C",
  platLabel: "IG",
  title: "Summer Recipe Launch",
  time: "Jun 15 · 2:00 PM",
};

// Static cards that stay in their columns
const STATIC_CARDS: Record<ColId, Omit<MiniCardData, "col">[]> = {
  draft: [
    {
      emoji: "💼",
      platColor: "#0A66C2",
      platLabel: "LI",
      title: "Q3 Product Update",
      time: "Jun 18 · 10:00 AM",
    },
  ],
  review: [
    {
      emoji: "🐦",
      platColor: "#1DA1F2",
      platLabel: "TW",
      title: "Weekly Newsletter",
      time: "Jun 16 · 8:00 AM",
    },
  ],
  approved: [
    {
      emoji: "📘",
      platColor: "#1877F2",
      platLabel: "FB",
      title: "Summer Sale Launch",
      time: "Jun 12 · 9:00 AM",
    },
  ],
};

const COLS: { id: ColId; label: string }[] = [
  { id: "draft", label: "Draft" },
  { id: "review", label: "In Review" },
  { id: "approved", label: "Approved" },
];

function BrowserMockup() {
  const [activeCol, setActiveCol] = useState<ColId>("draft");

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % CYCLE.length;
      setActiveCol(CYCLE[i]!);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="rounded-2xl overflow-hidden w-full"
      style={{
        background: "#111",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04), 0 0 80px rgba(124,58,237,0.1)",
      }}
    >
      {/* Browser chrome */}
      <div
        className="flex items-center gap-3 px-4 py-3 border-b border-white/6"
        style={{ background: "#1a1a1a" }}
      >
        <div className="flex gap-1.5">
          {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
            <div
              key={c}
              className="w-2.25 h-2.25 rounded-full"
              style={{ background: c }}
            />
          ))}
        </div>
        <div
          className="flex-1 rounded-md py-1 px-3 text-[10px] text-center"
          style={{ background: "#262626", color: "#6b7280" }}
        >
          contentplanner.app/posts/kanban
        </div>
      </div>

      {/* App nav strip */}
      <div
        className="flex items-center justify-between px-4 py-2 border-b border-white/5"
        style={{ background: "#0d0d0d" }}
      >
        <span className="text-[12px] font-bold text-violet-400">
          ContentPlanner
        </span>
        <div className="flex gap-1">
          {["Posts", "Calendar", "Analytics"].map((t) => (
            <span
              key={t}
              className="text-[10px] px-2 py-1 rounded"
              style={
                t === "Posts"
                  ? { background: "rgba(124,58,237,0.15)", color: "#a78bfa" }
                  : { color: "#6b7280" }
              }
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Kanban board */}
      <div
        className="grid grid-cols-3 gap-2 p-2"
        style={{ background: "#080808" }}
      >
        {COLS.map((col) => {
          const { color } = COL_STATUS[col.id];
          return (
            <div
              key={col.id}
              className="rounded-lg overflow-hidden"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              {/* Column header */}
              <div className="flex items-center gap-1.5 px-2.5 py-2 border-b border-white/5">
                <span
                  className="w-1.25 h-1.25 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span
                  className="text-[10px] font-semibold"
                  style={{ color: "#9ca3af" }}
                >
                  {col.label}
                </span>
              </div>

              {/* Cards */}
              <div className="p-1.5 flex flex-col gap-1.5 min-h-27.5">
                {/* Static background cards */}
                {STATIC_CARDS[col.id].map((card, i) => (
                  <MiniCard key={i} {...card} col={col.id} />
                ))}

                {/* The animated featured card — only rendered in the active column.
                    layoutId tells Motion to animate between the positions
                    each time activeCol changes (FLIP animation). */}
                {activeCol === col.id && (
                  <motion.div
                    layoutId="featured-kanban-card"
                    transition={{ type: "spring", stiffness: 340, damping: 38 }}
                    style={{
                      borderRadius: 7,
                      boxShadow: `0 0 0 1.5px ${color}55, 0 4px 16px rgba(0,0,0,0.35)`,
                    }}
                  >
                    <MiniCard {...FEATURED} col={col.id} />
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// HeroSection

const HERO_WORDS = ["Plan.", "Schedule.", "Publish."];

function HeroSection() {
  return (
    <section
      style={{ background: "#050505" }}
      className=" relative flex min-h-screen flex-col items-center overflow-hidden px-6 pb-20 pt-32"
    >
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(124,58,237,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.07) 1px,transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      {/* Pulsing radial glow */}
      <motion.div
        className="pointer-events-none absolute left-1/2 top-0 h-110 w-180 -translate-x-1/2"
        animate={{ opacity: [0.45, 0.7, 0.45] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(124,58,237,.22) 0%, transparent 68%)",
        }}
      />

      <div className=" relative z-10 mx-auto w-full max-w-6xl">
        <div className=" grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left */}
          <motion.div
            variants={staggerContainer(0)}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className=" mb-7">
              <span className=" inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
                <motion.span
                  animate={{ opacity: [1, 0.35, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className=" h-1.5 w-1.5 rounded-full bg-violet-400"
                />
                <span className=" text-xs font-medium text-violet-300">
                  Calendar View - Now Live
                </span>
              </span>
            </motion.div>

            {/* Headline — word by word */}
            <motion.h1
              variants={staggerContainer(0.05)}
              className="mb-6 text-[52px] font-black leading-[1.06] tracking-[-0.03em] lg:text-[60px]"
            >
              {HERO_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  variants={fadeUp}
                  className="mr-3 inline-block"
                  style={
                    i === HERO_WORDS.length - 1
                      ? {
                          background:
                            "linear-gradient(135deg,#fff 20%,#a78bfa 60%,#7c3aed)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }
                      : {}
                  }
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                variants={fadeUp}
                className="inline-block"
                style={{ color: "#374151" }}
              >
                Without the chaos.
              </motion.span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="mb-9 max-w-105 text-[16px] leading-[1.7]"
              style={{ color: "#9ca3af" }}
            >
              A lightweight content planning tool for creators who value clarity
              over feature bloat. Kanban, calendar, analytics — all in one
              place.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="mb-10 flex flex-wrap items-center gap-3"
            >
              <Link
                href={"/sign-up" as Route}
                className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-violet-700 px-6 py-3 text-[14px] font-semibold text-white no-underline transition-shadow duration-300 hover:shadow-[0_0_32px_rgba(124,58,237,.5)]"
              >
                Start free
                <motion.span
                  className="inline-block"
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  <ArrowRight className="h-4 w-4" />
                </motion.span>
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 text-[14px] font-medium no-underline transition-all duration-200 hover:border-violet-500/40 hover:text-violet-300"
                style={{ color: "#9ca3af" }}
              >
                See features
              </a>
            </motion.div>

            {/* Mini stat row */}
            <motion.div variants={fadeUp} className="flex items-center gap-6">
              {[
                { val: "6", label: "Platforms" },
                { val: "5", label: "Workflow stages" },
                { val: "∞", label: "Posts" },
              ].map(({ val, label }, i) => (
                <div key={label} className="flex items-center gap-6">
                  {i > 0 && (
                    <div
                      className="h-7 w-px"
                      style={{ background: "rgba(255,255,255,0.08)" }}
                    />
                  )}
                  <div>
                    <p className="text-2xl font-black leading-none text-white">
                      {val}
                    </p>
                    <p
                      className="mt-0.5 text-[11px]"
                      style={{ color: "#6b7280" }}
                    >
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: browser mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: EASE }}
            className="relative"
          >
            {/* Floating badge — top right */}
            <motion.div
              className="absolute -right-3 -top-5 z-10"
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                style={{
                  background: "rgba(16,185,129,0.15)",
                  border: "1px solid rgba(16,185,129,0.3)",
                  color: "#34d399",
                }}
              >
                ✅ Published
              </span>
            </motion.div>

            {/* Floating badge — bottom left */}
            <motion.div
              className="absolute -bottom-4 -left-3 z-10"
              animate={{ y: [5, -5, 5] }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
            >
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                style={{
                  background: "rgba(59,130,246,0.15)",
                  border: "1px solid rgba(59,130,246,0.3)",
                  color: "#60a5fa",
                }}
              >
                📅 Scheduled
              </span>
            </motion.div>

            {/* Continuous float on the whole mockup */}
            <motion.div
              animate={{ y: [-7, 7, -7] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            >
              <BrowserMockup />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Platform Ticker Section

const PLATFORMS = [
  "📸 Instagram",
  "💼 LinkedIn",
  "🐦 Twitter/X",
  "📘 Facebook",
  "🎵 TikTok",
  "▶️ YouTube",
];

function TickerSection() {
  const items = [...PLATFORMS, ...PLATFORMS];

  return (
    <div
      className=" overflow-hidden border-y py-4"
      style={{ background: "#0a0a0a", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <motion.div
        className=" flex gap-10 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
      >
        {items.map((p, i) => (
          <span
            key={i}
            className=" shrink-0  text-xs font-medium"
            style={{ color: "#4b5563" }}
          >
            {p}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

// Features Section

const FEATURES = [
  {
    Icon: LayoutDashboard,
    title: "Visual Kanban Workflow",
    desc: "Drag and drop posts through Draft → In Review → Approved → Scheduled → Published. Full pipeline visibility at a glance.",
    accent: "#7c3aed",
    glow: "rgba(124,58,237,0.14)",
    tags: ["Drag & drop", "5 stages", "Instant updates"],
  },
  {
    Icon: CalendarDays,
    title: "Calendar Scheduling",
    desc: "See all content on a beautiful calendar. Click any date to create a post, drag events to reschedule. Month and week views.",
    accent: "#3b82f6",
    glow: "rgba(59,130,246,0.12)",
    tags: ["Month view", "Week view", "Drag to reschedule"],
  },
  {
    Icon: PieChart,
    title: "Analytics Dashboard",
    desc: "Track your publishing cadence across platforms. Status breakdown, content distribution, and posting frequency — all at a glance.",
    accent: "#10b981",
    glow: "rgba(16,185,129,0.12)",
    tags: ["By platform", "Status charts", "Real-time"],
  },
];

function FeaturesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      className=" px-6 py-24"
      style={{ background: "#080808" }}
      ref={ref}
    >
      <div className=" mx-auto max-w-6xl">
        <motion.div
          className=" mb-14 text-center"
          variants={staggerContainer()}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>Features</SectionLabel>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className=" mb-4 text-4xl font-black leading-tight tracking-tight text-white"
          >
            Everything you need.
            <br />
            <span style={{ color: "#6b7280" }}>Nothing you don't.</span>
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="mx-auto max-w-md text-[15px] leading-relaxed"
            style={{ color: "#6b7280" }}
          >
            Built for content creators who want clarity, not complexity.
          </motion.p>
        </motion.div>

        {/* Cards */}
        <motion.div
          className=" grid gap-4 md:grid-cols-3"
          variants={staggerContainer(0.15)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {FEATURES.map(({ Icon, title, desc, accent, glow, tags }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              whileHover={{ y: -6 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              className="group relative cursor-default overflow-hidden rounded-2xl p-7"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Hover glow */}
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background: `radial-gradient(ellipse at top left, ${glow} 0%, transparent 65%)`,
                }}
              />

              {/* Icon */}
              <div
                className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl"
                style={{
                  background: `${accent}1a`,
                  border: `1px solid ${accent}30`,
                }}
              >
                <Icon className="h-5 w-5" style={{ color: accent }} />
              </div>

              <h3
                className="mb-3 text-[16px] font-bold"
                style={{ color: "#f3f4f6" }}
              >
                {title}
              </h3>
              <p
                className="mb-5 text-[14px] leading-relaxed"
                style={{ color: "#6b7280" }}
              >
                {desc}
              </p>

              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-lg px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      background: `${accent}12`,
                      border: `1px solid ${accent}22`,
                      color: accent,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

//How it works
const STEPS = [
  {
    num: "01",
    emoji: "✍️",
    title: "Create your post",
    desc: "Write with the rich text editor. Pick your platform — Instagram, LinkedIn, Twitter and more. Add images and a schedule date.",
  },
  {
    num: "02",
    emoji: "📋",
    title: "Move through the workflow",
    desc: "Drag your post from Draft to In Review to Approved to Scheduled. Everyone knows exactly where each piece of content stands.",
  },
  {
    num: "03",
    emoji: "📊",
    title: "Publish and track",
    desc: "Mark posts as published when they go live. Your analytics dashboard updates instantly — platform breakdown, status charts.",
  },
];

function HowItWorksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const lineIn = useInView(lineRef, { once: true, margin: "-40px" });

  return (
    <section
      id="how-it-works"
      className=" border-t px-6 py-24"
      style={{ background: "#050505", borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className=" mx-auto max-w-6xl" ref={ref}>
        <motion.div
          className=" mb-16 text-center"
          variants={staggerContainer()}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          <motion.div variants={fadeUp}>
            <SectionLabel>How it Works</SectionLabel>
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className=" text-4xl font-black tracking-tight text-white"
          >
            Up and running in minutes
          </motion.h2>
        </motion.div>

        <div className=" relative">
          {/* Animated connector line — scaleX from 0 → 1 on scroll */}
          <div
            ref={lineRef}
            className="absolute z-0 top-7 hidden overflow-hidden md:block"
            style={{
              left: "calc(50% / 3 + 36px)",
              right: "calc(50% / 3 + 36px)",
              height: 1,
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <motion.div
              className="h-full"
              style={{
                background: "linear-gradient(90deg,#7c3aed,#a78bfa,#7c3aed)",
              }}
              initial={{ scaleX: 0, originX: 0 }}
              animate={lineIn ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 1.3, delay: 0.4, ease: EASE }}
            />
          </div>

          {/* Steps */}
          <motion.div
            className="grid gap-10 md:grid-cols-3"
            variants={staggerContainer(0.2)}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            {STEPS.map(({ num, emoji, title, desc }) => (
              <motion.div
                key={num}
                variants={fadeUp}
                className=" relative z-20 text-center"
              >
                {/* Number bubble */}
                <div
                  className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{ background: "rgba(124,58,237,0.35)" }}
                >
                  <span className=" text-[15px] font-black text-violet-400">
                    {num}
                  </span>
                </div>

                <div className=" mb-3 text-3xl">{emoji}</div>
                <h3
                  className=" mb-3 text-base font-bold"
                  style={{ color: "f3f4f6" }}
                >
                  {title}
                </h3>
                <p
                  className=" text-[14px] leading-relaxed"
                  style={{ color: "#6b7280" }}
                >
                  {desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

//
// Animated Counter
function AnimatedNumber({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start: number;
    const duration = 1800;
    const tick = (ts: number) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(eased * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {shown}
      {suffix}
    </span>
  );
}

// Stats Section

const STATS = [
  {
    value: 6,
    suffix: "",
    label: "Supported platforms",
    sub: "Instagram, LinkedIn, Twitter, Facebook, TikTok, YouTube",
  },
  {
    value: 5,
    suffix: "",
    label: "Workflow stages",
    sub: "Draft → In Review → Approved → Scheduled → Published",
  },
  {
    value: 100,
    suffix: "%",
    label: "Free to start",
    sub: "No credit card required. No setup fees. No surprises.",
  },
];

function StatsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="stats"
      className=" border-t px-6 py-20"
      style={{ background: "#080808", borderColor: "rgba(255,255,255,0.05)" }}
      ref={ref}
    >
      <div className=" mx-auto max-w-6xl">
        <motion.div
          className=" grid gap-6 md:grid-cols-3"
          variants={staggerContainer(0.1)}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {STATS.map(({ value, suffix, label, sub }) => (
            <motion.div
              key={label}
              variants={fadeUp}
              whileHover={{
                borderColor: "rgba(124,58,237,0.4)",
                transition: { duration: 0.2 },
              }}
              className=" rounded-2xl p-8 text-center"
              style={{
                background: "#111",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div
                className=" mb-2 text-[52px] font-black tracking-tight"
                style={{
                  backgroundImage: "linear-gradient(135deg, #ffffff, #a78bfa)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                <AnimatedNumber value={value} suffix={suffix} />
              </div>

              <p
                className=" mb-2 text-[15px] font-semibold"
                style={{ color: "#e5e7eb" }}
              >
                {label}
              </p>

              <p
                className=" text-[13px] leading-relaxed"
                style={{ color: "#6b7280" }}
              >
                {sub}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="cta"
      className=" border-t px-6 py-24"
      style={{ background: "#050505", borderColor: "rgba(255,255,255,0.05)" }}
    >
      <div className=" relative mx-auto max-w-3xl text-center" ref={ref}>
        <div
          className=" pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(124,58,237,0.14) 0%, transparent 70%)",
          }}
        />

        <motion.div
          className=" relative z-10"
          variants={staggerContainer()}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Badge */}
          <motion.div variants={fadeUp} className="mb-6">
            <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-[12px] font-medium text-violet-300">
              <Rocket className="h-3 w-3" />
              Free forever for personal use
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2
            variants={fadeUp}
            className="mb-5 text-[44px] font-black leading-tight tracking-tight text-white"
          >
            Start planning content
            <br />
            <span
              style={{
                background: "linear-gradient(135deg,#a78bfa,#7c3aed)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              the right way
            </span>
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="mb-10 text-[15px] leading-relaxed"
            style={{ color: "#6b7280" }}
          >
            No credit card required. No setup fees. Just a clean, fast content
            planning tool.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="mb-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              href={"/sign-up" as Route}
              className="group inline-flex items-center gap-2 rounded-xl bg-linear-to-br from-violet-600 to-violet-700 px-8 py-3.5 text-[15px] font-semibold text-white no-underline transition-shadow duration-300 hover:shadow-[0_0_40px_rgba(124,58,237,.5)]"
            >
              <Rocket className="h-4 w-4" />
              Get started free
              <motion.span
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="inline-block"
              >
                <ArrowRight className="h-4 w-4" />
              </motion.span>
            </Link>
            <Link
              href={"/sign-in" as Route}
              className="inline-flex items-center rounded-xl border border-white/10 px-8 py-3.5 text-[15px] font-medium no-underline transition-all duration-200 hover:border-violet-500/40 hover:text-violet-300"
              style={{ color: "#9ca3af" }}
            >
              Sign in
            </Link>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-6"
          >
            {["No credit card", "Cancel anytime", "100% your data"].map(
              (item) => (
                <span
                  key={item}
                  className="flex items-center gap-1.5 text-[12px]"
                  style={{ color: "#4b5563" }}
                >
                  <Check className="h-3 w-3 text-violet-500" />
                  {item}
                </span>
              ),
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Footer
function LandingFooter() {
  return (
    <footer
      className="border-t px-6 py-10"
      style={{ background: "#050505", borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-violet-500 to-violet-700">
            <LayoutDashboard className="h-3.5 w-3.5 text-white" />
          </div>
          <span
            className="text-[14px] font-semibold"
            style={{ color: "#9ca3af" }}
          >
            Content<span className="text-violet-400">Planner</span>
          </span>
        </div>

        <p className="text-[12px]" style={{ color: "#4b5563" }}>
          Built with Next.js 16 · TypeScript · Tailwind CSS · Deployed on Vercel
        </p>

        <div className="flex gap-5">
          {[
            { label: "Sign in", href: "/sign-in" },
            { label: "Sign up", href: "/sign-up" },
            { label: "Dashboard", href: "/dashboard" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href as Route}
              className="text-[12px] no-underline transition-colors duration-200 hover:text-white"
              style={{ color: "#6b7280" }}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function LandingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <div
        className=" overflow-x-hidden text-white"
        style={{ background: "#050505" }}
      >
        <LandingNav />
        <HeroSection />
        <TickerSection />
        <FeaturesSection />
        <HowItWorksSection />
        <StatsSection />
        <CTASection />
        <LandingFooter />
      </div>
    </MotionConfig>
  );
}
