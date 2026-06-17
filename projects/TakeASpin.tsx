'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  motion,
  AnimatePresence,
  useAnimationFrame,
  useMotionValue,
  useTransform,
  animate,
} from 'framer-motion';

/* ─────────────────────────────────────────────
   Card data — images from assets/Chill Manner/i/
   ───────────────────────────────────────────── */
const CARDS = [
  { id: 1, label: 'Onboarding', img: '/assets/Chill Manner/i/i1.png' },
  { id: 2, label: 'Home Feed',  img: '/assets/Chill Manner/i/i2.png' },
  { id: 3, label: 'Explore',    img: '/assets/Chill Manner/i/i3.png' },
  { id: 4, label: 'Messages',   img: '/assets/Chill Manner/i/i4.png' },
  { id: 5, label: 'Profile',    img: '/assets/Chill Manner/i/i5.png' },
  { id: 6, label: 'Settings',   img: '/assets/Chill Manner/i/i6.png' },
  { id: 7, label: 'Analytics',  img: '/assets/Chill Manner/i/i7.png' },
  { id: 8, label: 'Rewards',    img: '/assets/Chill Manner/i/i8.png' },
];

const ORBIT_RADIUS = 280;
const NORMAL_SPEED = (2 * Math.PI) / 18000; // rad/ms — full rotation in 18s
const ACCEL_SPEED = (2 * Math.PI) / 3000;   // rad/ms — full rotation in 3s
const TOTAL = CARDS.length;

/* ─────────────────────────────────────────────
   Depth helpers
   ───────────────────────────────────────────── */
function depthFactor(worldAngle: number): number {
  // Normalize: front (closest to viewer) = 1, back = 0
  const raw = Math.cos(worldAngle + Math.PI / 2);
  return (raw + 1) / 2; // [0, 1]
}

function sideFactor(worldAngle: number): number {
  // -1 (left) to +1 (right)
  return Math.sin(worldAngle + Math.PI / 2);
}

/* ─────────────────────────────────────────────
   Component
   ───────────────────────────────────────────── */
