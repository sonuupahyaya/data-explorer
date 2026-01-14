# Premium Design System - BookVault

## Overview

This design system provides a comprehensive, modern, and premium aesthetic for the BookVault bookstore application. Inspired by WorldOfBooks, Apple Store, and Amazon Books, it creates a trustworthy, elegant, and commercial experience.

---

## Color Palette

### Primary Colors

- **Primary (Neutral Grays)**
  - 50: `#fafbfc` - Lightest backgrounds
  - 100: `#f0f4f8` - Light backgrounds
  - 600: `#1f2937` - Main text
  - 700: `#111827` - Secondary text
  - 900: `#030712` - Dark text

### Accent Color (Muted Green)

- 50: `#f0fdf4` - Light backgrounds
- 100: `#dcfce7` - Hover backgrounds
- 600: `#16a34a` - Primary action color
- 700: `#15803d` - Hover action
- 900: `#145231` - Active state

### Neutral (Supporting)

- 50: `#fafafa` - Backgrounds
- 200: `#e5e5e5` - Borders
- 300: `#d4d4d4` - Dividers
- 600: `#525252` - Secondary text

---

## Typography

### Font Family
- **Primary:** Inter / SF Pro
- **Fallback:** -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif

### Font Sizes & Weights

| Size | Usage | Example |
|------|-------|---------|
| 12px (xs) | Small labels, tags | "PRODUCT" badge |
| 14px (sm) | Secondary text, author names | Product author |
| 16px (base) | Body text | Descriptions |
| 18px (lg) | Secondary headings | Section titles |
| 20px (xl) | Subheadings | Category names |
| 24px (2xl) | Medium headings | Page titles |
| 30px (3xl) | Large headings | Section headers |
| 36px (4xl) | Hero headlines | Hero text |

### Font Weights

- **Regular (400):** Body text
- **Medium (500):** Buttons, labels
- **Semibold (600):** Headings, important text
- **Bold (700):** Primary headings

---

## Spacing System

- **4px (xs):** Minimal gaps
- **8px (2):** Small gaps
- **12px (3):** Medium gaps
- **16px (4):** Standard padding
- **20px (5):** Larger padding
- **24px (6):** Section padding
- **32px (8):** Major sections
- **48px (12):** Large sections
- **64px (16):** Hero spacing

---

## Shadows

| Name | Usage | CSS |
|------|-------|-----|
| **thin** | Subtle cards | `0 1px 2px rgba(0,0,0,0.05)` |
| **soft** | Hover states | `0 4px 6px rgba(0,0,0,0.1)` |
| **card** | Product cards | `0 1px 3px rgba(0,0,0,0.1)` |
| **elevated** | Modals, dropdowns | `0 10px 15px rgba(0,0,0,0.1)` |
| **hover** | On hover | `0 20px 25px rgba(0,0,0,0.15)` |
| **modal** | Large overlays | `0 25px 50px rgba(0,0,0,0.25)` |

---

## Border Radius

| Size | Usage | Example |
|------|-------|---------|
| 8px (xl) | Small elements | Buttons, input fields |
| 12px (2xl) | Cards, containers | Product cards |
| 16px (3xl) | Large elements | Hero section |

---

## Transitions & Animations

### Duration
- **250ms:** Quick interactions (hover, click)
- **350ms:** Medium transitions
- **500ms:** Longer animations

### Timing Function
- **smooth:** `cubic-bezier(0.4, 0, 0.2, 1)` - Standard easing

### Animations

1. **fade-in:** 0.3s opacity transition
2. **slide-up:** 0.3s upward movement with fade
3. **shimmer:** 2s loading skeleton animation

### Hover Effects

- **Buttons:** Scale 1.01, shadow increase
- **Cards:** Shadow elevation, slight lift
- **Links:** Color change with smooth transition
- **Icons:** Color change, no scale

---

## Component Patterns

### Header
- Sticky positioning
- Clean navigation
- Prominent cart/favorites icons
- Search bar integration

### Product Card
- Rounded corners (12px)
- Soft shadow with hover elevation
- Image with 3:4 aspect ratio
- Save button overlay
- Title, author, rating, price
- Full-width CTA button

### Buttons

#### Primary Button
```
bg-accent-600 text-white
hover:bg-accent-700
px-8 py-3.5
rounded-lg
font-semibold
shadow-soft hover:shadow-elevated
transition-all duration-250
```

#### Secondary Button
```
border-2 border-primary-200 text-primary-700
hover:bg-primary-50
px-8 py-3.5
rounded-lg
font-semibold
transition-all duration-250
```

### Cards

#### Product Card
- 2px border (neutral-200)
- Rounded 12px
- Shadow: card
- Hover: shadow-elevated
- Smooth transitions

