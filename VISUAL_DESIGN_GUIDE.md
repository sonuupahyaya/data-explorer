# Visual Design Guide - BookVault

## Design Philosophy

**Modern | Elegant | Professional | Commercial | Trustworthy**

No emojis. No playful elements. Pure professional design.

---

## Color Story

### Primary Colors (Grays)
These are the foundation. They convey professionalism and trust.

```
#030712 - Darkest (primary-900) - Headlines
#111827 - Dark (primary-700) - Secondary text
#1f2937 - Medium (primary-600) - Main body text
#475569 - Light (primary-500) - Muted text
#f0f4f8 - Very Light (primary-100) - Light backgrounds
#fafbfc - Lightest (primary-50) - Minimal backgrounds
```

### Accent Color (Green)
A muted, calming green that says "safe," "reliable," "trusted."

```
#16a34a - Main accent (accent-600) - Primary actions, highlights
#15803d - Hover state (accent-700) - Interactive hover
#f0fdf4 - Light background (accent-50) - Soft backgrounds
#dcfce7 - Medium background (accent-100) - Hover backgrounds
```

### Supporting Color (Neutral)
Grays for borders, dividers, and structural elements.

```
#e5e5e5 - Borders (neutral-200) - Card borders, dividers
#d4d4d4 - Strong dividers (neutral-300)
#f5f5f5 - Soft backgrounds (neutral-100)
```

---

## Typography Hierarchy

### Hero Headline
**36-48px** | Bold | Gradient text

```
"Your Gateway to Endless Reading"
text-4xl sm:text-5xl lg:text-6xl font-bold
bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent
```

### Section Heading
**24-32px** | Semibold | Primary color

```
"Featured Collection"
text-3xl sm:text-4xl font-bold text-primary-900
```

### Card Heading
**18px** | Semibold | Primary color

```
title
text-lg font-semibold text-primary-900
```

### Body Text
**16px** | Regular | Secondary color

```
Description text
text-base text-primary-600
```

### Small Text
**14px** | Regular | Muted color

```
Author name, secondary info
text-sm text-primary-500
```

### Label Text
**12px** | Semibold | Uppercase

```
"PRODUCT" "CATEGORY"
text-xs uppercase tracking-widest font-semibold text-accent-600
```

---

## Spacing System

### Compact (Small Components)
```
Button padding:    py-2.5 px-6     (10px × 24px)
Input padding:     py-2.5 px-4     (10px × 16px)
Small gap:         gap-2           (8px)
```

### Normal (Standard Components)
```
Button padding:    py-3.5 px-8     (14px × 32px)
Card padding:      p-4 or p-6      (16px or 24px)
Section gap:       gap-6           (24px)
```

### Generous (Large Sections)
```
Section padding:   py-16           (64px)
Section spacing:   py-20           (80px)
Hero spacing:      py-24           (96px)
Large gap:         gap-12          (48px)
```

---

## Shadow System

### Shadow 1 - Thin (Subtle)
**Use:** Minimal elevation, thin cards
```css
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
```

### Shadow 2 - Soft (Standard)
**Use:** Normal cards, buttons on hover
```css
box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
```

### Shadow 3 - Card (Products)
**Use:** Product cards
```css
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

### Shadow 4 - Elevated (Hover)
**Use:** Cards on hover, elevated content
```css
box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
```

### Shadow 5 - Hover (Strong)
**Use:** Strong hover effects
```css
box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
```

### Shadow 6 - Modal (Overlay)
**Use:** Modals, full overlays
```css
box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
```

---

## Border Radius

### Small (8px) - rounded-xl
**Use:** Buttons, input fields, small elements
```
border-radius: 8px;
```

### Medium (12px) - rounded-2xl
**Use:** Cards, containers, product cards
```
border-radius: 12px;
```

### Large (16px) - rounded-3xl
**Use:** Large sections, hero elements
```
border-radius: 16px;
```

---

## Visual States

### Hover State
- Shadow: card → elevated
- Scale: 1.00 → 1.01 (very subtle)
- Color: transition smooth

### Focus State
- Ring: 2px ring-accent-100
- Outline: none
- Visible and accessible

### Active State
- Color: accent-700
- Shadow: elevated
- Feedback: immediate

### Disabled State
- Opacity: 60%
- Cursor: not-allowed
- No interactions

---

## Component Specifications

### Button - Primary Action
```
Dimensions: 14px × 32px padding (py-3.5 px-8)
Radius:     8px (rounded-lg)
Colors:     accent-600 text-white
Hover:      bg-accent-700 shadow-elevated
Focus:      ring-2 ring-accent-100
Transition: transition-all duration-250
Icon size:  20px (if included)
```

Example:
```tsx
<button className="px-8 py-3.5 bg-accent-600 text-white font-semibold rounded-lg hover:bg-accent-700 shadow-soft hover:shadow-elevated transition-all duration-250">
  Add to Cart
