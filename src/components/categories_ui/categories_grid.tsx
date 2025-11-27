// components/categories_ui/categories_grid.tsx
"use client";

import { FolderOpen, PenSquare, Trash2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface CategoriesGridProps {
  categories: Category[];
  openEditModal: (cat: Category) => void;
  openDeleteModal: (id: string, name: string) => void;
  formatDate: (date: string) => string;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function CategoriesGrid({
  categories,
  openEditModal,
  openDeleteModal,
  formatDate,
  canUpdate = true,
  canDelete = true,
}: CategoriesGridProps) {
  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {categories.map((category) => (
        <div
          key={category.id}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="p-2 rounded-full bg-purple-100">
              <FolderOpen className="h-5 w-5 text-purple-600" />
            </div>
            {/* Only show action buttons if user has any permissions */}
            {hasAnyActionPermission && (
              <div className="flex gap-1">
                {/* Only show Edit button if user can update */}
                {canUpdate && (
                  <button
                    onClick={() => openEditModal(category)}
                    className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50 transition-colors"
                    title="Edit category"
                  >
                    <PenSquare className="h-4 w-4" />
                  </button>
                )}
                {/* Only show Delete button if user can delete */}
                {canDelete && (
                  <button
                    onClick={() => openDeleteModal(category.id, category.name)}
                    className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <h3 className="text-lg font-semibold text-[#171D26] mb-2 truncate">
            {category.name}
          </h3>

          <div className="text-xs text-gray-500 space-y-1">
            <p>Created: {formatDate(category.created_at)}</p>
            <p>Updated: {formatDate(category.updated_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}