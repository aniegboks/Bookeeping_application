"use client";

import { useState } from "react";
import {
  FolderOpen,
  PenSquare,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Dock,
  Plus,
} from "lucide-react";
import DeleteCategoriesModal from "./delete_categories_modal";

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CategoriesTableProps {
  categories: Category[];
  openEditModal: (cat: Category) => void;
  handleDelete: (id: string, name: string) => void;
  formatDate: (date: string) => string;
  openCreateModal: () => void;
}

export default function CategoriesTable({
  categories,
  openEditModal,
  openCreateModal,
  handleDelete,
  formatDate,
}: CategoriesTableProps) {
  // Single state for modal + selected category
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(categories.length / itemsPerPage);

  const paginatedCategories = categories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const confirmDelete = () => {
    if (deleteTarget) {
      handleDelete(deleteTarget.id, deleteTarget.name);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="overflow-x-auto relative">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Last Updated
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {paginatedCategories.map((c) => (
            <tr key={c.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="p-2 rounded-full bg-purple-100 mr-3">
                    <FolderOpen className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="text-sm font-medium text-[#171D26]">{c.name}</div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(c.created_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatDate(c.updated_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                <button
                  onClick={() => openEditModal(c)}
                  className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50 transition-colors"
                >
                  <PenSquare className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id, c.name)}
                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <Dock className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No categories</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new category.
          </p>
          <div className="mt-6">
            <button
              onClick={openCreateModal}
              className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm flex items-center gap-2 mx-auto hover:bg-[#495C79] transition-colors"
            >
              <Plus size={16} /> Create Category
            </button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {categories.length > itemsPerPage && (
        <div className="flex justify-end items-center gap-2 px-6 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4 inline" />
          </button>
          <span className="px-3 py-1">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronRight className="w-4 h-4 inline" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <DeleteCategoriesModal
          selectedCategory={deleteTarget}
          setShowDeleteModal={(show) => {
            if (!show) setDeleteTarget(null);
          }}
          confirmDelete={confirmDelete}
        />
      )}
    </div>
  );
}
