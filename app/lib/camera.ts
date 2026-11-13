import { useStore, type CameraMode } from '@/app/store/useStore';
import { ALL_BODIES, cameraPositionFor } from './focusBody';

export type ViewMode = Exclude<CameraMode, 'destination-preview'>;
export const VIEW_ORDER: ViewMode[] = ['free', 'follow-spaceship', 'planet-focus'];

/** The ship only exists in the scene during a trip. */
export const shipAvailable = () => {
  const { journeyStatus } = useStore.getState();
  return journeyStatus === 'traveling' || journeyStatus === 'arrived';
};

/**
 * Switch the camera view and make the scene act on it (used by the view buttons and the C key):
 * - free:   fly back out to the whole-system overview
 * - ship:   jump in behind the spacecraft (only during a trip)
 * - planet: fly in close to the selected / last-viewed body, else the trip destination, else Earth
 */
export function chooseView(mode: ViewMode) {
  const s = useStore.getState();
  if (mode === 'follow-spaceship' && !shipAvailable()) return;

  if (mode === 'planet-focus') {
    const body =
      s.selectedPlanet ??
      ALL_BODIES.find((b) => b.name === s.focusedPlanetName) ??
      s.destination ??
      ALL_BODIES.find((b) => b.name === 'Earth')!;
    s.setCameraTarget(cameraPositionFor(body, s.simulationTime, s.scaleMode), body.name);
  }
  s.requestCamera(mode);
}

/** Next available view (skips Ship when there's no trip). */
export function cycleView() {
  const { cameraMode } = useStore.getState();
  const order = VIEW_ORDER.filter((m) => m !== 'follow-spaceship' || shipAvailable());
  const i = order.indexOf(cameraMode as ViewMode);
  chooseView(order[(i + 1) % order.length]);
}
