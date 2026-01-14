# BookVault Design System - Quick Reference

## Color Palette at a Glance

### Primary Colors
| Name | Light Value | Dark Value | Purpose |
|------|-------------|-----------|---------|
| Pearl | `pearl-50` | `pearl-50` | Off-white background (light) & text (dark) |
| Obsidian | `obsidian-100` | `obsidian-100` | Deep background (dark mode) |
| Sapphire | `sapphire-600` | `sapphire-500` | Primary accent (buttons, links) |
| Emerald | `emerald-accent-500` | `emerald-accent-400` | Secondary accent (CTAs) |

---

## Component Quick Snippets

### Card Variants
```jsx
// Premium card (default)
<div className="card-premium">Content</div>

// Glass card (transparent + blur)
<div className="card-glass">Form or overlay</div>

// Gradient card (subtle background)
<div className="card-gradient">Feature block</div>
```

### Buttons
```jsx
// Primary (main CTA)
<button className="btn-primary">Primary Action</button>

// Secondary (outline)
<button className="btn-secondary">Secondary Action</button>

// Ghost (text-only)
<button className="btn-ghost">Tertiary Action</button>

// Premium (alternative primary)
<button className="btn-premium">Premium Action</button>
```

### Form Inputs
```jsx
<input className="input-premium" placeholder="..." />
<textarea className="textarea-premium" rows={6}></textarea>
```

### Text Styling
```jsx
// Large hero text
<h1 className="text-hero">Headline</h1>

// Section title
<h2 className="text-section-title">Section</h2>

// Card title
<h3 className="text-card-title">Card Title</h3>

// Gradient text
<span className="text-gradient-sapphire">Blue text</span>
<span className="text-gradient-emerald">Green text</span>
<span className="text-gradient-premium">Multi-color text</span>

// Muted secondary text
<p className="text-muted">Secondary</p>
```

### Badges
```jsx
<div className="badge-primary">
  <Sparkles size={16} />
  Feature Badge
</div>

<div className="badge-secondary">
  Secondary Badge
</div>
```

---

## Layout Patterns

### Full-Width Section
```jsx
<section className="relative py-24 px-6 bg-white dark:bg-obsidian-100">
  <div className="container-narrow space-y-12">
    {/* Content */}
  </div>
</section>
```

### Hero Section with Shapes
```jsx
<section className="relative min-h-[70vh] overflow-hidden bg-gradient-hero">
  <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full 
                   bg-gradient-to-br from-sapphire-200/30 to-transparent 
                   blur-3xl animate-drift-slow pointer-events-none"></div>
  
  <div className="relative z-10 flex items-center justify-center px-6 py-24">
    {/* Hero content */}
  </div>
</section>
```

### Two-Column Layout
```jsx
<div className="grid md:grid-cols-2 gap-16 items-center">
  <div className="space-y-6">
    <h2 className="text-section-title">Title</h2>
    <p className="text-lg">Content...</p>
  </div>
  
  <div className="relative h-96 rounded-3xl overflow-hidden shadow-elevated">
    {/* Image or visual */}
  </div>
</div>
```

### Card Grid
```jsx
<div className="grid md:grid-cols-3 gap-8">
  {items.map(item => (
    <div key={item.id} className="card-premium p-8 hover-lift">
      {/* Card content */}
    </div>
  ))}
</div>
```

---

## Animation Classes

### Entrance
- `animate-fade-in-up` - Fade in + slide up
- `animate-scale-in` - Grow from small to normal
- `animate-slide-in-left` - Slide from left side

### Continuous
- `animate-drift` - Slow background movement
- `animate-drift-slow` - Slower variation
- `animate-gentle-float` - Vertical floating motion

### Usage
```jsx
<div className="animate-fade-in-up">Content enters smoothly</div>
<div className="group hover-lift">Lifts on hover</div>
<div className="smooth-transition">All properties transition</div>
```

---

## Hover & Interactive States

### Cards
```jsx
<div className="card-premium hover-lift">
  Lifts slightly on hover
</div>

<div className="group card-premium">
  <h3 className="group-hover:text-sapphire-600">Text color changes</h3>
</div>
```

### Buttons
```jsx
<button className="btn-primary hover:shadow-elevated active:scale-95">
  Elevates on hover, scales on click
</button>
```

### Links
```jsx
<a className="btn-ghost group">
  Link
  <ArrowRight className="group-hover:translate-x-1" />
</a>
```

---

## Typography Rules

### Headings
- **H1**: `.text-hero` or `text-5xl md:text-6xl font-bold`
- **H2**: `.text-section-title` or `text-3xl md:text-4xl font-bold`
- **H3**: `.text-card-title` or `text-xl md:text-2xl font-semibold`

### Body Text
- **Paragraph**: `text-base md:text-lg leading-relaxed`
- **Secondary**: `text-primary-600 dark:text-pearl-300`
- **Muted**: `.text-muted` or `text-primary-500 dark:text-pearl-400`

