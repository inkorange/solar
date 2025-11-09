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

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <div className={styles.features}>
              <h2>Welcome to Your Journey</h2>
              <ul>
                <li>Explore our solar system with detailed scientific data and facts</li>
                <li>Navigate using the left panel or search for specific planets</li>
                <li>Select destinations and travel between celestial bodies</li>
                <li>Choose from 6 different propulsion methods (chemical to warp drive!)</li>
                <li>Experience realistic travel times based on actual physics</li>
                <li>Toggle orbital paths and labels for better understanding</li>
                <li>Switch camera modes to follow your spaceship or focus on planets</li>
              </ul>
            </div>

            {/* <div className={styles.controls}>
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
                  <strong>Click on Planet or Use Navigation Panel</strong>
                </li>
                <li>
                  <span>Search Planets</span>
                  <strong>Use Search Box in Navigation Panel</strong>
                </li>
                <li>
                  <span>Time & Camera Controls</span>
                  <strong>Bottom Panel - Play/Pause, Speed, Camera Modes</strong>
                </li>
                <li>
                  <span>Toggle Display</span>
                  <strong>Bottom Panel - Orbits, Labels</strong>
                </li>
              </ul>
            </div> */}
          </div>

          <div className={styles.rightColumn}>
            <div className={styles.educationalNote}>
              <h3>Educational Experience</h3>
              <p>
                This simulator uses real astronomical data and physics calculations to demonstrate the challenges of space travel.
                Distances and travel times are based on actual orbital mechanics and propulsion capabilities.
              </p>
            </div>

            <button
              className={styles.startButton}
              onClick={() => setShowWelcome(false)}
            >
              Start Journey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
