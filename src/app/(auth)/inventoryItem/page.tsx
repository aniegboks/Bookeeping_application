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

export default function InventoryPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [uoms, setUOMs] = useState<UOM[]>([]);

  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const [initialLoading, setInitialLoading] = useState(true);

  /** Load all reference data from API using the secure proxy */
  const loadReferenceData = async () => {
    try {
      const [categoryData, brandData, subCategoryData, uomData] =
        await Promise.all([
          referenceDataApi.fetchCategories(),
          referenceDataApi.fetchBrands(),
          referenceDataApi.fetchSubCategories(),
          referenceDataApi.fetchUOMs(),
        ]);

      setCategories(categoryData);
      setBrands(brandData);
      setSubCategories(subCategoryData);
      setUOMs(uomData);

      // Only show warnings on initial load
      if (initialLoading) {
        if (categoryData.length === 0) {
          toast.error("No categories found. Please add categories first.");
        }
        if (brandData.length === 0) {
          toast.error("No brands found. Please add brands first.");
        }
        if (subCategoryData.length === 0) {
          toast.error("No sub-categories found. Please add sub-categories first.");
        }
        if (uomData.length === 0) {
          toast.error("No units of measure found. Please add UOMs first.");
        }
      }
    } catch (err: any) {
      console.error("Failed to load reference data:", err);
      toast.error("Failed to load reference data: " + err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  /** Initial load */
  useEffect(() => {
    loadReferenceData();
  }, []);

  /** Success handler (after form submit) */
  const handleSuccess = async (isEdit: boolean) => {
    // Show appropriate success message
    if (isEdit) {
      toast.success("Inventory item updated successfully!");
    } else {
      toast.success("Inventory item created successfully!");
    }

    setShowForm(false);
    setEditingItem(null);
    setRefreshKey((prev) => prev + 1);
    await loadReferenceData();
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
    } catch (error: any) {
      toast.dismiss(loadingToast);
      console.error("Failed to delete item:", error);
      toast.error("Failed to delete item: " + error.message);
    }
  };

  /** Handle opening edit form */
  const handleEdit = (item: InventoryItem) => {
    if (canShowForm()) {
      setEditingItem(item);
      setShowForm(true);
    } else {
      toast.error("Cannot edit item. Required reference data is missing.");
    }
  };

  /** Handle opening delete modal */
  const handleDeleteRequest = (item: InventoryItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  };

  /** Handle opening create form */
  const handleAddItem = () => {
    if (canShowForm()) {
      setEditingItem(null);
      setShowForm(true);
    } else {
      toast.error("Cannot add item. Please ensure all reference data (categories, brands, sub-categories, UOMs) are available.");
    }
  };

  /** Handle canceling form */
  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  /** Guard — only show form if all reference data exists */
  const canShowForm = () => {
    return (
      categories.length > 0 &&
      brands.length > 0 &&
      subCategories.length > 0 &&
      uoms.length > 0
    );
  };

  /** Loader during initial fetch */
  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="mx-6">
      <Container>
        <div className="mt-18 mb-6">
          <h1 className="text-2xl font-bold mb-6">Inventory Items</h1>
        </div>
        {/* Stats */}
        <StatsCards brands={brands} filteredBrands={brands} />

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
          <div className="bg-white w-full flex  items-center justify-between rounded-md border border-gray-200">
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
          onEdit={handleEdit}
          onDelete={handleDeleteRequest}
        />


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