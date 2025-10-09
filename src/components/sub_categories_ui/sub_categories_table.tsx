"use client";

import { useState } from "react";
import { Dock, FolderOpen, PenSquare, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { SubCategory, Category } from "@/lib/types/sub_categories";
import DeleteSubCategoryModal from "./sub_categories_delete";

interface TableProps {
  subCategories: SubCategory[];
  categories: Category[];
  loading: boolean;
  onEdit: (item: SubCategory) => void;
  onDelete: (id: string) => Promise<void>;
  onAdd: () => void;
}

export default function SubCategoriesTable({
  subCategories,
  categories,
  onEdit,
  onDelete,
  onAdd,
}: TableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(subCategories.length / itemsPerPage);

  const paginatedSubCategories = subCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Unknown Category";
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await onDelete(deleteId);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto bg-white rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parent Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {subCategories.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="text-center py-12">
                    <Dock className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No categories
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Get started by creating a new category.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={onAdd}
                        className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm flex items-center gap-2 mx-auto hover:bg-[#495C79] transition-colors"
                      >
                        <Plus size={16} /> Create Category
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedSubCategories.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 flex items-center">
                    <div className="p-2 rounded-full bg-purple-100 mr-3">
                      <FolderOpen className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="text-sm">{item.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getCategoryName(item.category_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(item)}
                      className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50 transition-colors"
                    >
                      <PenSquare className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {subCategories.length > itemsPerPage && (
        <div className="flex justify-end items-center gap-2 px-6 py-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
          >
            <ChevronLeft className="w-4 h-4 inline" />
          </button>
          <span className="px-3 py-1 text-sm">
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

      {/* Delete Modal */}
      {deleteId && (
        <DeleteSubCategoryModal
          selectedSubCategory={subCategories.find((item) => item.id === deleteId) ?? null}
          setShowDeleteModal={setDeleteId}
          deleting={deleting}
          confirmDelete={confirmDelete}
        />
      )}
    </div>
  );
}
