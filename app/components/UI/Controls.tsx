'use client';

import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useStore, CameraMode } from '@/app/store/useStore';
import { useLayout } from '@/app/lib/useLayout';
import { cameraPositionFor, ALL_BODIES } from '@/app/lib/focusBody';
import {
  CAMERA_ICONS,
  IconPause,
  IconPlay,
  IconLayers,
  IconSearch,
  IconEyeOff,
  IconKeyboard,
  LogoMark,
} from './icons';
import styles from './Controls.module.scss';

const SPEEDS = [
  { value: 1, label: '1×' },
  { value: 100, label: '100×' },
  { value: 10000, label: '10k×' },
  { value: 100000, label: '100k×' },
  { value: 500000, label: '500k×' },
];

const CAMERA_MODES: { mode: Exclude<CameraMode, 'destination-preview'>; label: string }[] = [
  { mode: 'free', label: 'Free camera' },
  { mode: 'follow-spaceship', label: 'Follow ship' },
  { mode: 'planet-focus', label: 'Focus planet' },
];

const SHORTCUTS: [string, string][] = [
  ['Space', 'Play / pause'],
  ['1 – 5', 'Time speed'],
  ['C', 'Cycle camera'],
  ['/', 'Search destinations'],
  ['O', 'Orbits'],
  ['L', 'Labels'],
  ['F', 'FPS meter'],
  ['H', 'Hide interface'],
  ['Esc', 'Close panels'],
];

const speedLabel = (v: number) => SPEEDS.find((s) => s.value === v)?.label ?? `${v}×`;

/* ----------------------------------------------------------------------------
 * Hooks shared by every layout
 * ------------------------------------------------------------------------- */

function useSimDate() {
  const simulationTime = useStore((s) => s.simulationTime);
  const [start] = useState(() => Date.now());
  return new Date(start + simulationTime * 1000);
}

function useCamera() {
  const cameraMode = useStore((s) => s.cameraMode);
  const setCameraMode = useStore((s) => s.setCameraMode);

  const choose = (mode: CameraMode) => {
    const { selectedPlanet, focusedPlanetName, destination, simulationTime, scaleMode, setCameraTarget } =
      useStore.getState();
    // Re-choosing the current mode re-centres it (e.g. snap back to the ship).
    if (mode === cameraMode) {
      setCameraMode('free');
      setTimeout(() => setCameraMode(mode), 0);
      return;
    }
    if (mode === 'planet-focus') {
      const body =
        selectedPlanet ??
        ALL_BODIES.find((b) => b.name === focusedPlanetName) ??
        destination ??
        ALL_BODIES.find((b) => b.name === 'Earth')!;
      setCameraTarget(cameraPositionFor(body, simulationTime, scaleMode), body.name);
    }
    setCameraMode(mode);
  };

  const cycle = () => {
    const i = CAMERA_MODES.findIndex((m) => m.mode === cameraMode);
    choose(CAMERA_MODES[(i + 1) % CAMERA_MODES.length].mode);
  };

  const current = CAMERA_MODES.find((m) => m.mode === cameraMode) ?? CAMERA_MODES[0];
  return { cameraMode, choose, cycle, current };
}

/** Close a popover on outside click / Escape. */
function useDismiss(open: boolean, close: () => void, ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open, close, ref]);
}

/* ----------------------------------------------------------------------------
 * Pieces
 * ------------------------------------------------------------------------- */

function PlayPause({ size = 44 }: { size?: number }) {
  const isPaused = useStore((s) => s.isPaused);
  const setIsPaused = useStore((s) => s.setIsPaused);
  return (
    <button
      type="button"
      className={styles.play}
      style={{ width: size, height: size, flexBasis: size }}
      aria-label={isPaused ? 'Play (Space)' : 'Pause (Space)'}
      onClick={() => setIsPaused(!isPaused)}
    >
      {isPaused ? <IconPlay size={size < 40 ? 14 : 16} /> : <IconPause size={size < 40 ? 14 : 16} />}
    </button>
  );
}

