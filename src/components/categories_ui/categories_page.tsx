"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import StatsCards from "@/components/categories_ui/stats_cart";
import CategoriesControls from "@/components/categories_ui/categories_controls";
import CategoriesGrid from "@/components/categories_ui/categories_grid";
import CategoriesTable from "@/components/categories_ui/categories_table";
import CategoryModal from "@/components/categories_ui/categories_modal";
import DeleteCategoriesModal from "@/components/categories_ui/delete_categories_modal";
import { fetchCategories, createCategory, updateCategory, deleteCategory } from "@/lib/types/categories";
import Container from "@/components/ui/container";
import LoadingSpinner from "@/components/ui/loading_spinner";
import { Download } from "lucide-react";
import Trends from "@/components/categories_ui/trends";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

// Helper to extract error messages
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

export default function CategoriesManagement() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
  const canCreate = canPerformAction("Categories", "create");
  const canUpdate = canPerformAction("Categories", "update");
  const canDelete = canPerformAction("Categories", "delete");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const openDeleteModal = (id: string, name: string) => {
    // Check permission before opening modal
    if (!canDelete) {
      toast.error("You don't have permission to delete categories");
      return;
    }
    setDeleteTarget({ id, name } as Category);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("You don't have permission to delete categories");
      return;
    }

    try {
      await deleteCategory(deleteTarget.id);
      setCategories(categories.filter((c) => c.id !== deleteTarget.id));
      toast.success(`${deleteTarget.name} deleted successfully`);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => setFormData({ name: "" });

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) return toast.error("Category name is required");
    
    // Double-check permission before creating
    if (!canCreate) {
      toast.error("You don't have permission to create categories");
      return;
    }

    try {
      setIsSubmitting(true);
      const newCategory = await createCategory(formData.name.trim());
      setCategories([...categories, newCategory]);
      setShowModal(false);
      resetForm();
      toast.success("Category created successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !formData.name.trim())
      return toast.error("Category name is required");
    
    // Double-check permission before updating
    if (!canUpdate) {
      toast.error("You don't have permission to update categories");
      return;
    }

    try {
      setIsSubmitting(true);
      const updatedCategory = await updateCategory(
        editingCategory.id,
        formData.name.trim()
      );
      setCategories(
        categories.map((c) =>
          c.id === editingCategory.id ? updatedCategory : c
        )
      );
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      toast.success("Category updated successfully!");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (category: Category) => {
    // Check permission before opening modal
    if (!canUpdate) {
      toast.error("You don't have permission to update categories");
      return;
    }
    setEditingCategory(category);
    setFormData({ name: category.name });
    setShowModal(true);
  };

  const openCreateModal = () => {
    // Check permission before opening modal
    if (!canCreate) {
      toast.error("You don't have permission to create categories");
      return;
    }
    setEditingCategory(null);
    resetForm();
    setShowModal(true);
  };

  const exportCategoriesToExcel = () => {
    if (categories.length === 0)
      return toast.error("No categories to export");

    const worksheet = XLSX.utils.json_to_sheet(
      categories.map((c) => ({
        ID: c.id,
        Name: c.name,
        "Created At": formatDate(c.created_at),
        "Updated At": formatDate(c.updated_at),
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const data = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(data, "categories.xlsx");

    toast.success("Categories exported successfully!");
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="px-6 py-6">
      <Container>
        {/* STATS CARDS */}
        <StatsCards
          total={categories.length}
          addedToday={
            categories.filter(
              (c) =>
                new Date(c.created_at).toDateString() ===
                new Date().toDateString()
            ).length
          }
          searchResults={filteredCategories.length}
          viewMode={viewMode}
        />

        {/* CONTROLS */}
        <div className="bg-white rounded-sm border border-gray-200">
          <CategoriesControls
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onAdd={openCreateModal}
            canCreate={canCreate}
          />

          {/* GRID OR LIST */}
          <div className="p-6">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12">
                <p className="mt-2 text-sm font-medium text-gray-900">
                  {searchTerm
                    ? "No categories found"
                    : "No categories yet"}
                </p>
                {canCreate && (
                  <button
                    onClick={openCreateModal}
                    className="mt-6 bg-[#3D4C63] text-white px-4 py-2 rounded-lg hover:bg-[#495C79] transition-colors"
                  >
                    Add Your First Category
                  </button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              <CategoriesGrid
                categories={filteredCategories}
                openEditModal={openEditModal}
                openDeleteModal={openDeleteModal}
                formatDate={formatDate}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            ) : (
              <CategoriesTable
                categories={filteredCategories}
                openEditModal={openEditModal}
                handleDelete={openDeleteModal}
                formatDate={formatDate}
                openCreateModal={openCreateModal}
                canCreate={canCreate}
                canUpdate={canUpdate}
                canDelete={canDelete}
              />
            )}
          </div>
        </div>
        <Container>
          <div className="flex gap-2 mt-4">
            <button
              onClick={exportCategoriesToExcel}
              className="flex text-sm items-center gap-2 bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </Container>
      </Container>

      {/* CATEGORY MODAL */}
      <CategoryModal
        show={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCategory(null);
          resetForm();
        }}
        formData={formData}
        setFormData={setFormData}
        onSubmit={editingCategory ? handleUpdate : handleCreate}
        isSubmitting={isSubmitting}
        editingCategory={editingCategory}
      />

      {/* DELETE MODAL */}
      {deleteTarget && (
        <DeleteCategoriesModal
          selectedCategory={deleteTarget}
          setShowDeleteModal={() => setDeleteTarget(null)}
          confirmDelete={confirmDelete}
        />
      )}
    </div>
  );
}