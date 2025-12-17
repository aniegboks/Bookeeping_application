// lib/utils/inventory_distribution_helper.ts

import { InventoryItem } from "@/lib/types/inventory_item";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { StudentInventoryCollection } from "@/lib/types/student_inventory_collection";

/**
 * Get items distributed to a specific class in a specific session
 */
export function getDistributedItemsForClassSession(
  distributions: InventoryDistribution[],
  classId: string,
  sessionTermId: string
): InventoryDistribution[] {
  return distributions.filter(
    (d) => d.class_id === classId && d.session_term_id === sessionTermId
  );
}

/**
 * Calculate total quantity already assigned to students for a specific item/class/session
 */
export function getAssignedQuantity(
  collections: StudentInventoryCollection[],
  inventoryItemId: string,
  classId: string,
  sessionTermId: string,
  excludeCollectionId?: string
): number {
  return collections
    .filter(
      (c) =>
        c.inventory_item_id === inventoryItemId &&
        c.class_id === classId &&
        c.session_term_id === sessionTermId &&
        c.id !== excludeCollectionId // Exclude current record when editing
    )
    .reduce((total, c) => total + c.qty, 0);
}

/**
 * Get total distributed quantity for a specific item in a class/session
 */
export function getTotalDistributedQuantity(
  distributions: InventoryDistribution[],
  inventoryItemId: string,
  classId: string,
  sessionTermId: string
): number {
  const relevantDistributions = distributions.filter(
    (d) =>
      d.inventory_item_id === inventoryItemId &&
      d.class_id === classId &&
      d.session_term_id === sessionTermId
  );

  return relevantDistributions.reduce(
    (total, dist) => total + dist.distributed_quantity,
    0
  );
}

/**
 * Get available (remaining) quantity after accounting for assignments
 * This is the key function that calculates: Distributed - Already Assigned = Available
 */
export function getAvailableQuantityForDistribution(
  distributions: InventoryDistribution[],
  collections: StudentInventoryCollection[],
  inventoryItemId: string,
  classId: string,
  sessionTermId: string,
  excludeCollectionId?: string
): number {
  const totalDistributed = getTotalDistributedQuantity(
    distributions,
    inventoryItemId,
    classId,
    sessionTermId
  );

  const totalAssigned = getAssignedQuantity(
    collections,
    inventoryItemId,
    classId,
    sessionTermId,
    excludeCollectionId
  );

  const available = totalDistributed - totalAssigned;

  // Return 0 if negative (over-allocated)
  return Math.max(0, available);
}

/**
 * Get stock status with detailed breakdown
 */
export function getStockStatus(
  distributions: InventoryDistribution[],
  collections: StudentInventoryCollection[],
  inventoryItemId: string,
  classId: string,
  sessionTermId: string,
  excludeCollectionId?: string
): {
  totalDistributed: number;
  totalAssigned: number;
  available: number;
  isAvailable: boolean;
} {
  const totalDistributed = getTotalDistributedQuantity(
    distributions,
    inventoryItemId,
    classId,
    sessionTermId
  );

  const totalAssigned = getAssignedQuantity(
    collections,
    inventoryItemId,
    classId,
    sessionTermId,
    excludeCollectionId
  );

  const available = totalDistributed - totalAssigned;

  return {
    totalDistributed,
    totalAssigned,
    available,
    isAvailable: available > 0,
  };
}

/**
 * Get filtered inventory items with availability info
 */
export function getFilteredInventoryItems(
  inventoryItems: InventoryItem[],
  distributions: InventoryDistribution[],
  collections: StudentInventoryCollection[],
  classId: string,
  sessionTermId: string,
  excludeCollectionId?: string
): Array<InventoryItem & { 
  totalDistributed: number;
  totalAssigned: number;
  available: number;
}> {
  if (!classId || !sessionTermId) {
    return [];
  }

  const distributedItemIds = new Set(
    distributions
      .filter((d) => d.class_id === classId && d.session_term_id === sessionTermId)
      .map((d) => d.inventory_item_id)
  );

  return inventoryItems
    .filter((item) => distributedItemIds.has(item.id))
    .map((item) => {
      const stockStatus = getStockStatus(
        distributions,
        collections,
        item.id,
        classId,
        sessionTermId,
        excludeCollectionId
      );

      return {
        ...item,
        totalDistributed: stockStatus.totalDistributed,
        totalAssigned: stockStatus.totalAssigned,
        available: stockStatus.available,
      };
    })
    .filter((item) => item.available > 0); // Only show items with available stock
}

