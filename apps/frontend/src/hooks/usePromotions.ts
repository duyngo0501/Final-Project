import useSWR, { KeyedMutator } from "swr";
import {
  client, // Assuming Kubb client is exported from here
  Promotion, // Assuming Promotion type from generated client
  CreatePromotionRequest, // Assuming request type for creating
  UpdatePromotionRequest, // Assuming request type for updating
} from "@/lib/api-client"; // Adjust path if needed
import { message } from "antd";

/**
 * @description Interface for the return value of the usePromotions hook.
 */
interface UsePromotionsReturn {
  promotions: Promotion[] | undefined;
  isLoading: boolean;
  error: any;
  mutatePromotions: KeyedMutator<Promotion[]>; // SWR mutate function
  addPromotion: (
    data: CreatePromotionRequest
  ) => Promise<Promotion | undefined>;
  updatePromotion: (
    id: string,
    data: UpdatePromotionRequest
  ) => Promise<Promotion | undefined>;
  deletePromotion: (id: string) => Promise<void>;
}

const SWR_KEY = "/api/promotions"; // Unique key for SWR cache

/**
 * @description SWR hook for fetching and managing promotion data.
 * @returns {UsePromotionsReturn} An object containing promotion data, loading/error states, and mutation functions.
 */
export const usePromotions = (): UsePromotionsReturn => {
  const { data, error, isLoading, mutate } = useSWR<Promotion[]>(
    SWR_KEY,
    async () => {
      // Replace with actual API call using Kubb client
      // const response = await client.getPromotions({});
      // return response.data; // Or however the client returns data
      console.warn(
        "usePromotions: Fetching mock data. Replace with client.getPromotions()"
      );
      // Simulate API fetch with mock data for now
      await new Promise((resolve) => setTimeout(resolve, 300));
      // TODO: Replace with actual API call
      const mockPromotions: Promotion[] = [
        {
          id: "promo1",
          code: "SUMMER20",
          discountType: "percentage",
          discountValue: 20,
          startDate: "2024-06-01T00:00:00Z",
          endDate: "2024-08-31T23:59:59Z",
          status: "active",
          description: "20% off all summer items.",
        },
        // ... other mock promotions if needed
      ];
      return mockPromotions; // Returning mock for development
    },
    {
      // SWR configuration options (optional)
      revalidateOnFocus: false,
      // Add other options like error retry counts, etc.
    }
  );

  /**
   * @description Adds a new promotion via API and updates SWR cache.
   * @param {CreatePromotionRequest} data - The data for the new promotion.
   * @returns {Promise<Promotion | undefined>} The created promotion data or undefined on error.
   */
  const addPromotion = async (
    data: CreatePromotionRequest
  ): Promise<Promotion | undefined> => {
    try {
      // TODO: Replace with actual API call: const newPromotion = await client.createPromotion(data);
      console.warn(
        "usePromotions: Simulating addPromotion. Replace with client.createPromotion()"
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newPromotion: Promotion = {
        id: `new_${Date.now()}`,
        status: "inactive", // Default status or based on data
        ...data,
        // Ensure dates are strings if CreatePromotionRequest uses Dayjs or Date
        startDate:
          typeof data.startDate === "string"
            ? data.startDate
            : (data.startDate as Date).toISOString(),
        endDate:
          typeof data.endDate === "string"
            ? data.endDate
            : (data.endDate as Date).toISOString(),
      }; // Mock response

      // Optimistic update (optional): immediately add to local cache
      // mutate([...(data ?? []), newPromotion], false);

      // Revalidate cache after successful creation
      // Use returned data from API if available: mutate([...(data ?? []), createdPromotionData], false);
      await mutate(); // Re-fetch data to get the updated list
      message.success(`Promotion ${newPromotion.code} added successfully`);
      return newPromotion;
    } catch (err) {
      console.error("Failed to add promotion:", err);
      message.error("Failed to add promotion.");
      // Optional: Revert optimistic update if it failed
      // mutate(data, false);
      return undefined;
    }
  };

  /**
   * @description Updates an existing promotion via API and updates SWR cache.
   * @param {string} id - The ID of the promotion to update.
   * @param {UpdatePromotionRequest} data - The updated data for the promotion.
   * @returns {Promise<Promotion | undefined>} The updated promotion data or undefined on error.
   */
  const updatePromotion = async (
    id: string,
    updateData: UpdatePromotionRequest
  ): Promise<Promotion | undefined> => {
    try {
      // TODO: Replace with actual API call: const updatedPromotion = await client.updatePromotion(id, updateData);
      console.warn(
        `usePromotions: Simulating updatePromotion for ${id}. Replace with client.updatePromotion()`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));
      const updatedPromotion: Promotion = {
        // Mock response: merge existing with updateData
        ...(data?.find((p) => p.id === id) || ({} as Promotion)), // Find existing
        ...updateData,
        id,
        // Ensure dates are strings if UpdatePromotionRequest uses Dayjs or Date
        startDate:
          typeof updateData.startDate === "string"
            ? updateData.startDate
            : (updateData.startDate as Date).toISOString(),
        endDate:
          typeof updateData.endDate === "string"
            ? updateData.endDate
            : (updateData.endDate as Date).toISOString(),
      }; // Mock response

      // Optimistic update (optional)
      // mutate(
      //   data?.map((promo) => (promo.id === id ? { ...promo, ...updateData } : promo)),
      //   false,
      // );

      // Revalidate cache after successful update
      // Use returned data from API if available: mutate(data?.map(p => p.id === id ? updatedPromotionData : p), false);
      await mutate(); // Re-fetch
      message.success(
        `Promotion ${updatedPromotion.code} updated successfully`
      );
      return updatedPromotion;
    } catch (err) {
      console.error(`Failed to update promotion ${id}:`, err);
      message.error("Failed to update promotion.");
      // Optional: Revert optimistic update
      // mutate(data, false); // May need more sophisticated revert based on previous state
      return undefined;
    }
  };

  /**
   * @description Deletes a promotion via API and updates SWR cache.
   * @param {string} id - The ID of the promotion to delete.
   * @returns {Promise<void>}
   */
  const deletePromotion = async (id: string): Promise<void> => {
    try {
      // TODO: Replace with actual API call: await client.deletePromotion(id);
      console.warn(
        `usePromotions: Simulating deletePromotion for ${id}. Replace with client.deletePromotion()`
      );
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Optimistic update (optional)
      // mutate(data?.filter((promo) => promo.id !== id), false);

      // Revalidate cache after successful deletion
      await mutate(); // Re-fetch
      message.success("Promotion deleted successfully");
    } catch (err) {
      console.error(`Failed to delete promotion ${id}:`, err);
      message.error("Failed to delete promotion.");
      // Optional: Revert optimistic update
      // mutate(data, false); // Need previous state to revert correctly
    }
  };

  return {
    promotions: data,
    isLoading,
    error,
    mutatePromotions: mutate,
    addPromotion,
    updatePromotion,
    deletePromotion,
  };
};
