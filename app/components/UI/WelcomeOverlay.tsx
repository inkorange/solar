'use client';

import { useStore } from '@/app/store/useStore';
import styles from './WelcomeOverlay.module.scss';

export default function WelcomeOverlay() {
  const { showWelcome, setShowWelcome } = useStore();

  if (!showWelcome) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h1>Celestial Vehicle Propulsion Simulator</h1>
        <p className={styles.subtitle}>
          Explore our solar system and experience the reality of space travel
        </p>

        <div className={styles.features}>
          <h2>Welcome to Your Journey</h2>
          <ul>
            <li>Explore all 8 planets with scientifically accurate data</li>
            <li>Select destinations and travel between celestial bodies</li>
            <li>Choose from 6 different propulsion methods (chemical to warp drive!)</li>
            <li>Experience realistic travel times and physics calculations</li>
          </ul>
        </div>

        <div className={styles.controls}>
          <h3>Quick Controls</h3>
          <ul>
            <li>
              <span>Rotate View</span>
              <strong>Click + Drag</strong>
            </li>
            <li>
              <span>Zoom</span>
              <strong>Scroll Wheel</strong>
            </li>
            <li>
              <span>Select Planet</span>
              <strong>Click on Planet</strong>
            </li>
            <li>
              <span>Control Time</span>
              <strong>Bottom Panel</strong>
            </li>
          </ul>
        </div>

        <button
          className={styles.startButton}
          onClick={() => setShowWelcome(false)}
        >
          Start Journey
        </button>
      </div>
    </div>
  );
}
