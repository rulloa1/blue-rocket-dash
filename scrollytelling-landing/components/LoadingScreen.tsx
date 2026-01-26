'use client';

import { motion } from 'framer-motion';

interface LoadingScreenProps {
    progress: number;
}

export default function LoadingScreen({ progress }: LoadingScreenProps) {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505] text-white"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
        >
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mb-4">
                <motion.div
                    className="h-full bg-white"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
            <div className="text-sm font-mono text-white/50 tracking-widest">
                INITIALIZING SYSTEM... {Math.round(progress)}%
            </div>
        </motion.div>
    );
}
