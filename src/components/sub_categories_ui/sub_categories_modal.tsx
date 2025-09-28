"use client";

import { SubCategory, Category } from "@/lib/types/sub_categories";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  loading: boolean;
  formData: { name: string; category_id: string };
  setFormData: (data: { name: string; category_id: string }) => void;
  editingItem: SubCategory | null;
  categories: Category[];
}

export default function SubCategoryModal({ isOpen, onClose, onSubmit, loading, formData, setFormData, editingItem, categories }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">{editingItem ? "Edit Sub-Category" : "Create Sub-Category"}</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#171D26]"
                placeholder="Enter sub-category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parent Category *</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-[#171D26]"
              >
                <option value="">Select a category</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={onSubmit} disabled={loading} className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50">
              {loading ? "Saving..." : editingItem ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
