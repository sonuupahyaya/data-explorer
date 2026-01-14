# BookVault Premium Design - Component Examples

## Overview

Complete component examples using the premium design system. Copy-paste ready code for all UI elements.

---

## 1. HEADER

### Standard Header
```jsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, Heart } from 'lucide-react';
import SearchBar from './SearchBar';
import { ThemeToggle } from './ThemeToggle';
import { useCart, useSaved } from '@/hooks';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { itemCount } = useCart();
  const { count: savedCount } = useSaved();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md border-b border-neutral-200/50 dark:border-neutral-800/50 transition-colors duration-300">
      <nav className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* Logo with gradient */}
          <Link href="/" className="flex-shrink-0 group">
            <span className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity duration-300">
              BookVault
            </span>
          </Link>

          {/* Search - Desktop only */}
          <div className="hidden flex-1 max-w-md lg:block">
            <SearchBar />
          </div>

          {/* Navigation - Desktop only */}
          <div className="hidden items-center gap-8 lg:flex">
            <Link href="/about" className="text-sm font-medium text-primary-600 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250">
              About
            </Link>
            <ThemeToggle />
            <Link href="/cart" className="relative p-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
              <ShoppingCart size={20} strokeWidth={1.5} />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent-600 text-xs font-semibold text-white">
                  {Math.min(itemCount, 99)}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
```

---

## 2. BUTTONS

### Premium Primary Button
```jsx
<button className="btn-premium">
  Add to Cart
</button>
```

Output class:
```
rounded-xl
bg-gradient-to-r from-accent-600 to-accent-700
hover:from-accent-700 hover:to-accent-800
dark:from-accent-700 dark:to-secondary-700
dark:hover:from-accent-800 dark:hover:to-secondary-800
text-white font-semibold
transition-all duration-250
shadow-soft hover:shadow-glow
disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none
```

### Secondary Button (White)
```jsx
<button className="px-6 py-3 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-primary-900 dark:text-neutral-100 font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-all duration-250">
  Learn More
</button>
```

### Icon Button
```jsx
<button className="p-2 text-primary-700 dark:text-neutral-300 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
  <Heart size={20} strokeWidth={1.5} />
</button>
```

---

## 3. CARDS

### Product Card (Complete Example)
```jsx
<div className="group h-full flex flex-col overflow-hidden rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 shadow-card hover:shadow-float-lg dark:shadow-lg dark:hover:shadow-glow-dark transition-all duration-350 ease-smooth hover:-translate-y-1">
  {/* Image Container */}
  <div className="relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-700 dark:to-neutral-800">
    <Image
      src={imageUrl}
      alt={title}
      fill
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 brightness-100 group-hover:brightness-105"
      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
      unoptimized
      onError={(e) => {
        e.currentTarget.src = '/images/placeholder-book.svg';
      }}
    />
    
    {/* Overlay Gradient */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

    {/* Save Button */}
    <button className="absolute top-3 right-3 rounded-full p-2.5 transition-all duration-250 backdrop-blur-md transform group-hover:scale-110 bg-white/90 dark:bg-neutral-800/90 text-primary-600 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 shadow-soft dark:shadow-lg hover:shadow-elevated">
      <Heart size={18} strokeWidth={2} />
    </button>
  </div>

  {/* Content */}
  <div className="flex flex-col gap-3 p-5 flex-1 bg-white dark:bg-neutral-800">
    <h3 className="line-clamp-2 text-sm font-semibold text-primary-900 dark:text-neutral-100 group-hover:text-accent-600 dark:group-hover:text-accent-500 transition-colors duration-250">
      {title}
    </h3>

    <p className="text-xs text-primary-500 dark:text-neutral-400 truncate font-medium">
      by {author}
    </p>

    {/* Rating */}
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-neutral-300 dark:text-neutral-600'
            }
            strokeWidth={0}
          />
        ))}
      </div>
      <span className="text-xs text-primary-600 dark:text-neutral-400 font-semibold">
        {rating?.toFixed(1)}
      </span>
    </div>

    {/* Price */}
    <div className="mt-auto pt-3">
      <span className="text-lg font-bold bg-gradient-to-r from-accent-600 to-accent-700 bg-clip-text text-transparent">
        ${price?.toFixed(2)}
      </span>
    </div>

    {/* Add to Cart Button */}
    <button className="btn-premium mt-4 flex items-center justify-center gap-2 py-3 px-4">
      <ShoppingCart size={16} strokeWidth={2} />
      Add to Cart
    </button>
  </div>
</div>
```

### Premium Info Card
```jsx
<div className="card-premium p-6">
  <h3 className="text-lg font-semibold text-primary-900 dark:text-neutral-100">
    Premium Quality
  </h3>
  <p className="text-sm text-primary-600 dark:text-neutral-400 mt-3 leading-relaxed">
    Curated collection of books from the finest publishers and authors worldwide.
  </p>
</div>
```

