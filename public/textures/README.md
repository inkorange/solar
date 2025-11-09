# Planet Textures

This directory should contain texture maps for all planets in the solar system.

## Required Textures

The application expects the following texture files (referenced in `app/data/planets.ts`):

- `mercury.jpg` - Mercury surface texture
- `venus.jpg` - Venus atmosphere/surface texture
- `earth.jpg` - Earth with continents and oceans
- `mars.jpg` - Mars surface texture
- `jupiter.jpg` - Jupiter atmosphere with bands
- `saturn.jpg` - Saturn atmosphere
- `uranus.jpg` - Uranus atmosphere
- `neptune.jpg` - Neptune atmosphere

## Recommended Sources

### Free NASA Resources
1. **Solar System Scope Textures**: https://www.solarsystemscope.com/textures/
   - Free, high-quality planet textures
   - Available in multiple resolutions
   - License: Free for personal and educational use

2. **NASA 3D Resources**: https://nasa3d.arc.nasa.gov/
   - Official NASA textures and models
   - Public domain

3. **Planetary Pixel Emporium**: http://planetpixelemporium.com/
   - Free planet texture maps
   - Multiple resolutions available

## Texture Specifications

For optimal performance:
- **Format**: JPG (for smaller file size) or PNG (for quality)
- **Resolution**:
  - Minimum: 1024x512 pixels
  - Recommended: 2048x1024 pixels
  - High quality: 4096x2048 pixels
- **Aspect Ratio**: 2:1 (equirectangular projection)

## Current Status

⚠️ **Textures not yet added** - The application will fall back to solid colors defined in `planets.ts`

To add textures:
1. Download texture files from one of the sources above
2. Rename them to match the filenames listed above
3. Place them in this directory (`/public/textures/`)
4. Restart the development server

The Planet component will automatically load and apply the textures when available.

## Future Enhancements (Phase 3)

- Normal maps for surface detail
- Specular maps for shine/reflection
- Bump maps for terrain
- Cloud layers for Earth
- Ring textures for Saturn, Uranus, Neptune
- Night lights for Earth
