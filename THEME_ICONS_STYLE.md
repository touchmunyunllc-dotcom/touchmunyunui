# Icons.com Style Theme Implementation

## Overview
Updated the theme to match the dynamic sports website style of icons.com with:
- **Pure black background** (#000000)
- **Pure white text** (#FFFFFF)
- **Red, Grey, and Gold** context-based accents for labels, highlights, and interactive elements

## Color Scheme

### Primary Colors
- **Background**: Pure black (#000000) - `bg-primary` or `bg-black`
- **Text**: Pure white (#FFFFFF) - `text-foreground` or `text-white`
- **Contrast**: Dark grey (#1a1a1a) - `bg-contrast` for elevated elements

### Accent Colors (Context-Based)

#### Red (#DC2626 - Red-600)
- **Primary actions**: Buttons, links, CTAs
- **Highlights**: Important information, active states
- **Status**: Paid, Processing, Delivered orders
- **Collections**: New Arrivals

#### Gold (#D97706 - Gold-600)
- **Premium features**: Quality indicators, special highlights
- **Status**: Pending, Shipped orders
- **Collections**: Best Sellers, Coupons, Summer collections

#### Grey (#6B7280 - Grey-500)
- **Secondary elements**: Body text variations, secondary buttons
- **Status**: Packed, Cancelled orders
- **Metrics**: Customer-related metrics

## Updated Files

### 1. `tailwind.config.js`
- Updated `primary` color to pure black (#000000)
- Updated `foreground` color to pure white (#FFFFFF)
- Updated `button` color to red (#DC2626)
- Added explicit `red`, `grey`, and `gold` color scales
- Updated `accent` colors for context-based usage

### 2. `styles/globals.css`
- Updated CSS variables to use black background and white text
- Changed body background to pure black
- Updated all color variables to match new scheme

### 3. `utils/colorUtils.ts`
- Updated `getStatusColor()` to use red/grey/gold context-based colors
- Updated `getCollectionColor()` to use red/gold accents
- Updated `getMetricColor()` to use red/grey/gold for admin dashboard

### 4. Component Updates
- **Hero.tsx**: Red accent text, red buttons with glow effects
- **ProductCard.tsx**: Red price highlights, gold stock badges, red buttons
- All components using `bg-primary`, `text-foreground`, `bg-button` automatically inherit new colors

## Context-Based Color Usage

### Order Status Colors
- **Pending**: Gold (waiting state)
- **Paid**: Red (payment received)
- **Packed**: Grey (processing)
- **Processing**: Red (active)
- **Shipped**: Gold (in transit)
- **Delivered**: Red (completed)
- **Cancelled**: Grey (inactive)

### Collection Colors
- **New Arrivals**: Red
- **Best Sellers**: Gold
- **Summer**: Gold
- **Coupons/Off**: Gold

### Admin Dashboard Metrics
- **Revenue**: Gold (premium)
- **Orders**: Red (primary action)
- **Customers**: Grey (secondary)
- **Products**: Red (primary)

## Visual Effects

### Glow Effects
- Red glow: `shadow-glow-red` for red elements
- Gold glow: `shadow-glow-gold` for gold elements
- Glass shadows: `shadow-glass` for depth

### Hover States
- Red buttons: Darken to red-700 on hover with glow
- Gold accents: Brighten on hover
- Grey elements: Lighten on hover

## Dynamic Sports Feel

The color scheme creates a dynamic, energetic feel suitable for sports customers:
- **Red**: Energy, action, passion (sports)
- **Gold**: Premium, achievement, excellence
- **Grey**: Balance, sophistication
- **Black/White**: Bold contrast, modern aesthetic

## Migration Notes

All existing components using theme variables will automatically update:
- `bg-primary` → Pure black
- `text-foreground` → Pure white
- `bg-button` → Red (#DC2626)
- `text-button` → White

Components explicitly using red/gold/grey will maintain their context-based colors.

## Browser Compatibility

All color values use standard CSS colors and Tailwind utilities, ensuring compatibility across all modern browsers.

