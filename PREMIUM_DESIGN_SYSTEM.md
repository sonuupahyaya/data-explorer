# BookVault - Premium Design System

## Overview

BookVault is a luxury ecommerce bookstore UI built with a fully polished light and dark mode system. The design emphasizes elegance, sophistication, and premium quality across all pages.

---

## 1. Light & Dark Mode System

### Implementation

- **Theme Toggle**: Located in the header, smoothly animated
- **Persistence**: User preference stored in localStorage
- **Provider**: ThemeProvider wraps the entire app
- **Class-based**: Uses Tailwind's `dark:` prefix

### Light Mode Characteristics

- **Background**: Pure white (`#FFFFFF`)
- **Text**: Dark charcoal (`#1f2937`)
- **Accents**: Muted green (`#16a34a`)
- **Aesthetic**: Airy, elegant, minimal

### Dark Mode Characteristics

- **Background**: Deep charcoal (`#0f172a` to `#030712`)
- **Text**: Soft white (`#f8f8f8` to `#e5e5e5`)
- **Accents**: Vibrant green with subtle glow
- **Aesthetic**: Premium, cinematic, luxurious

### How It Works

```jsx
// Use the theme hook
const { theme, toggleTheme, mounted } = useTheme();

// Toggle button is in Header automatically
<ThemeToggle />
```

---

## 2. Color Palette

### Primary Colors

| Color | Light | Dark | Usage |
|-------|-------|------|-------|
| Primary 50 | `#fafbfc` | - | Light backgrounds |
| Primary 600 | `#1f2937` | - | Text & borders |
| Primary 900 | `#030712` | - | Strong text |

### Accent (Green)

| Shade | Hex | Usage |
|-------|-----|-------|
| Accent 600 | `#16a34a` | Buttons, highlights, active states |
| Accent 700 | `#15803d` | Hover states, darker accents |

### Neutral

| Shade | Light | Dark | Usage |
|-------|-------|------|-------|
| 50/900 | `#fafafa` | `#171717` | Extreme backgrounds |
| 100/800 | `#f5f5f5` | `#262626` | Secondary backgrounds |
| 200/700 | `#e5e5e5` | `#404040` | Borders, dividers |
| 300/600 | `#d4d4d4` | `#525252` | Subtle elements |

---

## 3. Typography

### Font Family

- **Primary**: Inter (modern, clean, premium)
- **Fallback**: System fonts

### Type Scale

| Size | Pixels | Line Height | Usage |
|------|--------|-------------|-------|
| XS | 12px | 16px | Small labels |
| SM | 14px | 20px | Body, secondary text |
| BASE | 16px | 24px | Standard body |
| LG | 18px | 28px | Subheadings |
| XL | 20px | 28px | Section titles |
| 2XL | 24px | 32px | Page titles |
| 3XL | 30px | 36px | Large headings |
| 4XL | 36px | 40px | Hero text |

### Font Weights

- **400**: Regular text
- **500**: Medium (secondary buttons, labels)
- **600**: Semibold (product titles)
- **700**: Bold (headings, strong text)

---

## 4. Shadows & Depth

### Shadow System

| Name | Usage | Light | Dark |
|------|-------|-------|------|
| `shadow-thin` | Subtle elevation | `0 1px 2px` | Same |
| `shadow-soft` | Cards, buttons | `0 4px 6px` | Same |
| `shadow-card` | Product cards | `0 1px 3px` | Same |
| `shadow-elevated` | Hover states | `0 10px 15px` | Same |
| `shadow-float-lg` | Product hover | `0 12px 32px` | Enhanced |
| `shadow-glow` | Accent glow | `0 0 20px rgba(22,163,74,0.3)` | Green glow |
| `shadow-float` | Floating element | `0 8px 24px` | Same |

---

## 5. Spacing & Layout

### Spacing Scale

- **2px**, **4px**, **6px**, **8px** - Fine adjustments
- **12px**, **16px**, **20px**, **24px** - Standard spacing
- **32px**, **40px**, **48px** - Large sections

### Container

```jsx
<div className="mx-auto max-w-7xl px-6 py-12">
  {/* Content */}
</div>
```

### Grid Gaps

- **4px** - Tight elements
- **6px** - Compact groups
- **8px** - Standard components
- **12px** - Section spacing

---

## 6. Border Radius

### Radius Scale

| Size | Value | Usage |
|------|-------|-------|
| Small | `0.5rem` | Input borders, small buttons |
| XL | `0.75rem` | Standard cards |
| 2XL | `1rem` | Larger components |
| 3XL | `1.5rem` | Major cards, hero sections |

**Product Cards**: Use `rounded-3xl` for premium appearance

