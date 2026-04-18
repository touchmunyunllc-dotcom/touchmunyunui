# Sports Background Images

## Current Implementation

The homepage uses dynamic sports background images from Unsplash that reflect the energy and dynamics of sports like football, tennis, and other athletic activities.

## Background Images Used

### Hero Section
- **URL**: `https://images.unsplash.com/photo-1574629810360-7efbbe195018`
- **Description**: Dynamic sports action image showing athletic movement
- **Overlay**: Dark gradient (90% black) for text readability
- **Accent**: Red gradient overlay for sports energy

### Value Proposition Section
- **URL**: `https://images.unsplash.com/photo-1551958219-acbc608c6377`
- **Description**: Sports equipment/tennis theme
- **Overlay**: 80% black for subtle background effect

### Featured Products Section
- **URL**: `https://images.unsplash.com/photo-1530549387789-4c1017266635`
- **Description**: Football/sports field theme
- **Overlay**: 90% black for subtle background effect

## Customization

### To Use Your Own Images

1. **Add images to `public/` folder**:
   ```
   frontend/public/
   ├── sports-hero-bg.jpg
   ├── sports-value-bg.jpg
   └── sports-products-bg.jpg
   ```

2. **Update `frontend/pages/index.tsx`**:
   Replace the Unsplash URLs with your local images:
   ```tsx
   backgroundImage: `url('/sports-hero-bg.jpg')`
   ```

### Recommended Image Specifications

- **Format**: JPG or WebP (optimized)
- **Size**: 1920x1080px or larger
- **Aspect Ratio**: 16:9
- **File Size**: < 500KB (optimized)
- **Content**: Sports action, football, tennis, athletic movement

### Image Sources

You can use:
- **Unsplash**: Free high-quality sports images
- **Pexels**: Free stock photos
- **Custom**: Your own sports photography
- **AI Generated**: Sports-themed images

## Performance Optimization

- Images are loaded via `background-image` CSS property
- Dark overlays ensure fast loading and readability
- Lazy loading can be added for better performance
- Consider using Next.js Image component for hero if needed

## Theme Integration

The sports backgrounds work with the icons.com style theme:
- **Black base**: Pure black (#000000) background
- **White text**: High contrast for readability
- **Red accents**: Sports energy and dynamic feel
- **Gold highlights**: Premium sports memorabilia feel

## Animation Effects

- **Floating elements**: Red and gold colored orbs
- **Shimmer pattern**: Animated sports pattern overlay
- **Gradient overlays**: Red accent gradients for energy
- **Text shadows**: Drop shadows for text readability

