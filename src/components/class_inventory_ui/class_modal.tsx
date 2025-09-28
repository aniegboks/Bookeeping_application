// components/entitlements/EntitlementModal.tsx
"use client";

import { ClassInventoryEntitlement } from "@/lib/types/class_inventory";
import SmallLoader from "@/components/ui/small_loader";

interface EntitlementModalProps {
  show: boolean;
  onClose: () => void;
  formData: Partial<ClassInventoryEntitlement>;
  setFormData: (val: Partial<ClassInventoryEntitlement>) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  editingEntitlement?: ClassInventoryEntitlement | null;
}

export default function EntitlementModal({
  show,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isSubmitting,
  editingEntitlement,
}: EntitlementModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg text-[#171D26] font-semibold mb-4">
          {editingEntitlement ? "Edit Entitlement" : "Create New Entitlement"}
        </h3>

        <div className="space-y-4">
          {/* Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
            <input
              type="text"
              value={formData.class_id || ""}
              onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
            />
          </div>

          {/* Inventory Item */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Inventory Item *</label>
            <input
              type="text"
              value={formData.inventory_item_id || ""}
              onChange={(e) => setFormData({ ...formData, inventory_item_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
            />
          </div>

          {/* Session Term */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Term *</label>
            <input
              type="text"
              value={formData.session_term_id || ""}
              onChange={(e) => setFormData({ ...formData, session_term_id: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
            <input
              type="number"
              value={formData.quantity || 0}
              onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] flex items-center gap-2 ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting && <SmallLoader />}
              {editingEntitlement ? "Update" : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
