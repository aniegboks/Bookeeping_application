"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "" });
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const openDeleteModal = (id: string, name: string) => {
        setSelectedCategory({ id, name } as Category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedCategory) return;
        try {
            await deleteCategory(selectedCategory.id);
            setCategories(categories.filter(c => c.id !== selectedCategory.id));
            toast.success(`${selectedCategory.name} deleted successfully`);
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally {
            setShowDeleteModal(false);
            setSelectedCategory(null);
        }
    };

    const filteredCategories = categories.filter(c =>
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

    useEffect(() => { loadCategories(); }, []);

    const handleCreate = async () => {
        if (!formData.name.trim()) return toast.error('Category name is required');
        try {
            setIsSubmitting(true);
            const newCategory = await createCategory(formData.name.trim());
            setCategories([...categories, newCategory]);
            setShowModal(false);
            resetForm();
            toast.success('Category created successfully!');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally { setIsSubmitting(false); }
    };

    const handleUpdate = async () => {
        if (!editingCategory || !formData.name.trim()) return toast.error('Category name is required');
        try {
            setIsSubmitting(true);
            const updatedCategory = await updateCategory(editingCategory.id, formData.name.trim());
            setCategories(categories.map(c => c.id === editingCategory.id ? updatedCategory : c));
            setShowModal(false);
            setEditingCategory(null);
            resetForm();
            toast.success('Category updated successfully!');
        } catch (error: unknown) {
            toast.error(getErrorMessage(error));
        } finally { setIsSubmitting(false); }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({ name: category.name });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingCategory(null);
        resetForm();
        setShowModal(true);
    };

    const exportCategoriesToExcel = () => {
        if (categories.length === 0) return toast.error("No categories to export");

        const worksheet = XLSX.utils.json_to_sheet(
            categories.map(c => ({
                ID: c.id,
                Name: c.name,
                "Created At": formatDate(c.created_at),
                "Updated At": formatDate(c.updated_at),
            }))
        );

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "categories.xlsx");

        toast.success("Categories exported successfully!");
    };

    const formatDate = (date: string) =>
        new Date(date).toLocaleString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

    if (loading) return <LoadingSpinner />;

    return (
        <div className="p-6 bg-[#F3F4F7] min-h-screen">
            <Container>
                {/* HEADER */}
                <div className="mb-8 mt-24">
                    <h1 className="text-3xl font-bold mb-2 text-[#171D26]">Categories Management</h1>
                    <p className="text-gray-600">Organize your inventory with product categories</p>
                </div>

                {/* STATS CARDS */}
                <StatsCards
                    total={categories.length}
                    addedToday={categories.filter(c => new Date(c.created_at).toDateString() === new Date().toDateString()).length}
                    searchResults={filteredCategories.length}
                    viewMode={viewMode}
                />

                {/* CONTROLS */}
                <div className="bg-white rounded-lg border border-gray-200">
                    <CategoriesControls
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                        onAdd={openCreateModal}
                    />

                    {/* GRID OR LIST */}
                    <div className="p-6">
                        {filteredCategories.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="mt-2 text-sm font-medium text-gray-900">{searchTerm ? 'No categories found' : 'No categories yet'}</p>
                                <button onClick={openCreateModal} className="mt-6 bg-[#3D4C63] text-white px-4 py-2 rounded-lg hover:bg-[#495C79] transition-colors">
                                    Add Your First Category
                                </button>
                            </div>
                        ) : viewMode === 'grid' ? (
                            <CategoriesGrid
                                categories={filteredCategories}
                                openEditModal={openEditModal}
                                openDeleteModal={openDeleteModal}
                                formatDate={formatDate}
                            />
                        ) : (
                            <CategoriesTable
                                categories={filteredCategories}
                                openEditModal={openEditModal}
                                handleDelete={openDeleteModal}
                                formatDate={formatDate}
                            />
                        )}
                    </div>
                </div>
            </Container>

            {/* CATEGORY MODAL */}
            <CategoryModal
                show={showModal}
                onClose={() => { setShowModal(false); setEditingCategory(null); resetForm(); }}
                formData={formData}
                setFormData={setFormData}
                onSubmit={editingCategory ? handleUpdate : handleCreate}
                isSubmitting={isSubmitting}
                editingCategory={editingCategory}
            />

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <DeleteCategoriesModal
                    selectedCategory={selectedCategory}
                    setShowDeleteModal={setShowDeleteModal}
                    confirmDelete={confirmDelete}
                />
            )}

            <Container>
                <div className="flex gap-2 mt-4">
                    <button
                        onClick={exportCategoriesToExcel}
                        className="flex items-center gap-2 bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        Export
                    </button>
                </div>
            </Container>
        </div>
    );
}
