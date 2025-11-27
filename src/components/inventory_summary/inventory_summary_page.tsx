"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { InventorySummary } from "@/lib/types/inventory_summary";
import { InventoryItem } from "@/lib/types/inventory_item";
import { SchoolClass } from "@/lib/types/classes";
import { AcademicSession } from "@/lib/types/academic_session";
import { ClassTeacher } from "@/lib/types/class_teacher";

import { inventorySummaryApi } from "@/lib/inventory_summary";
import { inventoryItemApi } from "@/lib/inventory_item";
import { schoolClassApi } from "@/lib/classes";
import { academicSessionsApi } from "@/lib/academic_session";
import { classTeacherApi } from "@/lib/class_teacher";
import { InventoryTransaction } from "@/lib/types/inventory_transactions";
import { inventoryTransactionApi } from "@/lib/inventory_transactions";

import { SupplierTransaction } from "@/lib/types/supplier_transactions";
import { supplierTransactionsApi } from "@/lib/supplier_transaction";

import { InventorySummaryStats } from "@/components/inventory_summary/stats_card";
import { InventorySummaryTable } from "@/components/inventory_summary/table";
import { BulkInventoryLoader } from "@/components/inventory_summary/bulk_inventory_loader";
import { LowStockAlert } from "@/components/inventory_summary/low_stock_alert";
import LoadingSpinner from "@/components/ui/loading_spinner";
import { GlobalInventoryEnhancedReport } from "@/components/inventory_summary/global_summary";
import DistributionCollectionReport from "@/components/inventory_summary/inventory_distribution_report";

export default function InventorySummaryPage() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();

  // Check permissions for different actions
  const canCreate = canPerformAction("Inventory Summary", "create");
  const canUpdate = canPerformAction("Inventory Summary", "update");
  const canDelete = canPerformAction("Inventory Summary", "delete");

  const [summaries, setSummaries] = useState<InventorySummary[]>([]);
  const [allInventories, setAllInventories] = useState<InventorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBulkLoader, setShowBulkLoader] = useState(false);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [teachers, setTeachers] = useState<ClassTeacher[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);

      await Promise.all([
        fetchInventorySummaries(),
        fetchAllInventoryItems(),
        fetchDropdownData(),
      ]);
    } catch (err) {
      console.error("Error initializing page:", err);
      toast.error("Failed to load inventory summary data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInventorySummaries = async () => {
    try {
      const data = await inventorySummaryApi.getLowStock();
      setSummaries(data);
    } catch (err) {
      console.error("Error fetching inventory summaries:", err);
      setError("Failed to fetch inventory summaries");
    }
  };

  const fetchAllInventoryItems = async () => {
    try {
      const items = await inventoryItemApi.getAll();
      setInventoryItems(items);

      const converted: InventorySummary[] = items.map((item) => ({
        id: item.id,
        name: item.name,
        sku: item.sku,
        category_name: item.category_name,
        brand_name: item.brand_name,
        uom_name: item.uom_name,
        total_in_quantity: 0,
        total_out_quantity: 0,
        total_in_cost: 0,
        total_out_cost: 0,
        is_low_stock: false,
        last_transaction_date: null,
        last_purchase_date: null,
        last_sale_date: null,
        current_stock: item.current_stock ?? 0,
        low_stock_threshold: item.low_stock_threshold ?? 0,
      }));

      setAllInventories(converted);
    } catch (err) {
      console.error("Error fetching all inventory items:", err);
      toast.error("Failed to fetch all inventory items.");
    }
  };

  const fetchDropdownData = async () => {
    try {
      const [cls, ses, tch] = await Promise.all([
        schoolClassApi.getAll(),
        academicSessionsApi.getAll(),
        classTeacherApi.getAll(),
      ]);

      setClasses(cls);
      setSessions(ses);
      setTeachers(tch);
    } catch (err) {
      console.error("Error fetching dropdown data:", err);
      toast.error("Failed to load dropdown data.");
    }
  };

  const handleBulkLoad = (newSummaries: InventorySummary[]) => {
    // Check permission before bulk loading
    if (!canCreate) {
      toast.error("You don't have permission to bulk load inventories");
      return;
    }

    setSummaries((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const uniqueNew = newSummaries.filter((s) => !existingIds.has(s.id));
      return [...prev, ...uniqueNew];
    });
  };

  const handleOpenBulkLoader = () => {
    // Check permission before opening bulk loader
    if (!canCreate) {
      toast.error("You don't have permission to bulk load inventories");
      return;
    }
    setShowBulkLoader(true);
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchAllData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-4">
      <LowStockAlert />
      <div className="mb-6" />

      <GlobalInventoryEnhancedReport />


      <div className="my-8">
        <InventorySummaryTable
          summaries={summaries}
          canUpdate={canUpdate}
          canDelete={canDelete}
        />
      </div>

      {/* Only show Bulk Load button if user has create permission */}
      {canCreate && (
        <div className="mt-4 flex justify-start">
          <button
            onClick={handleOpenBulkLoader}
            className="px-4 py-2 text-sm font-sm bg-[#3D4C63] text-white rounded-sm hover:bg-[#2f3a4e] transition-colors"
          >
            Bulk Load Inventories
          </button>
        </div>
      )}

      {showBulkLoader && (
        <BulkInventoryLoader
          isOpen={showBulkLoader}
          onClose={() => setShowBulkLoader(false)}
          onLoad={handleBulkLoad}
        />
      )}
      <div className="mt-4">
        <DistributionCollectionReport
          inventoryItems={inventoryItems}
          classes={classes}
          sessions={sessions}
          teachers={teachers}
        />
      </div>
    </div>
  );
}