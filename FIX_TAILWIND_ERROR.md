# Tailwind Configuration Fix

## Issue
The CSS error is: `The 'bg-pearl-50' class does not exist`

This means Tailwind is not generating the classes from our custom color configuration.

## Solution

### Step 1: Clear Tailwind Cache
Delete the `.next` folder to clear Next.js and Tailwind cache:
```bash
cd frontend
rm -rf .next
```

### Step 2: Rebuild
```bash
npm run dev
```

## If Issue Persists

### Check 1: Verify tailwind.config.js syntax
The file should start with:
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [...],
  theme: {
    extend: {
      colors: {
        'pearl': { 50: '#FAFAF9', ... },
        // ... more colors
      }
    }
  }
}
```

### Check 2: Verify postcss.config.js
Should contain:
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### Check 3: Verify package.json has tailwindcss
```json
{
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "postcss": "^8",
    "autoprefixer": "^10"
  }
}
```

## Most Likely Fix

Just run:
```bash
cd frontend
rm -rf .next node_modules/.cache
npm run dev
```

The classes will generate from `tailwind.config.js` on rebuild.

## Alternative: Use Standard Tailwind Colors

If issues persist, replace custom colors with Tailwind's built-in colors:

Instead of:
```jsx
bg-pearl-50      → use bg-gray-50
bg-obsidian-100  → use bg-gray-950
bg-sapphire-600  → use bg-blue-600
bg-emerald-500   → use bg-emerald-500
```

This will work immediately without config issues.