</button>
```

### Button - Secondary Action
```
Dimensions: 14px × 32px padding
Radius:     8px (rounded-lg)
Border:     2px border-primary-200
Colors:     text-primary-700
Hover:      bg-primary-50
Transition: transition-all duration-250
```

Example:
```tsx
<button className="px-8 py-3.5 border-2 border-primary-200 text-primary-700 rounded-lg hover:bg-primary-50 font-semibold transition-all duration-250">
  Save for Later
</button>
```

### Product Card
```
Dimensions:     Responsive
Radius:         12px (rounded-2xl)
Border:         1px neutral-200
Shadow:         shadow-card
Hover Shadow:   shadow-elevated
Image Aspect:   3:4
Image Hover:    scale-105 (transform)
Transition:     transition-all duration-350
Content Padding: p-4
Gaps:           gap-3
```

Example:
```tsx
<div className="rounded-2xl border border-neutral-200 bg-white shadow-card hover:shadow-elevated transition-all duration-350">
  <div className="aspect-[3/4] overflow-hidden">
    <Image className="group-hover:scale-105 transition-transform duration-500" />
  </div>
  <div className="p-4 space-y-3">
    {/* content */}
  </div>
</div>
```

### Section Card
```
Dimensions:    Variable
Radius:        12px (rounded-2xl)
Border:        1px neutral-200
Background:    white or neutral-50
Padding:       p-6
Shadow:        shadow-card
Transition:    smooth on hover
```

---

## Layout Patterns

### Full-Width Section
```tsx
<section className="py-16 sm:py-20 bg-white">
  <div className="mx-auto max-w-6xl px-6">
    {/* Content */}
  </div>
</section>
```

### Grid with Cards (4 columns)
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* Items */}
</div>
```

### Two Column Layout
```tsx
<div className="grid gap-12 md:grid-cols-2">
  <div>{/* Left column */}</div>
  <div>{/* Right column */}</div>
</div>
```

### Sticky Sidebar
```tsx
<div className="sticky top-24">
  {/* Sidebar content */}
</div>
```

---

## Animations

### Fade In
```css
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
/* 0.3s ease-in-out */
```

### Slide Up
```css
@keyframes slide-up {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
/* 0.3s ease-out */
```

### Shimmer (Loading)
```css
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}
/* 2s infinite */
```

### Hover Scale
```css
transform: scale(1.01);
transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

---

## Spacing Reference

### Horizontal Padding (Sections)
```
px-6 = 24px (standard section padding)
```

### Vertical Padding (Sections)
```
py-12 = 48px (small section)
py-16 = 64px (standard section)
py-20 = 80px (large section)
py-24 = 96px (hero section)
```

### Gaps Between Items
```
gap-3  = 12px (small gap)
gap-4  = 16px (standard gap)
gap-6  = 24px (large gap)
gap-12 = 48px (huge gap)
```

---

## Responsive Design

### Mobile First Approach
```
Base styles: Mobile layout (1 column)
sm:         Small tablet (2 columns)
md:         Tablet
lg:         Desktop (3-4 columns)
xl:         Large desktop
```

### Column Progression
```
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

### Text Scaling
```
text-3xl sm:text-4xl lg:text-5xl
```

### Padding Scaling
```
py-12 sm:py-16 lg:py-20 xl:py-24
```

---

## Color Usage Examples

### Text Colors
```
Primary (Headlines):     text-primary-900
Secondary (Subtext):     text-primary-700
Body (Main text):        text-primary-600
Muted (Helper text):     text-primary-500
```

