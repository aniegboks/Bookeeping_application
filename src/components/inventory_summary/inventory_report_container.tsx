// inventory_report_container.tsx
"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { inventoryItemApi } from "@/lib/inventory_item";
import { inventoryDistributionApi } from "@/lib/inventory_distrbution";
import { inventoryTransactionApi } from "@/lib/inventory_transactions";
import { schoolClassApi } from "@/lib/classes";
import { InventoryReportTable } from "./global_summary";

interface Supplier {
  name: string;
}

interface TransactionWithSupplier {
  item_id: string;
  transaction_type: string;
  qty_in: number;
  in_cost: number;
  amount_paid: number;
  suppliers?: Supplier | null;
}

interface Distribution {
  inventory_item_id: string;
  distributed_quantity: number;
  class_id?: string | null;
  receiver_name?: string | null;
}

interface DistributionResponse {
  data: Distribution[];
}

interface SchoolClass {
  id: string;
  name: string;
}

interface InventoryItem {
  id: string;
  name: string;
  category_name: string;
  brand_name: string;
  uom_name: string;
  current_stock: number;
  cost_price: number;
  selling_price: number;
  is_low_stock?: boolean;
}

export interface CombinedInventory {
  id: string;
  name: string;
  category: string;
  brand: string;
  uom: string;
  current_stock: number;
  total_purchases: number;
  total_distributed: number;
  total_cost: number;
  total_amount_paid: number;
  cost_price: number;
  selling_price: number;
  profit: number;
  margin: number;
  supplier_names: string;
  class_count: number;
  class_names: string;
  receiver_names: string;
  is_low_stock: boolean;
}

interface DistributionTotal {
  qty: number;
  classIds: Set<string>;
  receivers: Set<string>;
}

export function InventoryReportContainer() {
  const [data, setData] = useState<CombinedInventory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  async function fetchReportData() {
    try {
      setLoading(true);

      const [items, transactions, distributions, classes] = await Promise.all([
        inventoryItemApi.getAll(),
        inventoryTransactionApi.getAll(),
        inventoryDistributionApi.getAll(),
        schoolClassApi.getAll(),
      ]);

      const classMap = new Map<string, string>(
        (classes as SchoolClass[]).map((cls) => [cls.id, cls.name])
      );

      const transactionTotals: Record<string, number> = {};
      const transactionCosts: Record<string, number> = {};
      const transactionAmountPaid: Record<string, number> = {};
      const transactionSuppliers: Record<string, Set<string>> = {};
      const distributionTotals: Record<string, DistributionTotal> = {};

      for (const tx of transactions as TransactionWithSupplier[]) {
        if (tx.transaction_type === "purchase") {
          const invId = tx.item_id;
          if (!transactionTotals[invId]) transactionTotals[invId] = 0;
          if (!transactionCosts[invId]) transactionCosts[invId] = 0;
          if (!transactionAmountPaid[invId]) transactionAmountPaid[invId] = 0;
          if (!transactionSuppliers[invId]) transactionSuppliers[invId] = new Set();

          transactionTotals[invId] += tx.qty_in ?? 0;
          transactionCosts[invId] += tx.in_cost ?? 0;
          transactionAmountPaid[invId] += tx.amount_paid ?? 0;

          if (tx.suppliers?.name) {
            transactionSuppliers[invId].add(tx.suppliers.name);
          }
        }
      }

      const distributionsData = distributions as DistributionResponse;
      for (const dist of distributionsData.data) {
        const invId = dist.inventory_item_id;
        if (!distributionTotals[invId]) {
          distributionTotals[invId] = {
            qty: 0,
            classIds: new Set(),
            receivers: new Set(),
          };
        }

        distributionTotals[invId].qty += dist.distributed_quantity ?? 0;

        if (dist.class_id) distributionTotals[invId].classIds.add(dist.class_id);
        if (dist.receiver_name)
          distributionTotals[invId].receivers.add(dist.receiver_name);
      }

      const combined = (items as InventoryItem[]).map((item) => {
        const tIn = transactionTotals[item.id] ?? 0;
        const tCost = transactionCosts[item.id] ?? 0;
        const tAmountPaid = transactionAmountPaid[item.id] ?? 0;
        const suppliers = Array.from(transactionSuppliers[item.id] ?? []);
        const dOut = distributionTotals[item.id]?.qty ?? 0;
        const classIds = Array.from(distributionTotals[item.id]?.classIds ?? []);
        const classNames = classIds
          .map((id) => classMap.get(id))
          .filter((name): name is string => Boolean(name));
        const receivers = Array.from(distributionTotals[item.id]?.receivers ?? []);

        const costPrice = item.cost_price ?? 0;
        const sellingPrice = item.selling_price ?? 0;
        const profit = sellingPrice - costPrice;
        const margin = costPrice > 0 ? ((profit / sellingPrice) * 100) : 0;

        return {
          id: item.id,
          name: item.name,
          category: item.category_name,
          brand: item.brand_name,
          uom: item.uom_name,
          current_stock: item.current_stock ?? 0,
          total_purchases: tIn,
          total_distributed: dOut,
          total_cost: tCost,
          total_amount_paid: tAmountPaid,
          cost_price: costPrice,
          selling_price: sellingPrice,
          profit: profit,
          margin: margin,
          supplier_names: suppliers.length > 0 ? suppliers.join(", ") : "N/A",
          class_count: classNames.length,
          class_names:
            classNames.length > 0 ? classNames.join(", ") : "No Distribution",
          receiver_names: receivers.length > 0 ? receivers.join(", ") : "N/A",
          is_low_stock: item.is_low_stock ?? false,
        };
      });

      setData(combined);
    } catch (err) {
      console.error("Error fetching enhanced report:", err);
      toast.error("Failed to load enhanced inventory report");
    } finally {
      setLoading(false);
    }
  }

  return <InventoryReportTable data={data} loading={loading} />;
}