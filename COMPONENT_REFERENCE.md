# Component & Hook Reference

## 🪝 React Hooks

### useCart()
```typescript
import { useCart } from '@/hooks';

const {
  // State
  cart: object,           // Full cart object
  items: CartItem[],      // Array of cart items
  itemCount: number,      // Total items in cart
  total: number,          // Total price
  isLoading: boolean,     // Loading state
  error: Error | null,    // Error state

  // Methods
  addItem: (productId: string, quantity?: number) => Promise<{success: boolean}>,
  removeItem: (productId: string) => Promise<{success: boolean}>,
  updateQuantity: (productId: string, quantity: number) => Promise<{success: boolean}>,
  clear: () => Promise<{success: boolean}>
} = useCart();
```

**Example:**
```typescript
const { items, total, addItem } = useCart();

const handleAdd = async () => {
  const result = await addItem('product-id-123', 2);
  if (result.success) {
    console.log('Added to cart');
  }
};
```

---

### useSaved()
```typescript
import { useSaved } from '@/hooks';

const {
  // State
  items: SavedItem[],     // Array of saved items
  count: number,          // Total saved items
  isLoading: boolean,     // Loading state
  error: Error | null,    // Error state

  // Methods
  save: (productId: string) => Promise<{success: boolean}>,
  remove: (productId: string) => Promise<{success: boolean}>,
  isSaved: (productId: string) => Promise<boolean>,
  clear: () => Promise<{success: boolean}>
} = useSaved();
```

**Example:**
```typescript
const { items, save, remove } = useSaved();

const handleToggleSave = async (productId: string) => {
  const saved = await isSaved(productId);
  if (saved) {
    await remove(productId);
  } else {
    await save(productId);
  }
};
```

---

### useToasts()
```typescript
import { useToasts } from '@/components/Toast';

const {
  // State
  toasts: Toast[],        // Array of active toasts

  // Methods
  show: (msg: string, type?: 'success'|'error'|'info', duration?: number) => string,
  close: (id: string) => void,
  success: (msg: string, duration?: number) => string,
  error: (msg: string, duration?: number) => string,
  info: (msg: string, duration?: number) => string
} = useToasts();
```

**Example:**
```typescript
const { success, error } = useToasts();

try {
  await addToCart();
  success('Added to cart!', 2000); // Auto-dismiss in 2s
} catch (err) {
  error('Failed to add to cart');
}
```

---

## 📦 Components

### ProductCard
**Location:** `frontend/src/components/ProductCard.tsx`

**Props:**
```typescript
interface ProductCardProps {
  _id?: string;           // MongoDB ID
  id?: string;            // Fallback ID
  title: string;          // Product title (required)
  image?: string;         // Image URL
  image_url?: string;     // Alternative image field
  price?: number;         // Price in USD
  rating?: number;        // 0-5 star rating
  author?: string;        // Author name
}
```

**Features:**
- ❤️ Save button (top-right)
- 🛒 Add to Cart button (bottom)
- Toast notifications
- Responsive image loading
- Link to product detail page

**Usage:**
```typescript
import ProductCard from '@/components/ProductCard';

<ProductCard
  _id="65abc123..."
  title="Harry Potter"
  author="J.K. Rowling"
  price={29.99}
  rating={4.8}
  image_url="https://example.com/book.jpg"
/>
```

---

### ProductGrid
**Location:** `frontend/src/components/ProductGrid.tsx`

**Props:**
```typescript
interface ProductGridProps {
  products: Product[];         // Array of products
  isLoading?: boolean;         // Show skeleton loaders
  columns?: number;            // Grid columns (default: 4)
  gap?: string;               // Grid gap (Tailwind class)
}
```

**Features:**
- Responsive grid layout
- Skeleton loaders while loading
- Auto-adjusts columns on mobile
- Wraps ProductCard

**Usage:**
```typescript
import { ProductGrid } from '@/components';

<ProductGrid
  products={products}
  isLoading={isLoading}
  columns={4}
/>
```

---

### Header
**Location:** `frontend/src/components/Header.tsx`

**Features:**
- Logo (left)
- Search bar (center)
- 🛒 Cart icon with badge
- ❤️ Saved icon with badge
- Navigation links
- Mobile-responsive menu
- Sticky position

**Usage:**
```typescript
// Automatically imported in layout
// Shows cart/saved counts in real-time
```

---

