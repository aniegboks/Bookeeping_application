// components/inventory_distribution/form.tsx

import { useState, useEffect } from "react";
import {
  InventoryDistribution,
  CreateInventoryDistributionInput,
} from "@/lib/types/inventory_distribution";
// Import types for the dropdown data
import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";

interface DistributionFormProps {
  distribution?: InventoryDistribution;
  onSubmit: (data: CreateInventoryDistributionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  // --- ADDED PROPS FOR DROPDOWNS ---
  classes: SchoolClass[];
  inventoryItems: InventoryItem[];
  academicSessions: AcademicSession[];
  users: User[];
  // ---------------------------------
}

export default function DistributionForm({
  distribution,
  onSubmit,
  onCancel,
  isSubmitting,
  classes, // Destructure new props
  inventoryItems,
  academicSessions,
  users,
}: DistributionFormProps) {
  const [formData, setFormData] = useState<CreateInventoryDistributionInput>({
    class_id: "",
    inventory_item_id: "",
    session_term_id: "",
    distributed_quantity: 0,
    distribution_date: new Date().toISOString(),
    received_by: "",
    receiver_name: "",
    notes: "",
    created_by: "",
  });

  // Set initial form data on edit or when distribution changes
  useEffect(() => {
    if (distribution) {
      setFormData({
        class_id: distribution.class_id,
        inventory_item_id: distribution.inventory_item_id,
        session_term_id: distribution.session_term_id,
        distributed_quantity: distribution.distributed_quantity,
        distribution_date: distribution.distribution_date,
        received_by: distribution.received_by,
        receiver_name: distribution.receiver_name,
        notes: distribution.notes || "",
        created_by: distribution.created_by,
      });
    } else {
      // Set default values for new form if lists are available
      setFormData(prev => ({
        ...prev,
        class_id: classes[0]?.id || "",
        inventory_item_id: inventoryItems[0]?.id || "",
        session_term_id: academicSessions[0]?.id || "",
        received_by: users[0]?.id || "",
        created_by: users[0]?.id || "",
      }));
    }
  }, [distribution, classes, inventoryItems, academicSessions, users]); // Add lists to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  // Helper to format date for datetime-local input
  const formatDateForInput = (isoDate: string) => {
    if (!isoDate) return "";
    try {
      // Ensure the date object is created correctly and then format to 'YYYY-MM-DDTHH:MM'
      const date = new Date(isoDate);
      // Adjust for local time zone offset to prevent off-by-one day issues
      const offset = date.getTimezoneOffset() * 60000;
      const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
      return localISOTime;
    } catch (e) {
      console.error("Invalid date format", isoDate);
      return "";
    }
  };


  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh] relative">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class ID Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_id}
                onChange={(e) =>
                  setFormData({ ...formData, class_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                required
                disabled={isSubmitting || classes.length === 0}
              >
                <option value="" disabled>Select a Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Item ID Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inventory Item <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.inventory_item_id}
                onChange={(e) =>
                  setFormData({ ...formData, inventory_item_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                required
                disabled={isSubmitting || inventoryItems.length === 0}
              >
                <option value="" disabled>Select an Item</option>
                {inventoryItems.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Term ID Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Term <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.session_term_id}
                onChange={(e) =>
                  setFormData({ ...formData, session_term_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                required
                disabled={isSubmitting || academicSessions.length === 0}
              >
                <option value="" disabled>Select a Session Term</option>
                {academicSessions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Distributed Quantity Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.distributed_quantity}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    distributed_quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Distribution Date Input (Reusing Existing Logic) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.distribution_date)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    distribution_date: new Date(e.target.value).toISOString(),
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Received By (ID) Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Received By (User) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.received_by}
                onChange={(e) => {
                  const selectedUser = users.find(u => u.id === e.target.value);
                  setFormData({
                    ...formData,
                    received_by: e.target.value,
                    // Auto-fill receiver_name based on selection
                    receiver_name: selectedUser ? selectedUser.name : "",
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                required
                disabled={isSubmitting || users.length === 0}
              >
                <option value="" disabled>Select Receiver</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Receiver Name Input (Now auto-filled but still needed for the API/Schema) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receiver Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.receiver_name}
                onChange={(e) =>
                  setFormData({ ...formData, receiver_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting} // Keep it disabled to force use of the select, or allow manual entry if necessary
                placeholder="Name"
              />
            </div>

            {/* Created By (User ID) Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created By (User) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.created_by}
                onChange={(e) =>
                  setFormData({ ...formData, created_by: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                required
                disabled={isSubmitting || users.length === 0}
              >
                <option value="" disabled>Select Creator</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
              placeholder="Additional notes about this distribution..."
            />
          </div>

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
              disabled={isSubmitting || classes.length === 0 || inventoryItems.length === 0 || academicSessions.length === 0 || users.length === 0}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                distribution ? "Update Distribution" : "Create Distribution"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}