#### Info Card
- 2px border (neutral-200)
- Rounded 12px
- Padding: 24px
- Background: white or neutral-50

---

## Page Layouts

### Home Page
1. **Hero Section**
   - Large headline with gradient text
   - Supporting copy
   - Primary + secondary CTA
   - Subtle background gradient

2. **Categories Section**
   - Grid layout (4 columns)
   - Card-based design
   - Hover effects

3. **Featured Books**
   - Product grid (4 columns responsive)
   - Clear section title

4. **Viewing History**
   - Recent items carousel
   - Same grid structure

### Product Detail
1. **Hero/Navigation**
   - Back button
   - Breadcrumb support

2. **Main Content**
   - 2-column layout
   - Left: Large product image
   - Right: Details, price, CTA buttons

3. **Metadata Section**
   - Publisher, year, pages, ISBN
   - Grid layout (2x2)
   - Light background

4. **Recommendations**
   - Similar books carousel
   - 4-column grid

### Cart Page
1. **Header** with item count
2. **2-column layout**
   - Left: Cart items list
   - Right: Order summary (sticky)
3. **Item rows** with image, details, quantity, remove
4. **Summary** with subtotal, shipping, tax, total

### Saved/Favorites
1. **Header** with saved count
2. **Product grid** (same as home)
3. **Empty state** when no items

---

## Color Usage Guide

### Text
- **Primary text:** primary-900 (#030712)
- **Secondary text:** primary-600 (#475569)
- **Muted text:** primary-500 (#64748b)

### Backgrounds
- **Main background:** white
- **Section background:** neutral-50
- **Card background:** white
- **Overlay:** rgba(0,0,0,0.5)

### Interactive Elements
- **Active/hover:** accent-600 (#16a34a)
- **Disabled:** opacity-60

### Status Colors
- **Success:** accent-600 (green)
- **Error:** red-600
- **Warning:** yellow-600
- **Info:** blue-600

---

## Empty States

- Centered layout
- Large icon (56px)
- Bold headline
- Supporting text
- Primary CTA button

---

## Loading States

- Skeleton screens matching card layout
- Shimmer animation
- Maintains layout while loading

---

## Responsive Design

### Breakpoints
- **Mobile:** < 640px (1 column)
- **Tablet:** 640px - 1024px (2 columns)
- **Desktop:** 1024px+ (3-4 columns)

### Max Width
- **Content:** 1536px (max-w-6xl)
- **Padding:** 24px (px-6)

---

## Accessibility

### Color Contrast
- All text meets WCAG AA standard
- Minimum 4.5:1 contrast ratio for body text

### Focus States
- Visible focus indicators on interactive elements
- Keyboard navigation support

### Icons
- All icons have proper aria-labels
- Decorative icons have aria-hidden="true"

---

## Example Implementation

### Product Card Component
```tsx
<Link href={`/product/${productId}`}>
  <div className="group h-full flex flex-col overflow-hidden rounded-2xl bg-white border border-neutral-200 shadow-card hover:shadow-elevated transition-all duration-350 ease-smooth">
    {/* Image */}
    <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
      <Image />
    </div>
    
    {/* Content */}
    <div className="flex flex-col gap-3 p-4 flex-1">
      <h3 className="line-clamp-2 text-sm font-semibold text-primary-900">
        {title}
      </h3>
      <p className="text-xs text-primary-500">by {author}</p>
      <div className="mt-auto pt-2">
        <span className="text-lg font-bold text-accent-600">
          ${price.toFixed(2)}
        </span>
      </div>
      <button className="mt-3 rounded-lg bg-accent-600 py-2.5 text-white font-semibold hover:bg-accent-700">
        Add to Cart
      </button>
    </div>
  </div>
</Link>
```

---

## Key Principles

1. **Minimal & Clean:** No clutter, clear hierarchy
2. **Professional:** Trust through design quality
3. **Premium:** Elevated shadows, smooth transitions
4. **Commercial:** Real ecommerce patterns
5. **Trustworthy:** Professional appearance
6. **Elegant:** Refined, not playful
7. **Consistent:** Unified across all pages

---

## Implementation Checklist

- [x] Color system updated
- [x] Typography hierarchy defined
- [x] Spacing system consistent
- [x] Shadow system applied
- [x] Border radius consistent
- [x] Transitions smooth
- [x] Hover states defined
- [x] Empty states designed
- [x] Loading states animated
- [x] Responsive layouts
- [x] Accessibility considerations
- [x] All pages redesigned
- [x] Components unified

---

## Notes

This design system prioritizes:
- **Readability** over decoration
- **Simplicity** over complexity
- **Function** over form
- **Trust** over trends
- **Professionalism** over personality