### Glass Panel Card (Dark Mode)
```jsx
<div className="glass-panel p-6 rounded-2xl">
  <h3 className="text-lg font-semibold text-primary-900 dark:text-neutral-100">
    Order Summary
  </h3>
  <div className="mt-4 space-y-2">
    <div className="flex justify-between text-sm">
      <span className="text-primary-600 dark:text-neutral-400">Subtotal</span>
      <span className="font-semibold text-primary-900 dark:text-neutral-100">$99.99</span>
    </div>
  </div>
</div>
```

---

## 4. INPUTS & FORMS

### Premium Input
```jsx
<input
  type="text"
  placeholder="Search books..."
  className="input-premium"
/>
```

Output class:
```
rounded-xl
border border-neutral-200 dark:border-neutral-700
bg-white dark:bg-neutral-800
px-4 py-3
text-primary-900 dark:text-neutral-100
placeholder-neutral-400 dark:placeholder-neutral-500
focus:outline-none focus:ring-2 focus:ring-accent-600
focus:border-transparent
transition-all duration-250
```

### Form Group
```jsx
<div className="space-y-2">
  <label className="block text-sm font-medium text-primary-900 dark:text-neutral-100">
    Email Address
  </label>
  <input
    type="email"
    className="input-premium w-full"
    placeholder="you@example.com"
  />
</div>
```

### Search Bar
```jsx
<form className="relative w-full">
  <div className="relative">
    <input
      type="text"
      placeholder="Search books..."
      className="w-full rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-4 py-3 pl-10 text-sm text-primary-900 dark:text-neutral-100 placeholder-primary-500 dark:placeholder-neutral-500 transition-all duration-250 focus:border-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-600/20 dark:focus:ring-accent-500/20"
    />
    <Search
      size={18}
      strokeWidth={1.5}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-500 dark:text-neutral-400 pointer-events-none"
    />
  </div>
</form>
```

---

## 5. TEXT & TYPOGRAPHY

### Gradient Heading
```jsx
<h1 className="text-gradient text-4xl font-bold">
  Premium Book Collection
</h1>
```

### Text Hierarchy
```jsx
{/* Main heading */}
<h1 className="text-4xl font-bold text-primary-900 dark:text-neutral-100">
  Main Title
</h1>

{/* Subheading */}
<h2 className="text-2xl font-semibold text-primary-900 dark:text-neutral-100 mt-6">
  Section Title
</h2>

{/* Body text */}
<p className="text-base text-primary-600 dark:text-neutral-400 leading-relaxed">
  Regular paragraph text with proper line height for readability.
</p>

{/* Secondary text */}
<p className="text-sm text-primary-500 dark:text-neutral-500">
  Small secondary text or metadata
</p>
```

---

## 6. BADGES & TAGS

### Accent Badge
```jsx
<span className="inline-flex items-center gap-2 rounded-full bg-accent-100 dark:bg-accent-900/30 px-3 py-1 text-xs font-semibold text-accent-700 dark:text-accent-300">
  <span className="w-2 h-2 rounded-full bg-accent-600 dark:bg-accent-400" />
  New
</span>
```

### Pill Badge
```jsx
<span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-3 py-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
  Fiction
</span>
```

---

## 7. DIVIDERS & SEPARATORS

### Simple Divider
```jsx
<div className="border-t border-neutral-200 dark:border-neutral-800" />
```

### Divider with Text
```jsx
<div className="relative my-8">
  <div className="absolute inset-0 flex items-center">
    <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
  </div>
  <div className="relative flex justify-center text-sm">
    <span className="bg-white dark:bg-neutral-950 px-2 text-neutral-500 dark:text-neutral-400">
      or continue with
    </span>
  </div>
</div>
```

---

## 8. MODALS & OVERLAYS

### Modal Container
```jsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 transition-colors duration-300">
  <div className="rounded-3xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 p-8 shadow-modal w-full max-w-md">
    <h2 className="text-2xl font-bold text-primary-900 dark:text-neutral-100">
      Confirm
    </h2>
    <p className="mt-4 text-sm text-primary-600 dark:text-neutral-400">
      Are you sure?
    </p>
    <div className="mt-6 flex gap-3">
      <button className="flex-1 btn-premium">
        Confirm
      </button>
      <button className="flex-1 px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-primary-900 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors duration-250">
        Cancel
      </button>
    </div>
  </div>
</div>
```

---

## 9. EMPTY STATES

