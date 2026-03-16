// Preload all textures immediately when module loads (not when components render)
// This starts texture downloads before React components even render
import { TextureLoader } from 'three';
import { PLANETS, SUN_DATA } from '@/app/data/planets';

let allTexturesLoadedPromise: Promise<any[]> = Promise.resolve([]);

if (typeof window !== 'undefined') {
  const loader = new TextureLoader();
  const texturePromises: Promise<any>[] = [];

  // Preload Sun texture
  if (SUN_DATA.texture) {
    texturePromises.push(loader.loadAsync(SUN_DATA.texture));
  }

  // Preload all planet textures
  PLANETS.forEach(planet => {
    if (planet.texture) {
      texturePromises.push(loader.loadAsync(planet.texture));
    }
  });

  allTexturesLoadedPromise = Promise.all(texturePromises);
}

// Export a promise that resolves when all textures are loaded
export const allTexturesLoaded = allTexturesLoadedPromise;
