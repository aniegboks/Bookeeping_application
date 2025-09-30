"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Brand } from "@/lib/brands";
import { Category } from "@/lib/types/categories";
import { SubCategory } from "@/lib/types/sub_categories";
import { UOM } from "@/lib/types/uom";
import { InventoryItem } from "@/lib/types/inventory_item";
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

  /** Fetch functions */
  const fetchCategories = async () => {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json() as Promise<Category[]>;
  };

  const fetchBrands = async () => {
    const res = await fetch("/api/brands");
    if (!res.ok) throw new Error("Failed to fetch brands");
    return res.json() as Promise<Brand[]>;
  };

  const fetchSubCategories = async () => {
    const res = await fetch("/api/sub_categories");
    if (!res.ok) throw new Error("Failed to fetch sub-categories");
    return res.json() as Promise<SubCategory[]>;
  };

  const fetchUOMs = async () => {
    const res = await fetch("/api/uoms");
    if (!res.ok) throw new Error("Failed to fetch UOMs");
    return res.json() as Promise<UOM[]>;
  };

  /** Load all reference data from API */
  const loadReferenceData = async () => {
    try {
      const [categoryData, brandData, subCategoryData, uomData] =
        await Promise.all([
          fetchCategories(),
          fetchBrands(),
          fetchSubCategories(),
          fetchUOMs(),
        ]);

      setCategories(categoryData);
      setBrands(brandData);
      setSubCategories(subCategoryData);
      setUOMs(uomData);

      if (categoryData.length === 0)
        toast.error("No categories found. Please add categories first.");
      if (brandData.length === 0)
        toast.error("No brands found. Please add brands first.");
      if (subCategoryData.length === 0)
        toast.error("No sub-categories found. Please add sub-categories first.");
      if (uomData.length === 0)
        toast.error("No units of measure found. Please add UOMs first.");
    } catch (err: any) {
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
  const handleSuccess = async () => {
    setShowForm(false);
    setEditingItem(null);
    setRefreshKey((prev) => prev + 1);
    await loadReferenceData(); // refresh dropdowns
  };

  /** Delete handler */
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/inventory_items/${itemToDelete.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");

      toast.success("Item deleted successfully");
      setShowDeleteModal(false);
      setItemToDelete(null);
      setRefreshKey((prev) => prev + 1);
      await loadReferenceData();
    } catch (error: any) {
      toast.error("Failed to delete item: " + error.message);
    }
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
    <Container>
      <h1 className="text-2xl font-bold mb-6">Inventory Items</h1>

      {/* Stats */}
      <StatsCards brands={brands} filteredBrands={brands} />

      {/* Form Section */}
      {showForm && canShowForm() ? (
        <div className="mb-6 border p-4 rounded bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">
            {editingItem ? "Edit Item" : "Add New Item"}
          </h2>
          <InventoryItemForm
            item={editingItem || undefined}
            onSuccess={handleSuccess}
            onCancel={() => setShowForm(false)}
            brands={brands}
            categories={categories}
            subCategories={subCategories}
            uoms={uoms}
          />
          <button
            className="mt-4 px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
            onClick={() => {
              setShowForm(false);
              setEditingItem(null);
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          className={`mb-6 px-4 py-2 text-white rounded ${
            canShowForm()
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
          onClick={() => canShowForm() && setShowForm(true)}
          disabled={!canShowForm()}
        >
          + Add Item
        </button>
      )}

      {/* Inventory List */}
      <InventoryItemList
        key={refreshKey}
        onEdit={(item) => {
          if (canShowForm()) {
            setEditingItem(item);
            setShowForm(true);
          } else {
            toast.error("Required reference data is missing.");
          }
        }}
        onDelete={(item) => {
          setItemToDelete(item);
          setShowDeleteModal(true);
        }}
      />

      {/* Delete Modal */}
      {showDeleteModal && itemToDelete && (
        <DeleteItemModal
          itemName={itemToDelete.name}
          onConfirm={confirmDelete}
          onCancel={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
        />
      )}
    </Container>
  );
}
