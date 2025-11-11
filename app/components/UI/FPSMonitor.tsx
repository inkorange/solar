'use client';

import { useRef, useState, useEffect } from 'react';
import { useStore } from '@/app/store/useStore';
import styles from './FPSMonitor.module.scss';

export default function FPSMonitor() {
  const showFPS = useStore((state) => state.showFPS);
  const [fps, setFps] = useState(60);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!showFPS) return;

    const updateFPS = () => {
      frameCountRef.current++;
      const currentTime = Date.now();
      const elapsed = currentTime - lastTimeRef.current;

      // Update FPS every 500ms
      if (elapsed >= 500) {
        const currentFps = Math.round((frameCountRef.current * 1000) / elapsed);
        setFps(currentFps);
        frameCountRef.current = 0;
        lastTimeRef.current = currentTime;
      }

      rafIdRef.current = requestAnimationFrame(updateFPS);
    };

    rafIdRef.current = requestAnimationFrame(updateFPS);

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [showFPS]);

  if (!showFPS) return null;

  const getColorClass = () => {
    if (fps >= 55) return styles.good;
    if (fps >= 30) return styles.medium;
    return styles.poor;
  };

  return (
    <div className={styles.fpsMonitor}>
      <div className={styles.label}>FPS</div>
      <div className={`${styles.value} ${getColorClass()}`}>{fps}</div>
    </div>
  );
}