### ToastContainer & ToastItem
**Location:** `frontend/src/components/Toast.tsx`

**Props:**
```typescript
interface Toast {
  id: string;                              // Unique ID
  message: string;                         // Toast text
  type: 'success' | 'error' | 'info';      // Toast type
  duration?: number;                       // Auto-dismiss ms
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}
```

**Features:**
- Fixed bottom-right positioning
- Auto-dismiss (3s default)
- Close button
- Color-coded by type
- Smooth animations

---

## 🔌 API Functions

**Location:** `frontend/src/lib/api.ts`

### Cart Functions
```typescript
// Get entire cart
getCart(): Promise<{items, itemCount, total}>

// Add product to cart
addToCart(productId: string, quantity?: number): Promise<CartItem>

// Update quantity
updateCartQuantity(productId: string, quantity: number): Promise<CartItem>

// Remove item
removeFromCart(productId: string): Promise<{success: boolean}>

// Clear entire cart
clearCart(): Promise<{success: boolean}>
```

### SavedForLater Functions
```typescript
// Get all saved items
getSavedItems(): Promise<{items, count}>

// Save product
saveForLater(productId: string): Promise<SavedItem>

// Check if saved
checkIfSaved(productId: string): Promise<{isSaved: boolean}>

// Remove from saved
removeFromSaved(productId: string): Promise<{success: boolean}>

// Clear all saved
clearSavedItems(): Promise<{success: boolean}>
```

---

## 📄 Pages

### /
**File:** `frontend/src/app/page.tsx`
- Home page with featured products
- Categories section
- Hero banner
- Viewing history

### /product/[id]
**File:** `frontend/src/app/product/[id]/page.tsx`
- Product detail view
- Large image (sticky)
- Title, author, rating
- Price and description
- 3 CTA buttons:
  - Add to Cart (primary)
  - Save for Later (secondary)
  - Buy on World of Books (external)
- Similar products carousel
- Product metadata

### /cart
**File:** `frontend/src/app/cart/page.tsx`
- List all cart items
- Quantity controls
- Remove items
- Order summary (sticky on desktop)
- Total calculation
- "Proceed to Checkout" button
- Empty state

### /saved
**File:** `frontend/src/app/saved/page.tsx`
- Grid of saved products
- Clear all button
- Empty state
- Uses ProductGrid component

---

## 🗄️ Backend Services

### CartService
**Location:** `backend/src/cart/cart.service.ts`

```typescript
class CartService {
  // Add or update cart item
  addToCart(userId: string, productId: string, quantity: number): Promise<CartItem>

  // Update quantity
  updateQuantity(userId: string, productId: string, quantity: number): Promise<CartItem>

  // Remove item
  removeFromCart(userId: string, productId: string): Promise<{success: boolean}>

  // Get cart
  getCart(userId: string): Promise<{items, itemCount, total}>

  // Clear cart
  clearCart(userId: string): Promise<{success: boolean}>

  // Generate userId from request
  generateUserId(req: any): string
}
```

### SavedForLaterService
**Location:** `backend/src/saved-for-later/saved-for-later.service.ts`

```typescript
class SavedForLaterService {
  // Save product
  saveForLater(userId: string, productId: string): Promise<SavedItem>

  // Remove from saved
  removeFromSaved(userId: string, productId: string): Promise<{success: boolean}>

  // Get all saved
  getSavedItems(userId: string): Promise<{items, count}>

  // Check if saved
  isProductSaved(userId: string, productId: string): Promise<boolean>

  // Clear all saved
  clearSavedItems(userId: string): Promise<{success: boolean}>

  // Generate userId from request
  generateUserId(req: any): string
}
```

---

## 📊 Data Models

### CartItem
```typescript
interface CartItem {
  _id: string;                      // MongoDB ID
  userId: string;                   // Session user ID
  productId: Product;               // Full product object (populated)
  quantity: number;                 // Quantity ordered
  expiresAt: Date;                  // Expires in 30 days
  createdAt: Date;
  updatedAt: Date;
}
```

### SavedItem
```typescript
interface SavedItem {
  _id: string;                      // MongoDB ID
  userId: string;                   // Session user ID
  productId: Product;               // Full product object (populated)
  expiresAt: Date;                  // Expires in 90 days
  createdAt: Date;
  updatedAt: Date;
}
```

