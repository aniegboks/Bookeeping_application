"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Brand } from "@/lib/brands";
import { Category } from "@/lib/types/categories";
import { SubCategory } from "@/lib/types/sub_categories";
import { UOM } from "@/lib/types/uom";
import { InventoryItem } from "@/lib/types/inventory_item";
import { inventoryItemApi } from "@/lib/inventory_item";
import { referenceDataApi } from "@/lib/refrence_data_api";
import InventoryItemForm from "@/components/inventory_items_ui/inventory_item_form";
import InventoryItemList from "@/components/inventory_items_ui/inventory_item_list";
import StatsCards from "@/components/inventory_items_ui/stats_card";
import DeleteItemModal from "@/components/inventory_items_ui/delete_modal";
import Loader from "@/components/ui/loading_spinner";
import Container from "@/components/ui/container";
import Trends from "@/components/inventory_items_ui/trends";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export default function InventoryPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredInventoryItems, setFilteredInventoryItems] = useState<InventoryItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  /** Load reference data */
  const loadReferenceData = async () => {
    try {
      const [categoryData, brandData, subCategoryData, uomData] = await Promise.all([
        referenceDataApi.fetchCategories(),
        referenceDataApi.fetchBrands(),
        referenceDataApi.fetchSubCategories(),
        referenceDataApi.fetchUOMs(),
      ]);

      setCategories(categoryData);
      setBrands(brandData);
      setSubCategories(subCategoryData);
      setUOMs(uomData);

      if (categoryData.length === 0) toast.error("No categories found. Please add categories first.");
      if (brandData.length === 0) toast.error("No brands found. Please add brands first.");
      if (subCategoryData.length === 0) toast.error("No sub-categories found. Please add sub-categories first.");
      if (uomData.length === 0) toast.error("No units of measure found. Please add UOMs first.");
    } catch (err: unknown) {
      // Type-safe error handling
      if (err instanceof Error) {
        console.error("Failed to load reference data:", err);
        toast.error("Failed to load reference data: " + err.message);
      } else {
        console.error("Failed to load reference data:", err);
        toast.error("Failed to load reference data");
      }
    }
  };


  /** Load inventory items */
  const loadInventoryItems = async () => {
    try {
      const items = await inventoryItemApi.getAll();
      setInventoryItems(items);
      setFilteredInventoryItems(items);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to load inventory items:", error);
        toast.error("Failed to load inventory items: " + error.message);
      } else {
        console.error("Failed to load inventory items:", error);
        toast.error("Failed to load inventory items");
      }
    }
  };

  /** Load everything on mount */
  useEffect(() => {
    const loadAll = async () => {
      setInitialLoading(true);
      await loadReferenceData();
      await loadInventoryItems();
      setInitialLoading(false);
    };
    loadAll();
  }, []);

  /** Handle search input */
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    if (!query) {
      setFilteredInventoryItems(inventoryItems);
      return;
    }
    const filtered = inventoryItems.filter((item) =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredInventoryItems(filtered);
  };

  /** Success handler after create/update */
  const handleSuccess = async (isEdit: boolean) => {
    toast.success(isEdit ? "Inventory item updated successfully!" : "Inventory item created successfully!");
    setShowForm(false);
    setEditingItem(null);
    setRefreshKey((prev) => prev + 1);
    await loadInventoryItems();
  };

  /** Delete handler */
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    const loadingToast = toast.loading("Deleting item...");
    try {
      await inventoryItemApi.delete(itemToDelete.id);
      toast.dismiss(loadingToast);
      toast.success("Inventory item deleted successfully!");
      setShowDeleteModal(false);
      setItemToDelete(null);
      setRefreshKey((prev) => prev + 1);
      await loadInventoryItems();
    } catch (error: unknown) {
      toast.dismiss(loadingToast);

      if (error instanceof Error) {
        console.error("Failed to delete item:", error);
        toast.error("Failed to delete item: " + error.message);
      } else {
        console.error("Failed to delete item:", error);
        toast.error("Failed to delete item");
      }
    }
  };


  /** Edit */
  const handleEdit = (item: InventoryItem) => {
    if (canShowForm()) {
      setEditingItem(item);
      setShowForm(true);
    } else toast.error("Cannot edit item. Required reference data is missing.");
  };

  /** Delete request */
  const handleDeleteRequest = (item: InventoryItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  /** Add item */
  const handleAddItem = () => {
    if (canShowForm()) {
      setEditingItem(null);
      setShowForm(true);
    } else toast.error("Cannot add item. Ensure all reference data is available.");
  };

  /** Cancel form */
  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  /** Export as Spreadsheet — matches table columns */
  const handleExport = () => {
    if (filteredInventoryItems.length === 0) {
      toast.error("No items to export.");
      return;
    }

    // Map items exactly as shown in the table
    const dataToExport = filteredInventoryItems.map((item: InventoryItem) => {
      const sku = item.sku || "";
      const name = item.name || "";
      const sellingPrice = item.selling_price ?? 0;
      const costPrice = item.cost_price ?? 0;
      const estimatedProfit = sellingPrice - costPrice;

      // Calculate margin (as %)
      const margin =
        sellingPrice > 0 ? ((estimatedProfit / sellingPrice) * 100).toFixed(2) + "%" : "0.00%";

      // Format updated_at nicely
      const updatedAt = item.updated_at
        ? new Date(item.updated_at).toLocaleString("en-NG", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
        : "";

      return {
        SKU: sku,
        Name: name,
        "Selling Price": `₦${sellingPrice.toLocaleString()}`,
        "Cost Price": `₦${costPrice.toLocaleString()}`,
        "Estimated Profit": `₦${estimatedProfit.toLocaleString()}`,
        Margin: margin,
        "Updated At": updatedAt,
      };
    });


    // Create Excel file
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "InventoryItems");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const file = new Blob([excelBuffer], { type: "application/octet-stream" });

    saveAs(file, `inventory_items_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Spreadsheet exported successfully!");
  };



  /** Guard for showing form */
  const canShowForm = () =>
    categories.length && brands.length && subCategories.length && uoms.length;

  /** Loader */
  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="px-8 mt-2">
      <Container>
        {/* Stats */}
        <StatsCards items={inventoryItems} filteredItems={filteredInventoryItems} />

        {/* Form Section */}
        {showForm && canShowForm() ? (
          <InventoryItemForm
            item={editingItem || undefined}
            onSuccess={() => handleSuccess(!!editingItem)}
            onCancel={handleCancel}
            brands={brands}
            categories={categories}
            subCategories={subCategories}
            uoms={uoms}
          />
        ) : (
          <div className="bg-white w-full flex items-center justify-between rounded-md border border-gray-200 border-b-0">
            <h3 className="text-lg font-semibold m-8">Inventory Items</h3>
            <button
              className={`my-8 mr-8 px-4 py-2 text-white rounded ${canShowForm()
                ? "bg-[#3D4C63] hover:bg-[#495C79]"
                : "bg-gray-400 cursor-not-allowed"
                }`}
              onClick={handleAddItem}
              disabled={!canShowForm()}
            >
              + Add Item
            </button>
          </div>
        )}

        {/* Inventory List */}
        <InventoryItemList
          key={refreshKey}
          items={inventoryItems}
          filteredItems={filteredInventoryItems}
          searchTerm={searchTerm}
          onSearch={handleSearch}
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />
        {/* Export as Spreadsheet */}
        <div className="flex justify-start mt-4">
          <button
            onClick={handleExport}
            className="px-5 py-2 font-medium rounded bg-[#3D4C63] hover:bg-[#495C79] text-white transition rounded-sm"
          >
            <span className="flex gap-2">
              <Download className="w-5 h-5" />
              <span>Export</span>
            </span>
          </button>
        </div>
        {/* Trends */}
        <Trends items={inventoryItems} />



        {/* Delete Modal */}
        {showDeleteModal && itemToDelete && (
          <DeleteItemModal
            itemName={itemToDelete.name}
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowDeleteModal(false);
              setItemToDelete(null);
              toast("Delete canceled", { icon: "ℹ️" });
            }}
          />
        )}
      </Container>
    </div>
  );
}
