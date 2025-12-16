// lib/utils/inventory-helpers.ts

import { InventoryItem } from "@/lib/types/inventory_item";

/**
 * Safely get the available quantity from an inventory item
 * Returns 0 if the item is undefined or quantity_available is null/undefined
 */
export function getAvailableQuantity(item: InventoryItem | undefined): number {
  if (!item) return 0;
  return item.current_stock ?? 0;
}

/**
 * Check if an inventory item has sufficient stock for a requested quantity
 */
export function hasSufficientStock(
  item: InventoryItem | undefined,
  requestedQty: number
): boolean {
  const available = getAvailableQuantity(item);
  return available >= requestedQty;
}

/**
 * Get stock status information for an inventory item
 */
export function getStockStatus(item: InventoryItem | undefined): {
  available: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
  status: "out_of_stock" | "low_stock" | "in_stock";
} {
  const available = getAvailableQuantity(item);
  const reorderLevel = item?.current_stock ?? 10;
  
  const isOutOfStock = available <= 0;
  const isLowStock = !isOutOfStock && available <= reorderLevel;
  
  let status: "out_of_stock" | "low_stock" | "in_stock";
  if (isOutOfStock) {
    status = "out_of_stock";
  } else if (isLowStock) {
    status = "low_stock";
  } else {
    status = "in_stock";
  }
  
  return {
    available,
    isOutOfStock,
    isLowStock,
    status,
  };
}

/**
 * Format inventory item display with stock info
 */
export function formatInventoryItemDisplay(item: InventoryItem): string {
  const available = getAvailableQuantity(item);
  return `${item.name} (${available} available)`;
}

/**
 * Validate bulk inventory allocation
 * Returns an object with validation results for each item
 */
export function validateBulkInventoryAllocation(
  allocations: Array<{ inventory_item_id: string; qty: number; count: number }>,
  inventoryItems: InventoryItem[]
): Record<string, {
  itemId: string;
  itemName: string;
  needed: number;
  available: number;
  isValid: boolean;
  deficit: number;
}> {
  type InventoryAllocationValidation = {
  itemId: string;
  itemName: string;
  needed: number;
  available: number;
  isValid: boolean;
  deficit: number;
};
  const validation: Record<string, InventoryAllocationValidation> = {};
  
  allocations.forEach(({ inventory_item_id, qty, count }) => {
    const item = inventoryItems.find(i => i.id === inventory_item_id);
    const available = getAvailableQuantity(item);
    const needed = qty * count;
    const isValid = needed <= available;
    
    validation[inventory_item_id] = {
      itemId: inventory_item_id,
      itemName: item?.name || "Unknown Item",
      needed,
      available,
      isValid,
      deficit: isValid ? 0 : needed - available,
    };
  });
  
  return validation;
}

/**
 * Get display color for stock status
 */
export function getStockStatusColor(status: "out_of_stock" | "low_stock" | "in_stock"): {
  text: string;
  bg: string;
  border: string;
} {
  switch (status) {
    case "out_of_stock":
      return {
        text: "text-red-800",
        bg: "bg-red-50",
        border: "border-red-200",
      };
    case "low_stock":
      return {
        text: "text-orange-800",
        bg: "bg-orange-50",
        border: "border-orange-200",
      };
    case "in_stock":
      return {
        text: "text-green-800",
        bg: "bg-green-50",
        border: "border-green-200",
      };
  }
}

/**
 * Calculate total allocated quantity for an item across all collections
 */
export function calculateTotalAllocated(
  itemId: string,
  allocations: Array<{ inventory_item_id: string; qty: number }>
): number {
  return allocations
    .filter(a => a.inventory_item_id === itemId)
    .reduce((sum, a) => sum + a.qty, 0);
}