export default function TakeASpin() {
  /* ── State ── */
  const [phase, setPhase] = useState<'idle' | 'orbiting' | 'spinning' | 'stopped'>('idle');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [winnerId, setWinnerId] = useState<number | null>(null);

  /* ── Refs ── */
  const speedRef = useRef(NORMAL_SPEED);
  const spinTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const decelerateRef = useRef(false);

  /* ── Motion values ── */
  const rotationRad = useMotionValue(0);          // current orbit rotation in radians

  /* ── RAF orbit driver ── */
  useAnimationFrame((_time, delta) => {
    const current = rotationRad.get();

    if (decelerateRef.current) {
      // Exponential deceleration
      const newSpeed = speedRef.current * 0.97;
      speedRef.current = newSpeed;
      if (newSpeed < 0.00005) {
        // Fully stopped
        speedRef.current = 0;
        decelerateRef.current = false;
        // Pick winner: card closest to front (depthFactor ~ 1)
        pickWinner(current);
        return;
      }
    }

    rotationRad.set(current + speedRef.current * delta);
  });

  /* ── Pick the card nearest the front ── */
  function pickWinner(currentAngle: number) {
    let bestId = CARDS[0].id;
    let bestDepth = -Infinity;
    CARDS.forEach((card, i) => {
      const baseAngle = (2 * Math.PI * i) / TOTAL - Math.PI / 2;
      const worldAngle = (baseAngle + currentAngle) % (2 * Math.PI);
      const d = depthFactor(worldAngle);
      if (d > bestDepth) {
        bestDepth = d;
        bestId = card.id;
      }
    });
    setWinnerId(bestId);
    setSelectedId(bestId);
    setPhase('stopped');
  }

  /* ── "Take a Spin" handler ── */
  const handleSpin = useCallback(() => {
    if (phase !== 'orbiting') return;
    setPhase('spinning');
    setWinnerId(null);
    setSelectedId(null);
    decelerateRef.current = false;

    // Accelerate
    speedRef.current = ACCEL_SPEED;

    // After 3s, start decelerating
    spinTimer.current = setTimeout(() => {
      decelerateRef.current = true;
    }, 3000);
  }, [phase]);

  /* ── Start orbit ── */
  const handleStart = useCallback(() => {
    setPhase('orbiting');
    speedRef.current = NORMAL_SPEED;
    decelerateRef.current = false;
    setSelectedId(null);
    setWinnerId(null);
  }, []);

  /* ── Reset ── */
  const handleReset = useCallback(() => {
    setPhase('idle');
    setSelectedId(null);
    setWinnerId(null);
    speedRef.current = NORMAL_SPEED;
    decelerateRef.current = false;
    rotationRad.set(0);
    if (spinTimer.current) clearTimeout(spinTimer.current);
  }, []);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => { if (spinTimer.current) clearTimeout(spinTimer.current); };
  }, []);

  /* ── Selected card data ── */
  const winnerCard = CARDS.find((c) => c.id === winnerId);

  return (
    <section
      className="
        relative flex flex-col items-center justify-center
        min-h-screen w-full overflow-hidden
        bg-[#FFF6F1]
      "
      style={{ perspective: 1200 }}
    >

      {/* ── Decorative cosmos dots ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-pink-300/15"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* ── Orbit guide ring ── */}
      {(phase === 'orbiting' || phase === 'spinning' || phase === 'stopped') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="absolute rounded-full border border-pink-200/15 pointer-events-none"
          style={{ width: ORBIT_RADIUS * 2, height: ORBIT_RADIUS * 2 }}
        />
      )}

      {/* ── Center "Spin to explore" label ── */}
      {(phase === 'orbiting' || phase === 'spinning') && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute z-0 text-[11px] font-medium tracking-[0.2em] text-pink-300/50 uppercase pointer-events-none"
        >
          Spin to explore
        </motion.span>
      )}

      {/* ── Cards ── */}
      <AnimatePresence>
        {(phase === 'orbiting' || phase === 'spinning' || phase === 'stopped') &&
          CARDS.map((card, i) => {
            const baseAngle = (2 * Math.PI * i) / TOTAL - Math.PI / 2;
            const isSelected = selectedId === card.id;
            const isWinner = winnerId === card.id;

            /* Derive live values from rotationRad */
            const worldAngle = useTransform(rotationRad, (r) =>
              ((baseAngle + r) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI)
            );

            const x = useTransform(worldAngle, (a) => Math.cos(a) * ORBIT_RADIUS);
            const y = useTransform(worldAngle, (a) => Math.sin(a) * ORBIT_RADIUS);

            const depth = useTransform(worldAngle, depthFactor);            // 0 (back) → 1 (front)
            const side  = useTransform(worldAngle, sideFactor);             // -1 (left) → 1 (right)

            const cardScale = useTransform(depth, (d) => 0.6 + d * 0.4);     // 0.6 → 1
            const cardOpacity = useTransform(depth, (d) => 0.35 + d * 0.65); // 0.35 → 1
            const cardBlur = useTransform(depth, (d) => `${(1 - d) * 4}px`);
            const cardRotateY = useTransform(side, (s) => s * 35);           // -35° → 35°
            const cardZ = useTransform(depth, (d) => d * 60 - 30);           // z depth

            return (
              <motion.div
                key={card.id}
                className="absolute flex items-center justify-center"
                style={{
                  left: '50%',
                  top: '50%',
                  width: 120,
                  height: 170,
                  marginLeft: -60,
                  marginTop: -85,
                  x: isWinner ? 0 : x,
                  y: isWinner ? 0 : y,
                  scale: isWinner ? 1.25 : cardScale,
                  opacity: isWinner ? 1 : (isSelected ? 1 : cardOpacity),
                  filter: isWinner ? 'blur(0px)' : cardBlur,
                  rotateY: isWinner ? 0 : cardRotateY,
                  z: isWinner ? 100 : cardZ,
                  zIndex: isWinner ? 50 : 1,
                }}
                transition={
                  isWinner
                    ? { duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }
                    : { duration: 0 }
                }
                onClick={() => {
                  if (phase === 'spinning' || phase === 'stopped') return;
                }}
              >
                {/* Glassmorphism card */}
                <motion.div
                  className="
                    relative w-full h-full
                    rounded-2xl overflow-hidden
                    border border-white/50
                    cursor-pointer select-none
                    shadow-lg
                  "
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    boxShadow: isWinner
                      ? '0 30px 70px rgba(222,18,128,0.22), 0 10px 25px rgba(0,0,0,0.07)'
                      : '0 4px 20px rgba(0,0,0,0.04)',
                  }}
                  whileHover={
                    phase !== 'spinning' && !isWinner
                      ? { scale: 1.05, y: -8, boxShadow: '0 14px 40px rgba(222,18,128,0.16), 0 6px 14px rgba(0,0,0,0.06)' }
                      : {}
                  }
                >
                  <img
                    src={card.img}
                    alt={card.label}
                    className="w-full h-full object-cover"
                    draggable={false}
                  />

                  {/* Label badge */}
                  <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-white/90 to-transparent">
                    <span className="text-[10px] font-semibold text-gray-600 tracking-wide">
                      {card.label}
                    </span>
                  </div>

                  {/* Winner CTA */}
                  {isWinner && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.4 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-black/5 rounded-2xl"
                    >
                      <motion.button
                        initial={{ opacity: 0, y: 12, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 0.7, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                        className="
                          px-5 py-2
                          text-xs font-semibold tracking-wider
                          text-white rounded-full
                          shadow-lg
                        "
                        style={{ background: 'linear-gradient(135deg, #DE1280, #FF4DA6)' }}
                        whileHover={{ scale: 1.08 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Case Study
                      </motion.button>
                    </motion.div>
                  )}
                </motion.div>
              </motion.div>
            );
          })}
      </AnimatePresence>

      {/* ── Backdrop blur when stopped ── */}
      {phase === 'stopped' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-10 backdrop-blur-[2px] bg-white/10"
          onClick={handleReset}
        />
      )}

      {/* ── "Take a Spin" button ── */}
      <AnimatePresence mode="wait">
        {phase === 'idle' && (
          <motion.button
            key="start-btn"
            onClick={handleStart}
            initial={{ opacity: 0, scale: 0.85, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -15 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="
              relative z-20 px-14 py-5
              text-2xl font-semibold tracking-wide
              text-white rounded-full
              shadow-xl shadow-pink-200/40
              cursor-pointer select-none
            "
            style={{ background: 'linear-gradient(135deg, #DE1280, #FF4DA6)' }}
            whileHover={{ scale: 1.06, boxShadow: '0 22px 55px rgba(222,18,128,0.35)' }}
            whileTap={{ scale: 0.96 }}
          >
            Take a Spin
          </motion.button>
        )}

        {phase === 'orbiting' && (
          <motion.button
            key="spin-btn"
            onClick={handleSpin}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="
              absolute bottom-16 z-20 px-10 py-3.5
              text-base font-semibold tracking-wide
              text-white rounded-full
              shadow-lg shadow-pink-200/35
              cursor-pointer select-none
            "
            style={{ background: 'linear-gradient(135deg, #DE1280, #FF4DA6)' }}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
          >
            Take a Spin
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Winner CTA below ── */}
      <AnimatePresence>
        {phase === 'stopped' && winnerCard && (
          <motion.div
            key="winner-cta"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.8, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute bottom-12 z-30 flex flex-col items-center gap-3"
          >
            <p className="text-sm text-pink-400/70 tracking-wider font-medium">
              🎯 {winnerCard.label}
            </p>
            <motion.button
              className="
                px-8 py-3
                text-sm font-semibold tracking-wider
                text-white rounded-full
                shadow-lg shadow-pink-300/30
              "
              style={{ background: 'linear-gradient(135deg, #DE1280, #FF4DA6)' }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
            >
              View Case Study →
            </motion.button>
            <button
              onClick={handleReset}
              className="text-xs text-pink-300/60 hover:text-pink-400 tracking-wider mt-1"
            >
              Spin Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