### Never Use
- ❌ Thin, light weight for body text (hard to read)
- ❌ Small cramped text (< 16px on mobile)
- ❌ Low contrast (test with color blindness simulator)
- ❌ All caps for body text (harder to read)

---

## Dark Mode Pattern

All components support dark mode via `dark:` prefix:

```jsx
<div className="bg-white dark:bg-obsidian-50
                text-primary-900 dark:text-pearl-50
                border-pearl-200 dark:border-obsidian-100
                shadow-soft dark:shadow-luxury-dark">
  Content works in both modes
</div>
```

---

## Common Patterns

### Section with Title
```jsx
<section className="py-24 px-6 bg-white dark:bg-obsidian-100">
  <div className="container-narrow">
    <div className="space-y-12">
      <div className="space-y-4 text-center">
        <h2 className="text-section-title">Section Title</h2>
        <p className="text-lg text-primary-600 dark:text-pearl-300 max-w-2xl mx-auto">
          Subtitle
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        {/* Card grid */}
      </div>
    </div>
  </div>
</section>
```

### Sticky Form
```jsx
<div className="sticky top-8">
  <div className="card-glass p-12 space-y-8">
    <form className="space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold">Label</label>
        <input className="input-premium" />
      </div>
      <button className="btn-primary w-full">Submit</button>
    </form>
  </div>
</div>
```

### CTA Section
```jsx
<section className="py-20 bg-gradient-to-r from-sapphire-600 to-emerald-accent-500
                    dark:from-sapphire-700 dark:to-emerald-accent-600">
  <div className="container-narrow text-center space-y-8">
    <h2 className="text-4xl font-bold text-white">Headline</h2>
    <p className="text-lg text-white/90">Subtext</p>
    <a href="#" className="btn-primary bg-white text-sapphire-600">
      CTA Button
    </a>
  </div>
</section>
```

---

## Spacing Standards

### Section Padding
- Vertical: `py-20` (mobile) → `py-24` (desktop)
- Horizontal: `px-6` (mobile) → `max-w-6xl mx-auto` (desktop)
- Gap between sections: `space-y-12` to `space-y-16`

### Card Padding
- Inside cards: `p-8` to `p-12`
- Card spacing: `gap-8` in grids

### Text Spacing
- Between title & subtitle: `space-y-4`
- Between paragraphs: `space-y-6`
- Between sections: `space-y-12` to `space-y-16`

---

## Responsive Images

```jsx
<div className="relative h-96 rounded-3xl overflow-hidden shadow-elevated">
  <Image
    src={url}
    alt="description"
    fill
    className="object-cover"
  />
</div>
```

---

## Do's & Don'ts

### ✅ DO
- Use `card-premium` for most containers
- Use `btn-primary` for main actions
- Use `animate-fade-in-up` for page content
- Use `smooth-transition` for all interactive elements
- Use soft shadows (`shadow-soft`)
- Use rounded corners (`rounded-2xl` minimum)
- Use breathing room (generous spacing)
- Use high contrast (readable text)

### ❌ DON'T
- Use bright neon colors
- Use thin weight fonts for body text
- Use harsh shadows or glows
- Use sharp corners (`rounded-none`)
- Use cramped spacing
- Use more than 3 colors in one component
- Use animated backgrounds excessively
- Use low contrast text

---

## Testing Checklist

- [ ] Looks premium in light mode
- [ ] Looks professional in dark mode
- [ ] Buttons have active/hover feedback
- [ ] Forms are easy to fill
- [ ] Text is readable (zoom to 200%)
- [ ] Animations don't distract
- [ ] Mobile layout works
- [ ] Spacing feels generous
- [ ] Colors work for color-blind users
- [ ] Works with screen reader

---

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css          (← Component library)
│   │   ├── page.tsx             (← Home page)
│   │   ├── about/page.tsx       (← About page)
│   │   ├── contact/page.tsx     (← Contact page)
│   │   └── ...
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   └── styles/
└── tailwind.config.js           (← Color system & animations)
```

---

## For Developers

### Extending the Design

**Add a new card variant:**
```css
@layer components {
  .card-custom {
    @apply rounded-3xl bg-gradient-to-br from-sapphire-100 to-emerald-accent-100
           dark:from-sapphire-950/40 dark:to-emerald-accent-950/40
           border border-sapphire-300/50 dark:border-sapphire-700/30
           shadow-soft;
  }
}
```

**Add a new button variant:**
```css
@layer components {
  .btn-custom {
    @apply inline-flex items-center gap-2 rounded-2xl
           bg-emerald-accent-600 hover:bg-emerald-accent-700
           text-white font-semibold px-6 py-3
           transition-all duration-250 shadow-soft;
  }
}
```

---

## Contact & Support

Need design adjustments? Ask for:
- New color variations
- Additional card styles
- Custom animations
- Brand-specific components
- Accessibility improvements

All changes integrate seamlessly with the existing system.
