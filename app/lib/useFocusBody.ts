'use client';

import { useCallback } from 'react';
import { useStore } from '@/app/store/useStore';
import type { PlanetData } from '@/app/data/planets';
import { cameraPositionFor } from './focusBody';

/** Select a body, fly the camera to it and switch to planet-focus mode. */
export function useFocusBody() {
  const setSelectedPlanet = useStore((s) => s.setSelectedPlanet);
  const setCameraTarget = useStore((s) => s.setCameraTarget);
  const setCameraMode = useStore((s) => s.setCameraMode);
  const setPickerOpen = useStore((s) => s.setPickerOpen);

  return useCallback(
    (body: PlanetData) => {
      const { simulationTime, scaleMode } = useStore.getState();
      setSelectedPlanet(body);
      setCameraTarget(cameraPositionFor(body, simulationTime, scaleMode), body.name);
      setCameraMode('planet-focus');
      setPickerOpen(false);
    },
    [setSelectedPlanet, setCameraTarget, setCameraMode, setPickerOpen]
  );
}
