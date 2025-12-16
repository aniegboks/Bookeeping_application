// src/components/class_inventory_entitlement_ui/form.tsx
"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  ClassInventoryEntitlement,
  CreateClassInventoryEntitlementInput,
} from "@/lib/types/class_inventory_entitlement";

// --- Interface Definitions ---

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
  });

  useEffect(() => {
    if (entitlement) {
      setFormData({
        class_id: entitlement.class_id,
        inventory_item_id: entitlement.inventory_item_id,
        session_term_id: entitlement.session_term_id,
        quantity: entitlement.quantity,
        notes: entitlement.notes || "",
      });
    }
  }, [entitlement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation - removed created_by check
    if (
      !formData.class_id ||
      !formData.inventory_item_id ||
      !formData.session_term_id
    ) {
      toast.error("Please fill all required fields (Class, Inventory Item, and Session Term).");
      return;
    }

    if (formData.quantity < 0) {
      toast.error("Quantity cannot be negative. Please enter a valid number.");
      return;
    }

    await onSubmit(formData);
  };

  // Check if dropdown data is missing
  const isDataMissing = classes.length === 0 || inventoryItems.length === 0 || sessionTerms.length === 0;

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
                ⚠️ <strong>Error:</strong> Required dropdown data failed to load. Please refresh the page and try again.
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
                Class <span className="text-red-500">*</span>
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
                Inventory Item <span className="text-red-500">*</span>
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
                Session Term <span className="text-red-500">*</span>
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
                Quantity <span className="text-red-500">*</span>
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
                placeholder="Enter quantity"
              />
            </div>
          </div>

          {/* Notes - Full Width */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes <span className="text-gray-400">(Optional)</span>
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
              placeholder="Add any additional notes or comments..."
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
                  {entitlement ? "Updating..." : "Creating..."}
                </>
              ) : entitlement ? (
                "Update Entitlement"
              ) : (
                "Create Entitlement"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}