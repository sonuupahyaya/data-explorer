import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from '@/lib/api';

export function useCart() {
  const queryClient = useQueryClient();

  // Query: Fetch cart data
  const { data, isLoading, error } = useQuery(
    ['cart'],
    getCart,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  // Mutation: Add to cart
  const addToCartMutation = useMutation(
    (params: { productId: string; quantity: number }) =>
      addToCart(params.productId, params.quantity),
    {
      onSuccess: () => {
        console.log('[CART HOOK] ✅ Item added, invalidating cart query');
        queryClient.invalidateQueries(['cart']);
      },
      onError: (error) => {
        console.error('[CART HOOK] ❌ Failed to add to cart:', error);
      },
    }
  );

  // Mutation: Remove from cart
  const removeFromCartMutation = useMutation(
    (productId: string) => removeFromCart(productId),
    {
      onSuccess: () => {
        console.log('[CART HOOK] ✅ Item removed, invalidating cart query');
        queryClient.invalidateQueries(['cart']);
      },
      onError: (error) => {
        console.error('[CART HOOK] ❌ Failed to remove from cart:', error);
      },
    }
  );

  // Mutation: Update quantity
  const updateQuantityMutation = useMutation(
    (params: { productId: string; quantity: number }) =>
      updateCartQuantity(params.productId, params.quantity),
    {
      onSuccess: () => {
        console.log('[CART HOOK] ✅ Quantity updated, invalidating cart query');
        queryClient.invalidateQueries(['cart']);
      },
      onError: (error) => {
        console.error('[CART HOOK] ❌ Failed to update quantity:', error);
      },
    }
  );

  // Mutation: Clear cart
  const clearCartMutation = useMutation(clearCart, {
    onSuccess: () => {
      console.log('[CART HOOK] ✅ Cart cleared, invalidating cart query');
      queryClient.invalidateQueries(['cart']);
    },
    onError: (error) => {
      console.error('[CART HOOK] ❌ Failed to clear cart:', error);
    },
  });

  // Wrapper functions for components
  const addItem = async (productId: string, quantity: number = 1) => {
    try {
      console.log(`[CART HOOK] Adding ${quantity} of product ${productId}`);
      await addToCartMutation.mutateAsync({ productId, quantity });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const removeItem = async (productId: string) => {
    try {
      console.log(`[CART HOOK] Removing product ${productId}`);
      await removeFromCartMutation.mutateAsync(productId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      console.log(`[CART HOOK] Updating quantity for ${productId} to ${quantity}`);
      await updateQuantityMutation.mutateAsync({ productId, quantity });
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const clear = async () => {
    try {
      console.log('[CART HOOK] Clearing cart');
      await clearCartMutation.mutateAsync();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    cart: data,
    items: data?.items || [],
    itemCount: data?.itemCount || 0,
    total: data?.total || 0,
    isLoading:
      isLoading ||
      addToCartMutation.isLoading ||
      removeFromCartMutation.isLoading ||
      updateQuantityMutation.isLoading ||
      clearCartMutation.isLoading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };
}
