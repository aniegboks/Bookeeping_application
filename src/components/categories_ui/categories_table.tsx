"use client";

import { useState } from "react";
import { FolderOpen, PenSquare, Trash2 } from "lucide-react";
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
}

export default function CategoriesTable({
  categories,
  openEditModal,
  handleDelete,
  formatDate,
}: CategoriesTableProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const openDeleteModal = (cat: Category) => {
    setSelectedCategory(cat);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedCategory) {
      handleDelete(selectedCategory.id, selectedCategory.name);
    }
    setShowDeleteModal(false);
    setSelectedCategory(null);
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
          {categories.map((c) => (
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
                  onClick={() => openDeleteModal(c)}
                  className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <DeleteCategoriesModal
          selectedCategory={selectedCategory}
          setShowDeleteModal={setShowDeleteModal}
          confirmDelete={confirmDelete}
        />
      )}
    </div>
  );
}