---

## 7. Animation & Transitions

### Duration

- **250ms** - Button hovers, icon transitions
- **300ms** - Theme changes, subtle movements
- **350ms** - Card transitions, shadow changes
- **500-700ms** - Image zoom, major animations

### Timing Functions

- **`ease-smooth`**: `cubic-bezier(0.4, 0, 0.2, 1)` - Smooth, natural feel
- **`ease-in-out`**: Default smooth transitions
- **`ease-out`**: Fade-in animations

### Animations

```css
/* Floating effect - Product cards */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

/* Glow pulse - Accent elements */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(22, 163, 74, 0.3); }
  50% { box-shadow: 0 0 30px rgba(22, 163, 74, 0.5); }
}

/* Shimmer - Loading */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
```

---

## 8. Header

### Features

- **Sticky positioning** at top with `z-50`
- **Glassmorphism effect** with backdrop blur
- **Semi-transparent** background: `bg-white/50 dark:bg-neutral-900/50`
- **Soft blur**: `backdrop-blur-md`
- **Subtle border**: `border-neutral-200/50 dark:border-neutral-800/50`

### Logo

- **Gradient text** using accent + secondary colors
- **Smooth hover** with opacity transition
- **Font size**: `text-2xl` with `font-bold`

### Navigation Elements

- **Theme Toggle**: Moon/Sun icon with smooth animation
- **Cart & Saved**: Badge indicators with counts
- **Search Bar**: Premium input with dark mode support
- **Mobile Menu**: Animated slide-down with `animate-slide-up`

### Header HTML

```jsx
<header className="sticky top-0 z-50 w-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 transition-colors duration-300">
  {/* Content */}
</header>
```

---

## 9. Product Cards

### Visual Design

- **Rounded corners**: `rounded-3xl` for premium feel
- **Subtle shadow**: `shadow-card` at rest, `shadow-float-lg` on hover
- **Floating effect**: `hover:-translate-y-1` for lift
- **Image zoom**: `group-hover:scale-110` with extended duration
- **Overlay gradient**: Appears on hover

### Interactive Elements

- **Save Button**:
  - Filled when saved: `bg-accent-600 text-white shadow-glow`
  - Outlined when not saved: `bg-white/90 dark:bg-neutral-800/90`
  - Scales up on hover: `group-hover:scale-110`

- **Add to Cart Button**:
  - Gradient background: `from-accent-600 to-accent-700`
  - Premium styling: `rounded-xl py-3 px-4`
  - Glow on hover: `hover:shadow-glow`

### Product Card HTML

```jsx
<div className="group h-full flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-card hover:shadow-float-lg dark:shadow-lg dark:hover:shadow-glow-dark transition-all duration-350 ease-smooth hover:-translate-y-1">
  {/* Image */}
  {/* Content */}
</div>
```

---

## 10. Component Classes

### Premium Components

Create reusable classes for consistency:

```css
/* Gradient text */
.text-gradient {
  @apply bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent;
}

/* Glass panel effect */
.glass-panel {
  @apply bg-white/70 dark:bg-neutral-800/60 backdrop-blur-md border border-neutral-200/50 dark:border-neutral-700/50;
}

/* Premium card */
.card-premium {
  @apply rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-card hover:shadow-float-lg dark:shadow-lg transition-all duration-350;
}

/* Premium button */
.btn-premium {
  @apply rounded-xl bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 dark:from-accent-700 dark:to-secondary-700 dark:hover:from-accent-800 dark:hover:to-secondary-800 text-white font-semibold transition-all duration-250 shadow-soft hover:shadow-glow disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none;
}

/* Premium input */
.input-premium {
  @apply rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 text-primary-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-accent-600 focus:border-transparent transition-all duration-250;
}
```

---

## 11. Pages Overview

### Home Page

- **Hero Section**: Large, elegant typography with gradient text
- **Product Grid**: Showcase best sellers with premium cards
- **Categories**: Visual exploration of book genres
- **Call-to-Action**: Premium styled buttons with glow effects

### Product Detail Page

- **Layout**: Two-column (image + details)
- **Image**: Large, premium display with zoom on hover
- **Details**:
  - Title: `text-3xl font-bold`
  - Author: `text-lg text-neutral-500 dark:text-neutral-400`
  - Price: Gradient text, premium styling
  - Rating: Star display with count
  - Description: Clean, readable typography
  - Buttons: Premium CTAs with spacing

### Cart Page

- **Layout**: Clean, spacious design
- **Items**: Card-based display with remove buttons
- **Summary**: Glass panel with order total
- **Checkout**: Primary CTA with premium styling

### Checkout