/**
 * Format item display with availability
 */
export function formatDistributedItemDisplay(
  item: InventoryItem & { 
    totalDistributed?: number;
    totalAssigned?: number;
    available?: number;
  }
): string {
  const available = item.available ?? 0;
  const distributed = item.totalDistributed ?? 0;
  const assigned = item.totalAssigned ?? 0;

  return `${item.name} (${available} available of ${distributed} distributed, ${assigned} assigned)`;
}

/**
 * Check if requested quantity is available
 */
export function hasSufficientStock(
  distributions: InventoryDistribution[],
  collections: StudentInventoryCollection[],
  inventoryItemId: string,
  classId: string,
  sessionTermId: string,
  requestedQuantity: number,
  excludeCollectionId?: string
): boolean {
  const available = getAvailableQuantityForDistribution(
    distributions,
    collections,
    inventoryItemId,
    classId,
    sessionTermId,
    excludeCollectionId
  );

  return available >= requestedQuantity;
}

/**
 * Validate if a single assignment is possible
 */
export function canAssignQuantity(
  distributions: InventoryDistribution[],
  collections: StudentInventoryCollection[],
  inventoryItemId: string,
  classId: string,
  sessionTermId: string,
  requestedQuantity: number,
  excludeCollectionId?: string
): { canAssign: boolean; available: number; requested: number } {
  const available = getAvailableQuantityForDistribution(
    distributions,
    collections,
    inventoryItemId,
    classId,
    sessionTermId,
    excludeCollectionId
  );

  return {
    canAssign: available >= requestedQuantity,
    available,
    requested: requestedQuantity,
  };
}

/**
 * Get distribution summary for a class/session with assignment info
 */
export function getDistributionSummary(
  distributions: InventoryDistribution[],
  collections: StudentInventoryCollection[],
  classId: string,
  sessionTermId: string
): {
  totalItems: number;
  totalDistributed: number;
  totalAssigned: number;
  totalAvailable: number;
  itemBreakdown: Array<{ 
    itemId: string; 
    distributed: number;
    assigned: number;
    available: number;
  }>;
} {
  const relevantDistributions = distributions.filter(
    (d) => d.class_id === classId && d.session_term_id === sessionTermId
  );

  const itemQuantities = new Map<string, { distributed: number; assigned: number }>();

  // Calculate distributed quantities
  relevantDistributions.forEach((dist) => {
    const current = itemQuantities.get(dist.inventory_item_id) || { distributed: 0, assigned: 0 };
    itemQuantities.set(dist.inventory_item_id, {
      ...current,
      distributed: current.distributed + dist.distributed_quantity,
    });
  });

  // Calculate assigned quantities
  collections
    .filter((c) => c.class_id === classId && c.session_term_id === sessionTermId)
    .forEach((c) => {
      const current = itemQuantities.get(c.inventory_item_id) || { distributed: 0, assigned: 0 };
      itemQuantities.set(c.inventory_item_id, {
        ...current,
        assigned: current.assigned + c.qty,
      });
    });

  let totalDistributed = 0;
  let totalAssigned = 0;

  const itemBreakdown = Array.from(itemQuantities.entries()).map(([itemId, quantities]) => {
    totalDistributed += quantities.distributed;
    totalAssigned += quantities.assigned;

    return {
      itemId,
      distributed: quantities.distributed,
      assigned: quantities.assigned,
      available: quantities.distributed - quantities.assigned,
    };
  });

  return {
    totalItems: itemQuantities.size,
    totalDistributed,
    totalAssigned,
    totalAvailable: totalDistributed - totalAssigned,
    itemBreakdown,
  };
}