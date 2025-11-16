"use client";

import { Menu, CreateMenuPayload } from "@/lib/menu";
import SmallLoader from "../ui/small_loader";

interface MenuModalProps {
  editingMenu: Menu | null;
  formData: CreateMenuPayload;
  setFormData: (data: CreateMenuPayload) => void;
  handleSubmit: () => void;
  setShowModal: (show: boolean) => void;
  isSubmitting: boolean;
  resetForm: () => void;
}

export default function MenuModal({
  editingMenu,
  formData,
  setFormData,
  handleSubmit,
  setShowModal,
  isSubmitting,
  resetForm,
}: MenuModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-[#171D26] mb-4">
          {editingMenu ? "Edit Menu" : "Create New Menu"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Route *
            </label>
            <input
              type="text"
              value={formData.route}
              onChange={(e) => setFormData({ ...formData, route: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
              placeholder="e.g., Brand, Dashboard"
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.route.length}/100 characters
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caption *
            </label>
            <input
              type="text"
              value={formData.caption}
              onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
              placeholder="e.g., /brands, /dashboard"
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.caption.length}/100 characters
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.route.trim() || !formData.caption.trim()}
              className={`px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors flex items-center gap-2 ${
                isSubmitting || !formData.route.trim() || !formData.caption.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting && <SmallLoader />}
              {isSubmitting
                ? editingMenu
                  ? "Updating..."
                  : "Creating..."
                : editingMenu
                ? "Update"
                : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}