- **Steps**: Clear, visual progression
- **Forms**: Premium input styling
- **Summary**: Glass panel on dark mode, white card on light
- **Confirmation**: Success state with glow effect

### Favorites

- **Grid Layout**: Product cards in gallery view
- **Empty State**: Elegant message with CTA
- **Quick Actions**: Remove from favorites with confirmation

---

## 12. Dark Mode Best Practices

### When Using Dark Mode Classes

Always pair light and dark:

```jsx
// ✓ Correct
<div className="bg-white dark:bg-neutral-800 text-primary-900 dark:text-neutral-100">

// ✗ Incorrect
<div className="bg-white text-primary-900">
```

### Colors in Dark Mode

- Text: Use `dark:text-neutral-100` to `dark:text-neutral-400`
- Borders: Use `dark:border-neutral-700` to `dark:border-neutral-800`
- Backgrounds: Use `dark:bg-neutral-800` to `dark:bg-neutral-950`
- Accents: Use `dark:text-accent-500` (lighter shade)

### Transition Guidance

Always add transitions for theme changes:

```jsx
className="bg-white dark:bg-neutral-800 transition-colors duration-300"
```

---

## 13. Usage Examples

### Button

```jsx
<button className="btn-premium">
  Add to Cart
</button>
```

### Card

```jsx
<div className="card-premium p-6">
  <h3 className="text-xl font-semibold text-primary-900 dark:text-neutral-100">
    Title
  </h3>
  <p className="text-sm text-primary-600 dark:text-neutral-400 mt-2">
    Description
  </p>
</div>
```

### Input

```jsx
<input type="text" className="input-premium" placeholder="Search..." />
```

### Gradient Text

```jsx
<h1 className="text-gradient text-4xl font-bold">
  Premium Books
</h1>
```

---

## 14. Performance

### Optimization

- **Prefers reduced motion**: Respect user preferences
- **Lazy loading**: Images use Next.js Image optimization
- **CSS optimization**: Tailwind purges unused styles
- **Smooth scrolling**: `scroll-behavior: smooth` on HTML

### Dark Mode Performance

- No layout shifts during theme changes
- Transitions are 250-350ms for smoothness
- Color scheme meta tag for OS integration

---

## 15. Accessibility

### Contrast

- **Text**: Minimum 4.5:1 contrast ratio
- **Large text**: Minimum 3:1 ratio
- **Interactive**: Focus states visible on all elements

### Focus States

```jsx
className="focus:ring-2 focus:ring-accent-600 focus:outline-none"
```

### Semantic HTML

- Use proper heading hierarchy
- Include alt text for images
- Use aria-labels for icons
- Test keyboard navigation

---

## 16. Files Modified/Created

### New Files
- `src/components/ThemeProvider.tsx` - Theme initialization
- `src/components/ThemeToggle.tsx` - Theme toggle button
- `src/hooks/useTheme.ts` - Theme state management

### Modified Files
- `tailwind.config.js` - Added dark mode, animations, shadows
- `src/components/Header.tsx` - Added theme toggle, dark mode styles
- `src/components/ProductCard.tsx` - Premium styling, dark mode
- `src/components/Footer.tsx` - Dark mode support, gradient branding
- `src/components/SearchBar.tsx` - Dark mode input styling
- `src/components/ProductGrid.tsx` - Empty state dark mode
- `src/app/layout.tsx` - ThemeProvider integration
- `src/app/globals.css` - Component classes, dark mode styles
- `src/hooks/index.ts` - Exported useTheme
- `src/components/index.ts` - Exported theme components

---

## 17. Quick Reference

### Dark Mode Toggle
```jsx
<ThemeToggle /> // Automatically in header
```

### Check Current Theme
```jsx
const { theme } = useTheme();
```

### Apply Dark Mode Styles
```jsx
className="bg-white dark:bg-neutral-800"
```

### Premium Classes
```jsx
className="card-premium" // Card
className="btn-premium" // Button
className="input-premium" // Input
className="text-gradient" // Gradient text
className="glass-panel" // Glass effect
```

---

## 18. Future Enhancements

- [ ] Animate page transitions
- [ ] Add more shadow variations
- [ ] Create premium modal styles
- [ ] Add tooltip styling
- [ ] Implement skeleton loading in dark mode
- [ ] Add haptic feedback for mobile
- [ ] Create premium form validation states

---

## Live Preview

Visit the site with:
- **Light Mode**: Default theme
- **Dark Mode**: Click moon icon in header
- **Mobile**: Test responsive on all screen sizes
- **Transitions**: Hover over cards, buttons, and links

---

**Design System Version**: 1.0  
**Last Updated**: January 2026  
**Status**: Production Ready