### Product
```typescript
interface Product {
  _id: string;
  source_id: string;
  source_url: string;
  title: string;
  author: string;
  price: number;
  currency: string;
  image_url?: string;
  categories: string[];
  isbn?: string;
  publisher?: string;
  publication_date?: Date;
  description?: string;
  specs: Record<string, any>;
  rating_avg: number;
  reviews_count: number;
  is_available: boolean;
}
```

---

## 🛣️ API Routes

### Cart Routes
```
GET    /api/cart              // Get user cart
POST   /api/cart/add          // Add to cart
POST   /api/cart/:id/quantity // Update quantity
DELETE /api/cart/:id          // Remove item
DELETE /api/cart              // Clear cart
```

### SavedForLater Routes
```
GET    /api/saved              // Get saved items
POST   /api/saved/add          // Save product
GET    /api/saved/:id/is-saved // Check if saved
DELETE /api/saved/:id          // Remove from saved
DELETE /api/saved              // Clear saved items
```

---

## 🎨 Styling Classes

### Colors
```
Primary: primary-900, primary-700, primary-600
Accent: accent-600, accent-700
Gray: gray-100, gray-200, gray-300
Red: red-500, red-600
```

### Spacing
```
Padding: p-2, p-4, p-6, p-8
Margin: m-2, m-4, m-6, m-8
Gap: gap-2, gap-3, gap-4, gap-6, gap-8
```

### Common Patterns
```
Rounded: rounded-lg, rounded-xl
Shadows: shadow-card, shadow-hover, shadow-lg
Border: border, border-2, border-gray-200
```

---

## 🔄 Common Patterns

### Add to Cart Pattern
```typescript
const { addItem } = useCart();
const { success, error } = useToasts();

const handleAddToCart = async () => {
  try {
    const result = await addItem('product-id', 1);
    if (result.success) {
      success('Added to cart');
    } else {
      error('Failed to add');
    }
  } catch (err) {
    error('Error occurred');
  }
};
```

### Save for Later Pattern
```typescript
const { save, remove, items } = useSaved();
const { success } = useToasts();

const isSaved = items.some(item => 
  item.productId._id === productId
);

const handleToggleSave = async () => {
  try {
    if (isSaved) {
      await remove(productId);
    } else {
      await save(productId);
    }
    success(isSaved ? 'Removed' : 'Saved');
  } catch (err) {
    // Handle error
  }
};
```

### Conditional Styling Pattern
```typescript
<button className={`
  py-3 rounded-lg font-semibold transition-colors
  ${isSaved
    ? 'bg-red-50 border-2 border-red-300 text-red-600'
    : 'border-2 border-gray-300 text-primary-700'
  }
`}>
  {isSaved ? 'Saved' : 'Save'}
</button>
```

---

## 🚀 Quick Integration

### Add Cart to Custom Component
```typescript
'use client';

import { useCart } from '@/hooks';

export default function MyComponent() {
  const { items, addItem } = useCart();

  return (
    <div>
      <p>Cart items: {items.length}</p>
      <button onClick={() => addItem('product-id')}>
        Add
      </button>
    </div>
  );
}
```

### Add Toast to Custom Component
```typescript
'use client';

import { useToasts } from '@/components/Toast';

export default function MyComponent() {
  const { success } = useToasts();

  return (
    <button onClick={() => success('Done!')}>
      Click me
    </button>
  );
}
```

---

## 📚 File Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx (home)
│   │   ├── layout.tsx (root)
│   │   ├── layout-client.tsx (toast provider)
│   │   ├── product/[id]/page.tsx (detail)
│   │   ├── cart/page.tsx
│   │   └── saved/page.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── Toast.tsx (new)
│   │   ├── SearchBar.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   ├── useCart.ts (new)
│   │   ├── useSaved.ts (new)
│   │   └── index.ts (new)
│   └── lib/
│       ├── api.ts (updated)
│       └── storage.ts

backend/
├── src/
│   ├── app.module.ts (updated)
│   ├── cart/
│   │   ├── cart.controller.ts (new)
│   │   ├── cart.service.ts (new)
│   │   └── cart.module.ts (new)
│   ├── saved-for-later/
│   │   ├── saved-for-later.controller.ts (new)
│   │   ├── saved-for-later.service.ts (new)
│   │   └── saved-for-later.module.ts (new)
│   └── schemas/
│       ├── cart.schema.ts (new)
│       └── saved-for-later.schema.ts (new)
```

---

All components are production-ready with TypeScript types, error handling, and responsive design!
