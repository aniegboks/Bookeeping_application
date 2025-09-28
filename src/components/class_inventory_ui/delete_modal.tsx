// components/entitlements/DeleteEntitlementModal.tsx
"use client";

import { ClassInventoryEntitlement } from "@/lib/types/class_inventory";

interface DeleteEntitlementModalProps {
  selectedEntitlement: ClassInventoryEntitlement;
  setShowDeleteModal: (show: boolean) => void;
  confirmDelete: () => void;
}

export default function DeleteEntitlementModal({
  selectedEntitlement,
  setShowDeleteModal,
  confirmDelete,
}: DeleteEntitlementModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Delete Entitlement</h3>
        <p className="text-sm text-gray-600 mb-6">
          Are you sure you want to delete entitlement <strong>{selectedEntitlement.id}</strong>?
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(false)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
