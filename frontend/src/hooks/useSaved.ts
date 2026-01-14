import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  getSavedItems,
  saveForLater,
  removeFromSaved,
  clearSavedItems,
} from '@/lib/api';

export function useSaved() {
  const queryClient = useQueryClient();

  // Query: Fetch saved items
  const { data, isLoading, error } = useQuery(
    ['favorites'],
    getSavedItems,
    {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    }
  );

  // Mutation: Save for later
  const saveForLaterMutation = useMutation(
    (productId: string) => saveForLater(productId),
    {
      onSuccess: () => {
        console.log('[FAVORITES HOOK] ✅ Item saved, invalidating favorites query');
        queryClient.invalidateQueries(['favorites']);
      },
      onError: (error) => {
        console.error('[FAVORITES HOOK] ❌ Failed to save item:', error);
      },
    }
  );

  // Mutation: Remove from saved
  const removeFromSavedMutation = useMutation(
    (productId: string) => removeFromSaved(productId),
    {
      onSuccess: () => {
        console.log('[FAVORITES HOOK] ✅ Item removed, invalidating favorites query');
        queryClient.invalidateQueries(['favorites']);
      },
      onError: (error) => {
        console.error('[FAVORITES HOOK] ❌ Failed to remove from saved:', error);
      },
    }
  );

  // Mutation: Clear saved items
  const clearSavedMutation = useMutation(clearSavedItems, {
    onSuccess: () => {
      console.log('[FAVORITES HOOK] ✅ Favorites cleared, invalidating favorites query');
      queryClient.invalidateQueries(['favorites']);
    },
    onError: (error) => {
      console.error('[FAVORITES HOOK] ❌ Failed to clear favorites:', error);
    },
  });

  // Wrapper functions for components
  const save = async (productId: string) => {
    try {
      console.log(`[FAVORITES HOOK] Saving product ${productId}`);
      await saveForLaterMutation.mutateAsync(productId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const remove = async (productId: string) => {
    try {
      console.log(`[FAVORITES HOOK] Removing product ${productId} from favorites`);
      await removeFromSavedMutation.mutateAsync(productId);
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  const isSaved = (productId: string): boolean => {
    // Check if product is in the saved items
    return (data?.items || []).some(
      (item: any) => item.productId._id === productId || item.productId === productId
    );
  };

  const clear = async () => {
    try {
      console.log('[FAVORITES HOOK] Clearing all favorites');
      await clearSavedMutation.mutateAsync();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    items: data?.items || [],
    count: data?.count || 0,
    isLoading:
      isLoading ||
      saveForLaterMutation.isLoading ||
      removeFromSavedMutation.isLoading ||
      clearSavedMutation.isLoading,
    error,
    save,
    remove,
    isSaved,
    clear,
  };
}
