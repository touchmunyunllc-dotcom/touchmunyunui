# Slideshow Image Specifications

## Container Dimensions

The hero slideshow container has the following dimensions:

- **Mobile (< 640px)**: 500px height × Full width (~375px - 640px)
- **Tablet (640px - 1024px)**: 600px height × Full width (~640px - 1024px)  
- **Desktop (> 1024px)**: 700px height × Full width (~1024px - 1920px+)

## Recommended Aspect Ratios

### 🎯 **Primary Recommendation: 16:9 (Widescreen)**

**Why:** This is the industry standard for hero/slideshow images and works perfectly across all devices.

**Dimensions:**
- **Minimum**: 1920px × 1080px (Full HD)
- **Recommended**: 2560px × 1440px (2K/QHD)
- **Optimal**: 3840px × 2160px (4K/UHD)

**Benefits:**
- ✅ Works perfectly on all screen sizes
- ✅ Minimal cropping on any device
- ✅ Professional, cinematic look
- ✅ Standard format for web hero images

### Alternative Options

#### **21:9 (Ultrawide/Cinematic)**
- **Dimensions**: 3840px × 1646px or 2560px × 1097px
- **Best for**: Cinematic, dramatic effect
- **Note**: May crop more on mobile devices

#### **4:3 (Traditional)**
- **Dimensions**: 1920px × 1440px
- **Best for**: Portrait-oriented content
- **Note**: Will crop significantly on wide screens

## Image Requirements

### File Format
- **Recommended**: JPG/JPEG (best compression for photos)
- **Alternative**: WebP (better compression, smaller file size)
- **Avoid**: PNG (too large for hero images)

### File Size
- **Target**: < 500KB per image (optimized)
- **Maximum**: < 1MB per image
- **Optimization**: Use tools like TinyPNG, ImageOptim, or Squoosh

### Quality Settings
- **Compression**: 80-90% quality
- **Progressive**: Enable progressive JPEG for faster perceived loading

## Current Fallback Images

The fallback images in `/images/sports/` should follow these specs:
- **Slide1.jpeg** through **Slide6.jpeg**
- **Aspect Ratio**: 16:9 recommended
- **Dimensions**: Minimum 1920px × 1080px
- **File Size**: < 500KB each (optimized)

## Image Content Guidelines

### Composition Tips
1. **Safe Zone**: Keep important content in the center 60% of the image
   - Text overlays will be on the left side
   - Important visuals should be centered or right-aligned

2. **Focal Point**: 
   - Center or slightly right of center works best
   - Left side will have text overlay (semi-transparent)

3. **Sports Theme - Dramatic High-Contrast Style** (Like Basketball Image):
   - **Basketball**: Close-up of basketball with dramatic lighting, black background
   - **Football**: Football equipment with high-contrast lighting, dark background
   - **Tennis**: Tennis ball or racket with dramatic shadows and spotlight
   - **Soccer**: Soccer ball with dramatic lighting on black background
   - **Athletic Equipment**: Sports gear with professional studio lighting
   - **Style**: Black/dark backgrounds with bright, focused directional lighting
   - **High-Contrast**: Sharp contrast between vibrant subject and dark background
   - **Professional**: Studio-quality, dramatic sports photography
   - ❌ Avoid: Busy backgrounds, low contrast, action shots with multiple subjects

### Text Overlay Area
- **Left 40%**: Will have semi-transparent dark overlay for text
- **Center-Right 60%**: Best area for main visual content
- **Avoid**: Placing important details in the left 30% of the image

## Tools for Image Optimization

### Online Tools
- **TinyPNG**: https://tinypng.com/
- **Squoosh**: https://squoosh.app/
- **ImageOptim**: https://imageoptim.com/

### Command Line
```bash
# Using ImageMagick
magick input.jpg -resize 1920x1080^ -gravity center -extent 1920x1080 -quality 85 output.jpg

# Using Sharp (Node.js)
npm install sharp
```

## Testing Checklist

- [ ] Images display without stretching
- [ ] Images maintain aspect ratio on all screen sizes
- [ ] Images load quickly (< 2 seconds)
- [ ] Images look sharp on retina displays
- [ ] Text overlays are readable
- [ ] Sports theme is clearly visible

## Example Dimensions Table

| Screen Size | Container Height | Container Width | Recommended Image Size |
|------------|------------------|-----------------|------------------------|
| Mobile     | 500px            | 375px - 640px   | 1920px × 1080px (16:9) |
| Tablet     | 600px            | 640px - 1024px  | 1920px × 1080px (16:9) |
| Desktop    | 700px            | 1024px - 1920px+| 2560px × 1440px (16:9) |

**Note**: Using 16:9 aspect ratio images at 1920px × 1080px or larger will ensure perfect display on all devices with minimal cropping.