### Empty State
```jsx
<div className="flex min-h-96 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 p-12 transition-colors duration-300">
  <div className="text-center space-y-3">
    <Heart size={48} className="mx-auto text-neutral-300 dark:text-neutral-600" />
    <p className="text-lg font-semibold text-primary-900 dark:text-neutral-100">
      No favorites yet
    </p>
    <p className="text-sm text-primary-600 dark:text-neutral-400">
      Start saving your favorite books
    </p>
    <Link href="/" className="btn-premium inline-block mt-4">
      Explore Books
    </Link>
  </div>
</div>
```

---

## 10. FOOTER

### Premium Footer
```jsx
<footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors duration-300">
  <div className="mx-auto max-w-6xl px-6 py-16">
    <div className="grid gap-12 md:grid-cols-4">
      {/* Brand */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-accent-600 to-secondary-600 bg-clip-text text-transparent">
          BookVault
        </h2>
        <p className="text-sm text-primary-600 dark:text-neutral-400">
          Premium book discovery for readers.
        </p>
      </div>

      {/* Links Column */}
      <div className="space-y-4">
        <h3 className="font-semibold text-primary-900 dark:text-neutral-100">
          Navigation
        </h3>
        <ul className="space-y-3 text-sm">
          <li>
            <Link href="/" className="text-primary-600 dark:text-neutral-400 hover:text-accent-600 dark:hover:text-accent-500 transition-colors duration-250">
              Home
            </Link>
          </li>
        </ul>
      </div>
    </div>

    <div className="my-12 border-t border-neutral-200 dark:border-neutral-800" />

    <div className="text-center text-sm text-primary-600 dark:text-neutral-400">
      <p>&copy; 2026 BookVault. All rights reserved.</p>
    </div>
  </div>
</footer>
```

---

## 11. SECTIONS

### Hero Section
```jsx
<section className="relative overflow-hidden bg-white dark:bg-neutral-900 transition-colors duration-300">
  <div className="mx-auto max-w-7xl px-6 py-20 sm:py-32">
    <div className="text-center space-y-6">
      <h1 className="text-gradient text-5xl font-bold">
        Discover Premium Books
      </h1>
      <p className="text-xl text-primary-600 dark:text-neutral-400 max-w-2xl mx-auto">
        Curated collection of the finest books from around the world.
      </p>
      <button className="btn-premium mt-8">
        Explore Now
      </button>
    </div>
  </div>
</section>
```

### Feature Grid
```jsx
<section className="bg-neutral-50 dark:bg-neutral-800 transition-colors duration-300">
  <div className="mx-auto max-w-7xl px-6 py-16">
    <h2 className="text-3xl font-bold text-primary-900 dark:text-neutral-100 text-center mb-12">
      Why Choose Us
    </h2>
    <div className="grid md:grid-cols-3 gap-8">
      {features.map((feature) => (
        <div key={feature.id} className="card-premium p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-accent-100 dark:bg-accent-900/30 mb-4">
            {feature.icon}
          </div>
          <h3 className="text-lg font-semibold text-primary-900 dark:text-neutral-100 mt-4">
            {feature.title}
          </h3>
          <p className="text-sm text-primary-600 dark:text-neutral-400 mt-2">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  </div>
</section>
```

---

## 12. RESPONSIVE CONTAINERS

### Full Width Container
```jsx
<div className="w-full bg-white dark:bg-neutral-900 transition-colors duration-300">
  <div className="mx-auto max-w-7xl px-6 py-12">
    {/* Content */}
  </div>
</div>
```

### Centered Section
```jsx
<section className="mx-auto max-w-6xl px-6 py-16 space-y-12">
  <h2 className="text-3xl font-bold text-primary-900 dark:text-neutral-100">
    Section Title
  </h2>
  {/* Content */}
</section>
```

---

## Color Shortcuts

### Light Mode
```
Background: bg-white
Text: text-primary-900
Secondary: text-primary-600
Borders: border-neutral-200
Hover: hover:text-accent-600
```

### Dark Mode (Always Add)
```
Background: dark:bg-neutral-800 or dark:bg-neutral-900
Text: dark:text-neutral-100
Secondary: dark:text-neutral-400
Borders: dark:border-neutral-700
Hover: dark:hover:text-accent-500
```

---

## Animation Examples

### Fade In
```jsx
<div className="animate-fade-in">
  Content
</div>
```

### Slide Up
```jsx
<div className="animate-slide-up">
  Content
</div>
```

### Floating Element
```jsx
<div className="animate-float">
  Content
</div>
```

### Glow Pulse
```jsx
<div className="animate-glow-pulse">
  Content
</div>
```

---

## Spacing Patterns

### Section Spacing
```jsx
<section className="py-16 lg:py-24">
  <div className="mx-auto max-w-7xl px-6 space-y-8">
    {/* Content with gap-8 between items */}
  </div>
</section>
```

### Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Cards */}
</div>
```

---

All examples are production-ready and follow the BookVault premium design system.
