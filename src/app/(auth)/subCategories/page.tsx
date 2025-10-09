"use client";

import React, { useState, useEffect } from "react";
import { FolderOpen, Download } from "lucide-react";
import { SubCategory, Category } from "@/lib/types/sub_categories";
import StatsCards from "@/components/sub_categories_ui/stats_card";
import Controls from "@/components/sub_categories_ui/controls";
import SubCategoriesTable from "@/components/sub_categories_ui/sub_categories_table";
import SubCategoryModal from "@/components/sub_categories_ui/sub_categories_modal";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import Trends from "@/components/sub_categories_ui/trends";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

export default function SubCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SubCategory | null>(null);
  const [formData, setFormData] = useState({ name: "", category_id: "" });

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const loadCategories = async () => {
    const res = await fetch("/api/categories");
    if (!res.ok) throw new Error("Failed to load categories");
    setCategories(await res.json());
  };

  const loadSubCategories = async () => {
    const res = await fetch("/api/sub_categories");
    if (!res.ok) throw new Error("Failed to load sub-categories");
    setSubCategories(await res.json());
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([loadCategories(), loadSubCategories()]);
      } catch (err: unknown) {
        if (err instanceof Error) {
          toast.error(err.message);
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setInitialLoading(false);
      }
    };
    loadData();
  }, []);

  /** Create or update */
  const handleSubmit = async () => {
    if (!formData.name || !formData.category_id) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true); // Keep loader for *modal submission*
    try {
      if (editingItem) {
        const res = await fetch(`/api/sub_categories/${editingItem.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to update sub-category");

        const updatedItem: SubCategory = await res.json();

        setSubCategories(prev =>
          prev.map(item => item.id === updatedItem.id ? updatedItem : item)
        );

        toast.success("Sub-category updated successfully!");
      } else {
        const res = await fetch("/api/sub_categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!res.ok) throw new Error("Failed to create sub-category");

        const newItem: SubCategory = await res.json();

        setSubCategories(prev => [...prev, newItem]);
        toast.success("Sub-category created successfully!");
      }

      // Reset form
      setFormData({ name: "", category_id: "" });
      setEditingItem(null);
      setIsModalOpen(false);

    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  /** Edit handler */
  const handleEdit = (item: SubCategory) => {
    setEditingItem(item);
    setFormData({ name: item.name, category_id: item.category_id });
    setIsModalOpen(true);
  };

  /** Delete handler */
  /** Delete handler */
  const handleDelete = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/sub_categories/${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete sub-category");
      }

      // Remove from state immediately
      setSubCategories(prev => prev.filter(item => item.id !== id));

      // Show success message
      toast.success("Sub-category deleted successfully!");

    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  /** Filtering */
  const filteredSubCategories = subCategories.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      !filterCategory || item.category_id === filterCategory;
    return matchesSearch && matchesFilter;
  });

  /** Export (unchanged) */
  const exportSubCategoriesToExcel = () => {
    if (subCategories.length === 0)
      return toast.error("No sub-categories to export");

    const worksheet = XLSX.utils.json_to_sheet(
      subCategories.map((item) => ({
        ID: item.id,
        Name: item.name,
        Category:
          categories.find((c) => c.id === item.category_id)?.name || "Unknown",
        "Created At": new Date(item.created_at).toLocaleString(),
        "Updated At": new Date(item.updated_at).toLocaleString(),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SubCategories");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "sub_categories.xlsx");
    toast.success("Exported successfully!");
  };

  /** Full-page loader (initial load) */
  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-6">
      <Container>
        <div className="bg mt-6">
          <StatsCards
            total={categories.length}
            addedToday={subCategories.length}
            searchResults={filteredSubCategories.length}
            viewMode={viewMode}
          />

          <Trends
            subCategories={subCategories}
          />

          <div className="bg-white rounded-lgborder border border-gray-200">
            <Controls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterCategory={filterCategory}
              onFilterChange={setFilterCategory}
              categories={categories}
              onAdd={() => {
                setEditingItem(null);
                setFormData({ name: "", category_id: "" });
                setIsModalOpen(true);
              }}
              viewMode={viewMode}
              setViewMode={setViewMode}
            />

            {viewMode === "list" ? (
              <SubCategoriesTable
                subCategories={filteredSubCategories}
                categories={categories}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={() => {
                  setEditingItem(null);
                  setFormData({ name: "", category_id: "" });
                  setIsModalOpen(true);
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-4 pb-6">
                {filteredSubCategories.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center mb-2">
                      <div className="p-2 rounded-full bg-purple-100 mr-3">
                        <FolderOpen className="h-4 w-4 text-purple-600" />
                      </div>
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {categories.find((c) => c.id === item.category_id)?.name ||
                        "Unknown Category"}
                    </div>
                    <div className="text-xs text-gray-400">
                      Created: {new Date(item.created_at).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-gray-400">
                      Updated: {new Date(item.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <SubCategoryModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleSubmit}
            loading={loading}
            formData={formData}
            setFormData={setFormData}
            editingItem={editingItem}
            categories={categories}
          />
        </div>
      </Container>

      <Container>
        <div className="flex gap-2 mt-4">
          <button
            onClick={exportSubCategoriesToExcel}
            className="flex items-center gap-2 bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm hover:bg-[#495C79] transition-colors btn-color"
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </Container>
      </div>
    </div>
  );
}