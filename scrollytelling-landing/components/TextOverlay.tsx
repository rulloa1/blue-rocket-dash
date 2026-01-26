'use client';

import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface TextOverlayProps {
    scrollProgress: MotionValue<number>;
}

export default function TextOverlay({ scrollProgress }: TextOverlayProps) {
    // Helper to create fade in/out effects based on scroll ranges
    // Beat A: 0-20%
    const opacityA = useTransform(scrollProgress, [0, 0.1, 0.15, 0.2], [0, 1, 1, 0]);
    const yA = useTransform(scrollProgress, [0, 0.1, 0.2], [20, 0, -20]);

    // Beat B: 25-45%
    const opacityB = useTransform(scrollProgress, [0.25, 0.3, 0.4, 0.45], [0, 1, 1, 0]);
    const yB = useTransform(scrollProgress, [0.25, 0.35, 0.45], [20, 0, -20]);

    // Beat C: 50-70%
    const opacityC = useTransform(scrollProgress, [0.5, 0.55, 0.65, 0.7], [0, 1, 1, 0]);
    const yC = useTransform(scrollProgress, [0.5, 0.6, 0.7], [20, 0, -20]);

    // Beat D: 75-95%
    const opacityD = useTransform(scrollProgress, [0.75, 0.8, 0.9, 0.95], [0, 1, 1, 0]);
    const yD = useTransform(scrollProgress, [0.75, 0.85, 0.95], [20, 0, -20]);

    return (
        <div className="fixed inset-0 pointer-events-none z-10 flex flex-col justify-center">

            {/* Beat A - Center */}
            <motion.div
                style={{ opacity: opacityA, y: yA }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
                <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white/90 mb-4">
                    EVOLUTION
                </h1>
                <p className="text-xl md:text-2xl text-white/60 font-light tracking-wide">
                    Witness the future taking shape.
                </p>
            </motion.div>

            {/* Beat B - Left */}
            <motion.div
                style={{ opacity: opacityB, y: yB }}
                className="absolute inset-0 flex items-center p-8 md:pl-24"
            >
                <div className="max-w-xl">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90 mb-4">
                        PRECISION
                    </h2>
                    <p className="text-lg text-white/60">
                        Engineered to perfection. Every detail matters.
                    </p>
                    <div className="mt-4 text-sm text-cyan-400 font-mono tracking-widest uppercase">
            // Core Assembly
                    </div>
                </div>
            </motion.div>

            {/* Beat C - Right */}
            <motion.div
                style={{ opacity: opacityC, y: yC }}
                className="absolute inset-0 flex items-center justify-end p-8 md:pr-24"
            >
                <div className="max-w-xl text-right">
                    <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90 mb-4">
                        PWR & SPD
                    </h2>
                    <p className="text-lg text-white/60">
                        Unleashing raw performance in every movement.
                    </p>
                    <div className="mt-4 text-sm text-cyan-400 font-mono tracking-widest uppercase">
            // System Active
                    </div>
                </div>
            </motion.div>

            {/* Beat D - Center CTA */}
            <motion.div
                style={{ opacity: opacityD, y: yD }}
                className="absolute inset-0 flex flex-col items-center justify-center text-center p-8"
            >
                <h2 className="text-6xl md:text-8xl font-bold tracking-tighter text-white/90 mb-8">
                    EXPERIENCE IT
                </h2>
                <p className="text-xl text-white/60 mb-8 max-w-lg">
                    The next generation is here. Are you ready?
                </p>
                <button className="pointer-events-auto px-8 py-4 bg-white text-black font-bold tracking-widest text-sm hover:bg-gray-200 transition-colors uppercase">
                    Pre-Order Now
                </button>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/30 text-xs tracking-widest uppercase animate-pulse"
                style={{ opacity: useTransform(scrollProgress, [0, 0.1], [1, 0]) }}
            >
                Scroll to Explore
            </motion.div>

        </div>
    );
}
