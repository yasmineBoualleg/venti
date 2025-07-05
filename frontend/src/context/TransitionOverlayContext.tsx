import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TransitionOverlayContextType {
  triggerTransition: (e: React.MouseEvent, path: string) => void;
  isTransitioning: boolean;
}

const TransitionOverlayContext = createContext<TransitionOverlayContextType>({
  triggerTransition: () => {},
  isTransitioning: false,
});

export const useTransitionOverlay = () => useContext(TransitionOverlayContext);

function isMobile() {
  return window.innerWidth <= 640;
}

export const TransitionOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [active, setActive] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [radius, setRadius] = useState(0);
  const [targetPath, setTargetPath] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const VENTI_BLUE = 'rgba(37, 99, 235, 0.82)'; // #2563eb with glass alpha

  const triggerTransition = (e: React.MouseEvent, path: string) => {
    let x: number, y: number;
    if (isMobile()) {
      // Try to get the hamburger button position
      const hamburger = document.querySelector('.venti-hamburger');
      if (hamburger) {
        const rect = hamburger.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else {
        // fallback to bottom left
        x = 40;
        y = window.innerHeight - 40;
      }
    } else {
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      x = rect.left + rect.width / 2;
      y = rect.top + rect.height / 2;
    }
    setCoords({ x, y });
    // Calculate max distance to any corner
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const distances = [
      Math.hypot(x, y), // top-left
      Math.hypot(vw - x, y), // top-right
      Math.hypot(x, vh - y), // bottom-left
      Math.hypot(vw - x, vh - y), // bottom-right
    ];
    const maxRadius = Math.max(...distances);
    setRadius(maxRadius + 10); // add a little extra
    setTargetPath(path);
    setActive(true);
    setIsTransitioning(true);
  };

  const handleAnimationComplete = () => {
    if (targetPath) {
      navigate(targetPath);
      // Uncover after short delay
      timeoutRef.current = setTimeout(() => {
        setActive(false);
        setTargetPath(null);
        setIsTransitioning(false);
      }, 700); // match exit duration
    }
  };

  return (
    <TransitionOverlayContext.Provider value={{ triggerTransition, isTransitioning }}>
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            key="morph-overlay"
            initial={{
              clipPath: `circle(0px at ${coords.x}px ${coords.y}px)`,
              opacity: 0.7,
            }}
            animate={{
              clipPath: `circle(${radius}px at ${coords.x}px ${coords.y}px)`,
              opacity: 1,
              transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] },
            }}
            exit={{
              clipPath: `circle(0px at ${coords.x}px ${coords.y}px)`,
              opacity: 0.7,
              transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
            }}
            style={{
              background: VENTI_BLUE,
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              zIndex: 9999,
              pointerEvents: 'none',
              boxShadow: '0 0 80px 20px #2563eb55',
              backdropFilter: 'blur(18px) saturate(1.5)',
              WebkitBackdropFilter: 'blur(18px) saturate(1.5)',
              border: '1.5px solid rgba(255,255,255,0.18)',
            }}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </AnimatePresence>
    </TransitionOverlayContext.Provider>
  );
}; 