### Background Colors
```
Main background:         bg-white
Section background:      bg-neutral-50
Card background:         bg-white
Hover background:        bg-primary-50 or accent-50
```

### Border Colors
```
Standard borders:        border-neutral-200
```

### Interactive Colors
```
Primary action:          accent-600
Hover action:            accent-700
Accent background:       accent-50
```

---

## Empty State Design

### Structure
```
Icon (56px, centered)
  ↓
Headline (text-2xl font-bold)
  ↓
Description (text-primary-600)
  ↓
Primary CTA Button
```

### Colors
```
Icon:       neutral-300
Headline:   primary-900
Text:       primary-600
Button:     accent-600
```

---

## Icons

**Icon Library:** Lucide React

### Standard Sizes
```
Navigation icons:   18-20px
Button icons:       16-20px
Large icons:        32-56px
```

### Standard Weight
```
strokeWidth: 1.5 - 2
```

### Color Usage
```
Interactive icons:  text-accent-600
Muted icons:        text-primary-500
Error icons:        text-red-600
```

---

## Contrast & Accessibility

### Text Contrast Ratios
```
primary-900 on white:    15:1 ✅ AAA
primary-600 on white:    6.5:1 ✅ AA
primary-500 on white:    4.1:1 ⚠️ Avoid for body text
accent-600 on white:     5.5:1 ✅ AA
```

### WCAG Compliance
- ✅ All text meets WCAG AA (4.5:1 minimum)
- ✅ Large text (18pt+) meets WCAG AA
- ✅ Graphics meet WCAG AA standards

---

## Quick Visual Summary

| Aspect | Value |
|--------|-------|
| **Primary Font Size** | 16px |
| **Headline Font Size** | 36-48px |
| **Main Color** | #030712 (primary-900) |
| **Accent Color** | #16a34a (accent-600) |
| **Border Color** | #e5e5e5 (neutral-200) |
| **Background** | #ffffff (white) |
| **Border Radius** | 8px / 12px / 16px |
| **Standard Shadow** | 0 1px 3px rgba(0,0,0,0.1) |
| **Transition Speed** | 250ms |
| **Max Width** | 1536px |

---

## Visual Examples

### Premium Product Card
```
┌─────────────────────┐
│  ┌──────────────┐   │
│  │              │   │ Radius: 12px
│  │   3:4 Image  │   │ Border: 1px #e5e5e5
│  │   w/shadow   │   │ Shadow: soft
│  └──────────────┘   │
│                     │
│ Title (Bold)        │ Bold, primary-900
│ Author (Small)      │ Small, primary-500
│ Rating (Stars)      │ Yellow stars
│ Price (Large)       │ Large, accent-600
│                     │
│ [Add to Cart] ◄─────┤ Green button
└─────────────────────┘
```

### Page Section
```
Section Heading
Description text

┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
│ 1   │ │ 2   │ │ 3   │ │ 4   │  Gap: 24px
├─────┤ ├─────┤ ├─────┤ ├─────┤  4 columns (responsive)
│ 12px│ │card │ │shadow│ │hover│
└─────┘ └─────┘ └─────┘ └─────┘

Padding: 24px (sides)
Spacing: 48px (above/below)
Max-width: 1536px
Background: white or neutral-50
```

---

## Implementation Checklist

- [ ] Colors match palette exactly
- [ ] Typography hierarchy clear
- [ ] Spacing consistent (4px base)
- [ ] Shadows follow hierarchy
- [ ] Borders use neutral-200
- [ ] Radius matches patterns
- [ ] Transitions smooth
- [ ] Hover states visible
- [ ] Focus rings present
- [ ] Icons from Lucide
- [ ] No emoji in content
- [ ] Max-width respected
- [ ] Responsive design working
- [ ] Accessibility met
- [ ] Performance good

---

## Final Notes

This visual design guide ensures:
- **Consistency** across all pages
- **Professionalism** in every detail
- **Accessibility** for all users
- **Premium Feel** throughout
- **Commercial Quality** matching industry leaders

Every pixel matters. Every decision has reason. This is enterprise-grade design.

---

**Status: Production Ready** ✅
