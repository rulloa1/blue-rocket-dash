'use client';

import { useState } from 'react';
import { useScroll } from 'framer-motion';
import StickyCanvas from '@/components/StickyCanvas';
import TextOverlay from '@/components/TextOverlay';
import LoadingScreen from '@/components/LoadingScreen';

export default function Home() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const { scrollYProgress } = useScroll();

  return (
    <main className="relative bg-[#050505] min-h-screen">
      {/* Loading Screen - visible until loaded */}
      {!isLoaded && (
        <LoadingScreen progress={loadingProgress} />
      )}

      {/* 
        Scroll Container 
        Height = 400vh to give enough scroll distance for the animation
      */}
      <div className="relative h-[400vh]">
        {/* Sticky Canvas Backend */}
        <StickyCanvas
          onProgress={setLoadingProgress}
          onLoaded={() => setIsLoaded(true)}
        />

        {/* Scrollytelling Overlay - Fixed Position managed inside component or absolute here?
            The TextOverlay uses fixed positioning internally to stay on screen.
            We pass scrollYProgress to sync it.
         */}
        <div className="absolute inset-0 pointer-events-none">
          <TextOverlay scrollProgress={scrollYProgress} />
        </div>
      </div>

      {/* Footer / buffer area if needed */}
      <div className="h-screen bg-[#050505] flex items-center justify-center">
        <p className="text-white/30 text-sm">END OF SEQUENCE</p>
      </div>
    </main>
  );
}
