// src/components/class_inventory_entitlement_ui/form.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ClassInventoryEntitlement,
  CreateClassInventoryEntitlementInput,
} from "@/lib/types/class_inventory_entitlement";

// --- Interface Definitions (Matching the data passed from the parent) ---

interface ClassOption {
  id: string;
  name: string;
}

interface InventoryItemOption {
  id: string;
  name: string;
}

interface SessionTermOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface EntitlementFormProps {
  entitlement?: ClassInventoryEntitlement;
  onSubmit: (data: CreateClassInventoryEntitlementInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  
  // 💡 NEW PROPS: Receive pre-loaded data from the parent
  classes: ClassOption[];
  inventoryItems: InventoryItemOption[];
  sessionTerms: SessionTermOption[];
  users: UserOption[];
}

export default function EntitlementForm({
  entitlement,
  onSubmit,
  onCancel,
  isSubmitting,
  // Destructure the new props
  classes,
  inventoryItems,
  sessionTerms,
  users,
}: EntitlementFormProps) {
  const [formData, setFormData] = useState<CreateClassInventoryEntitlementInput>({
    class_id: "",
    inventory_item_id: "",
    session_term_id: "",
    quantity: 0,
    notes: "",
    created_by: "",
  });

  // State is no longer needed for classes, inventoryItems, sessionTerms, or users,
  // as they are passed in via props.

  useEffect(() => {
    if (entitlement) {
      setFormData({
        class_id: entitlement.class_id,
        inventory_item_id: entitlement.inventory_item_id,
        session_term_id: entitlement.session_term_id,
        quantity: entitlement.quantity,
        notes: entitlement.notes || "",
        created_by: entitlement.created_by,
      });
    }
  }, [entitlement]);

  // ❌ REMOVED: The problematic 'fetchData' useEffect is gone!

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.class_id ||
      !formData.inventory_item_id ||
      !formData.session_term_id ||
      !formData.created_by
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    await onSubmit(formData);
  };

  // Check if dropdown data is missing (only relevant if the parent load failed)
  const isDataMissing = classes.length === 0 || inventoryItems.length === 0 || sessionTerms.length === 0 || users.length === 0;

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-sm max-w-3xl w-full px-8 py-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4 text-[#171D26]">
            {entitlement ? "Edit Entitlement" : "Create New Entitlement"}
        </h2>

        {isDataMissing && (
            <div className="text-red-600 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                ⚠️ **Error:** Dropdown data failed to load. Please refresh the page.
            </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class */}
            <div className="pb-4">
              <label
                htmlFor="class_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Class <span className="text-gray-500">*</span>
              </label>
              <select
                id="class_id"
                value={formData.class_id}
                onChange={(e) =>
                  setFormData({ ...formData, class_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting || isDataMissing}
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || cls.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Item */}
            <div className="pb-4">
              <label
                htmlFor="inventory_item_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Inventory Item <span className="text-gray-500">*</span>
              </label>
              <select
                id="inventory_item_id"
                value={formData.inventory_item_id}
                onChange={(e) =>
                  setFormData({ ...formData, inventory_item_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting || isDataMissing}
              >
                <option value="">Select Item</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Term */}
            <div className="pb-4">
              <label
                htmlFor="session_term_id"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Session Term <span className="text-gray-500">*</span>
              </label>
              <select
                id="session_term_id"
                value={formData.session_term_id}
                onChange={(e) =>
                  setFormData({ ...formData, session_term_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting || isDataMissing}
              >
                <option value="">Select Term</option>
                {sessionTerms.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name || term.id}
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity */}
            <div className="pb-4">
              <label
                htmlFor="quantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Quantity <span className="text-gray-500">*</span>
              </label>
              <input
                id="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({
                    ...formData,
                    quantity: value === "" ? 0 : parseInt(value),
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Created By */}
            <div className="pb-4 md:col-span-2">
              <label
                htmlFor="created_by"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Created By (User) <span className="text-gray-500">*</span>
              </label>
              <select
                id="created_by"
                value={formData.created_by}
                onChange={(e) =>
                  setFormData({ ...formData, created_by: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting || isDataMissing}
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name || user.email || user.id}
                  </option>
                ))}
              </select>
            </div>
           
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isDataMissing}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : entitlement ? (
                "Update"
              ) : (
                "Create"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}