function DateButton({ showTime }: { showTime: boolean }) {
  const date = useSimDate();
  const setSimulationTime = useStore((s) => s.setSimulationTime);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const wrap = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), wrap);

  const toInput = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const apply = () => {
    if (!value) return;
    setSimulationTime((new Date(value).getTime() - Date.now()) / 1000);
    setOpen(false);
  };

  return (
    <div className={styles.popWrap} ref={wrap}>
      <button
        type="button"
        className={styles.date}
        aria-label="Change simulation date"
        aria-expanded={open}
        onClick={() => {
          setValue(toInput(date));
          setOpen(!open);
        }}
      >
        <span>{date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        {showTime && (
          <span className={styles.time}>
            {date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        )}
      </button>
      {open && (
        <div className={`${styles.popover} ${styles.datePop}`} role="dialog" aria-label="Simulation date">
          <label className={styles.popLabel}>
            Jump to date
            <input
              type="date"
              className={styles.dateInput}
              value={value}
              min="1900-01-01"
              max="2100-12-31"
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <div className={styles.popActions}>
            <button type="button" className={styles.ghost} onClick={() => { setSimulationTime(0); setOpen(false); }}>
              Now
            </button>
            <button type="button" className={styles.primarySmall} onClick={apply}>
              Go
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SpeedSegments() {
  const timeSpeed = useStore((s) => s.timeSpeed);
  const setTimeSpeed = useStore((s) => s.setTimeSpeed);
  return (
    <div className={styles.segments} role="radiogroup" aria-label="Time speed">
      {SPEEDS.map(({ value, label }, i) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={timeSpeed === value}
          title={`${label} (${i + 1})`}
          className={styles.segment}
          onClick={() => setTimeSpeed(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function SpeedCycle() {
  const timeSpeed = useStore((s) => s.timeSpeed);
  const setTimeSpeed = useStore((s) => s.setTimeSpeed);
  const next = () => {
    const i = SPEEDS.findIndex((s) => s.value === timeSpeed);
    setTimeSpeed(SPEEDS[(i + 1) % SPEEDS.length].value);
  };
  return (
    <button
      type="button"
      className={styles.speedChip}
      aria-label={`Time speed ${speedLabel(timeSpeed)}. Tap for faster`}
      onClick={next}
    >
      {speedLabel(timeSpeed)}
    </button>
  );
}

function CameraRadios() {
  const { cameraMode, choose } = useCamera();
  return (
    <div className={styles.segments} role="radiogroup" aria-label="Camera">
      {CAMERA_MODES.map(({ mode, label }) => {
        const Icon = CAMERA_ICONS[mode];
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={cameraMode === mode}
            aria-label={label}
            title={`${label} (C)`}
            className={styles.iconBtn}
            onClick={() => choose(mode)}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}

const SHORT_LABEL: Record<string, string> = { free: 'Free', 'follow-spaceship': 'Ship', 'planet-focus': 'Planet' };

/** Portrait: always-visible, labelled view switch docked under the top bar (right edge). */
function ViewSwitch() {
  const { cameraMode, choose } = useCamera();
  return (
    <div className={styles.viewSwitch} role="radiogroup" aria-label="View">
      {CAMERA_MODES.map(({ mode, label }) => {
        const Icon = CAMERA_ICONS[mode];
        return (
          <button
            key={mode}
            type="button"
            role="radio"
            aria-checked={cameraMode === mode}
            aria-label={label}
            className={styles.viewBtn}
            onClick={() => choose(mode)}
          >
            <Icon size={18} />
            <span aria-hidden>{SHORT_LABEL[mode]}</span>
          </button>
        );
      })}
    </div>
  );
}

export function CameraCycle({ className }: { className?: string }) {
  const { cycle, current } = useCamera();
  const Icon = CAMERA_ICONS[current.mode];
  return (
    <button
      type="button"
      className={className ?? styles.iconBtn}
      aria-label={`Camera: ${current.label}. Tap to change`}
      onClick={cycle}
    >
      <Icon />
    </button>
  );
}

function Toggle({ label, keyHint, on, onChange }: { label: string; keyHint?: string; on: boolean; onChange: () => void }) {
  return (
    <label className={styles.toggleRow}>
      <span>{label}</span>
      {keyHint && <kbd className={styles.kbd}>{keyHint}</kbd>}
      <input type="checkbox" role="switch" checked={on} onChange={onChange} />
    </label>
  );
}

function LayersButton({ className, size }: { className?: string; size?: number }) {
  const layersOpen = useStore((s) => s.layersOpen);
  const setLayersOpen = useStore((s) => s.setLayersOpen);
  const s = useStore(
    useShallow((st) => ({
      showOrbits: st.showOrbits,
      showLabels: st.showLabels,
      showFPS: st.showFPS,
      unitSystem: st.unitSystem,
      toggleOrbits: st.toggleOrbits,
      toggleLabels: st.toggleLabels,
      toggleFPS: st.toggleFPS,
      setUnitSystem: st.setUnitSystem,
      toggleAllUI: st.toggleAllUI,
    }))
  );
  const wrap = useRef<HTMLDivElement>(null);
  useDismiss(layersOpen, () => setLayersOpen(false), wrap);

  return (
    <div className={styles.popWrap} ref={wrap}>
      <button
        type="button"
        className={className ?? styles.iconBtn}
        style={size ? { width: size, height: size, flexBasis: size } : undefined}
        aria-label="Layers and display options"
        aria-expanded={layersOpen}
        onClick={() => setLayersOpen(!layersOpen)}
      >
        <IconLayers />
      </button>
      {layersOpen && (
        <div className={`${styles.popover} ${styles.layersPop}`} role="dialog" aria-label="Layers">
          <Toggle label="Orbits" keyHint="O" on={s.showOrbits} onChange={s.toggleOrbits} />
          <Toggle label="Labels" keyHint="L" on={s.showLabels} onChange={s.toggleLabels} />
          <Toggle label="FPS meter" keyHint="F" on={s.showFPS} onChange={s.toggleFPS} />
          <div className={styles.popDivider} />
          <div className={styles.toggleRow}>
            <span>Units</span>
            <div className={styles.miniSeg} role="radiogroup" aria-label="Units">
              <button type="button" role="radio" aria-checked={s.unitSystem === 'metric'} onClick={() => s.setUnitSystem('metric')}>
                km
              </button>
              <button type="button" role="radio" aria-checked={s.unitSystem === 'imperial'} onClick={() => s.setUnitSystem('imperial')}>
                mi
              </button>
            </div>
          </div>
          <div className={styles.popDivider} />
          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setLayersOpen(false);
              s.toggleAllUI();
            }}
          >
            <IconEyeOff size={16} /> Hide interface <kbd className={styles.kbd}>H</kbd>
          </button>
        </div>
      )}
    </div>
  );
}

function ShortcutsButton() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  useDismiss(open, () => setOpen(false), wrap);
  return (
    <div className={styles.popWrap} ref={wrap}>
      <button
        type="button"
        className={styles.utilBtn}
        aria-label="Keyboard shortcuts"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <IconKeyboard />
      </button>
      {open && (
        <div className={`${styles.popover} ${styles.shortcutsPop}`} role="dialog" aria-label="Keyboard shortcuts">
          <dl className={styles.shortcuts}>
            {SHORTCUTS.map(([k, v]) => (
              <div key={k}>
                <dt><kbd className={styles.kbd}>{k}</kbd></dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------------------
 * Layouts
 * ------------------------------------------------------------------------- */

export default function Controls() {
  const layout = useLayout();
  const selectedPlanet = useStore((s) => s.selectedPlanet);
  const journeyStatus = useStore((s) => s.journeyStatus);
  const pickerOpen = useStore((s) => s.pickerOpen);
  const setPickerOpen = useStore((s) => s.setPickerOpen);
  const toggleAllUI = useStore((s) => s.toggleAllUI);
  const journeying = journeyStatus === 'traveling' || journeyStatus === 'arrived';

  if (layout === 'portrait') {
    const showBottomBar = !selectedPlanet && !pickerOpen && !journeying;
    return (
      <>
        <div className={styles.topBar}>
          {/* Brand only — the splash shows on first load and isn't reachable again. */}
          <div className={styles.brandTile} role="img" aria-label="Delta-V">
            <LogoMark size={28} />
          </div>
          <div className={styles.timeChip} role="group" aria-label="Time">
            <PlayPause size={36} />
            <DateButton showTime={false} />
            <SpeedCycle />
          </div>
          <LayersButton className={styles.utilBtn} />
        </div>

        <ViewSwitch />

        {showBottomBar && (
          <div className={styles.bottomBar} role="toolbar" aria-label="Explore">
            <button type="button" className={styles.destinations} onClick={() => setPickerOpen(true)}>
              <IconSearch size={18} /> Destinations
            </button>
          </div>
        )}
      </>
    );
  }

  if (layout === 'landscape') {
    if (pickerOpen) return null;
    return (
      <div
        className={`${styles.pill} ${styles.pillCompact} ${selectedPlanet || journeying ? styles.pillShifted : ''}`}
        role="toolbar"
        aria-label="Simulation controls"
      >
        <PlayPause />
        <DateButton showTime={false} />
        <SpeedCycle />
        <span className={styles.sep} aria-hidden />
        <CameraCycle />
        <LayersButton />
      </div>
    );
  }

  return (
    <>
      <div className={styles.utilities}>
        <ShortcutsButton />
        <button type="button" className={styles.utilBtn} aria-label="Hide interface (H)" onClick={toggleAllUI}>
          <IconEyeOff />
        </button>
      </div>
      <div className={styles.pill} role="toolbar" aria-label="Simulation controls">
        <PlayPause />
        <DateButton showTime />
        <span className={styles.sep} aria-hidden />
        <SpeedSegments />
        <span className={styles.sep} aria-hidden />
        <CameraRadios />
        <span className={styles.sep} aria-hidden />
        <LayersButton />
      </div>
    </>
  );
}
