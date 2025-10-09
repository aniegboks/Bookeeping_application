"use client";

import { SubCategory, Category } from "@/lib/types/sub_categories";
import SmallLoading from "@/components/ui/small_loader";
import { Dispatch, SetStateAction } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  formData: { name: string; category_id: string };
  setFormData: Dispatch<SetStateAction<{ name: string; category_id: string }>>;
  editingItem: SubCategory | null;
  categories: Category[];
}

export default function SubCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
  formData,
  setFormData,
  editingItem,
  categories,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            {editingItem ? "Edit Sub-Category" : "Create Sub-Category"}
          </h2>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Name input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#171D26]"
                placeholder="Enter sub-category name"
              />
            </div>

            {/* Category select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Category *
              </label>
              <select
                value={formData.category_id || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category_id: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#171D26]"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="flex items-center">
                  <SmallLoading />
                  <p className="text-sm ml-2">
                    {editingItem ? "Updating" : "Saving"}
                  </p>
                </span>
              ) : editingItem ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
