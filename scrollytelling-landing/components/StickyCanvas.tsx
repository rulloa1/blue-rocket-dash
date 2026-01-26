'use client';

import { useEffect, useRef, useState } from 'react';
import { useScroll, useSpring, useMotionValueEvent } from 'framer-motion';

const FRAME_COUNT = 120;

interface StickyCanvasProps {
    onProgress?: (val: number) => void;
    onLoaded?: () => void;
}

export default function StickyCanvas({ onProgress, onLoaded }: StickyCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Scroll progress for the entire page container
    const { scrollYProgress } = useScroll();

    // Smooth the scroll progress to avoid jitter
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Preload images
    useEffect(() => {
        let loadedCount = 0;
        const imgs: HTMLImageElement[] = [];

        const loadImages = async () => {
            for (let i = 0; i < FRAME_COUNT; i++) {
                const img = new Image();
                // Using .svg as per my generation script. If real project, use .webp
                img.src = `/sequence/frame_${i}.svg`;

                await new Promise<void>((resolve) => {
                    img.onload = () => {
                        loadedCount++;
                        if (onProgress) onProgress(((loadedCount / FRAME_COUNT) * 100)); // Update loading progress
                        resolve();
                    };
                    img.onerror = () => resolve(); // Skip errors but continue
                });
                imgs.push(img);
            }
            setImages(imgs);
            setIsLoaded(true);
            if (onLoaded) onLoaded();
        };

        loadImages();
    }, [onProgress, onLoaded]);

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size to window size * dpi
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;

            // CSS size
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;

            // Scale context
            ctx.scale(dpr, dpr);

            // Redraw current frame immediately
            const currentScroll = smoothProgress.get();
            const frameIndex = Math.min(
                FRAME_COUNT - 1,
                Math.floor(currentScroll * FRAME_COUNT)
            );
            if (images[frameIndex]) {
                renderFrame(ctx, images[frameIndex]);
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Init

        return () => window.removeEventListener('resize', handleResize);
    }, [images, smoothProgress, isLoaded]);

    // Render logic
    const renderFrame = (ctx: CanvasRenderingContext2D, img: HTMLImageElement) => {
        const canvas = ctx.canvas;
        // We used dpr scaling in context, so logical dimensions are:
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Calculate "contain" fit
        const imgRatio = 16 / 9; // Assuming 1920x1080 as per svg gen
        const canvasRatio = width / height;

        let drawWidth, drawHeight;

        if (canvasRatio > imgRatio) {
            // Canvas is wider than image -> fit to height
            drawHeight = height;
            drawWidth = height * imgRatio;
        } else {
            // Canvas is taller than image -> fit to width
            drawWidth = width;
            drawHeight = width / imgRatio;
        }

        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
    };

    // Animation Loop
    useMotionValueEvent(smoothProgress, "change", (latest) => {
        if (!isLoaded || images.length === 0) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const frameIndex = Math.min(
            FRAME_COUNT - 1,
            Math.floor(latest * FRAME_COUNT)
        );

        const img = images[frameIndex];
        if (img) {
            renderFrame(ctx, img);
        }
    });

    return (
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050505] flex items-center justify-center">
            <canvas ref={canvasRef} className="block" />
        </div>
    );
}
