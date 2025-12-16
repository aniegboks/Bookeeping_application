"use client";

import { useState, useEffect } from "react";
import {
  InventoryDistribution,
  CreateInventoryDistributionInput,
} from "@/lib/types/inventory_distribution";
import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { ClassTeacher } from "@/lib/types/class_teacher";
import { User } from "@/lib/types/user";
import SmallLoader from "../ui/small_loader";

interface DistributionFormProps {
  distribution?: InventoryDistribution;
  onSubmit: (data: CreateInventoryDistributionInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  classes: SchoolClass[];
  inventoryItems: InventoryItem[];
  academicSessions: AcademicSession[];
  classTeachers: ClassTeacher[];
  users: User[];
}

export default function DistributionForm({
  distribution,
  onSubmit,
  onCancel,
  isSubmitting,
  classes,
  inventoryItems,
  academicSessions,
  classTeachers,
}: DistributionFormProps) {
  const [formData, setFormData] = useState<Omit<CreateInventoryDistributionInput, 'created_by'>>({
    class_id: "",
    inventory_item_id: "",
    session_term_id: "",
    distributed_quantity: 0,
    distribution_date: new Date().toISOString().split("T")[0],
    received_by: "",
    receiver_name: "",
    notes: "",
  });

  const [filteredTeachers, setFilteredTeachers] = useState<ClassTeacher[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  useEffect(() => {
    if (distribution) {
      setFormData({
        class_id: distribution.class_id,
        inventory_item_id: distribution.inventory_item_id,
        session_term_id: distribution.session_term_id,
        distributed_quantity: distribution.distributed_quantity,
        distribution_date: distribution.distribution_date.split("T")[0],
        received_by: distribution.received_by,
        receiver_name: distribution.receiver_name,
        notes: distribution.notes || "",
      });
    }
  }, [distribution]);

  // Filter teachers when class changes
  useEffect(() => {
    if (formData.class_id) {
      const teachersForClass = classTeachers.filter(
        (teacher) =>
          teacher.class_id === formData.class_id &&
          teacher.status === "active" &&
          teacher.teacher_id
      );
      setFilteredTeachers(teachersForClass);
    } else {
      setFilteredTeachers([]);
    }
  }, [formData.class_id, classTeachers]);

  // Track selected inventory item for availability display
  useEffect(() => {
    if (formData.inventory_item_id) {
      const item = inventoryItems.find((i) => i.id === formData.inventory_item_id);
      setSelectedItem(item || null);
    } else {
      setSelectedItem(null);
    }
  }, [formData.inventory_item_id, inventoryItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.class_id) {
      alert("Please select a class");
      return;
    }

    if (!formData.inventory_item_id) {
      alert("Please select an inventory item");
      return;
    }

    if (!formData.session_term_id) {
      alert("Please select a session term");
      return;
    }

    if (!formData.received_by) {
      alert("Please select a class teacher to receive the items");
      return;
    }

    if (!formData.receiver_name.trim()) {
      alert("Please enter the receiver's name");
      return;
    }

    if (formData.distributed_quantity <= 0) {
      alert("Distributed quantity must be greater than 0");
      return;
    }

    // Check if quantity exceeds available stock
    if (selectedItem && formData.distributed_quantity > selectedItem.current_stock) {
      const confirmProceed = window.confirm(
        `Warning: You are trying to distribute ${formData.distributed_quantity} items, but only ${selectedItem.current_stock} are available in stock. Do you want to proceed anyway?`
      );
      if (!confirmProceed) {
        return;
      }
    }

    const selectedTeacher = classTeachers.find((t) => t.id === formData.received_by);
    if (!selectedTeacher) {
      alert("Selected teacher is invalid");
      return;
    }

    // Prepare payload - created_by will be set automatically by the backend
    const payload: CreateInventoryDistributionInput = {
      class_id: formData.class_id,
      inventory_item_id: formData.inventory_item_id,
      session_term_id: formData.session_term_id,
      distributed_quantity: Number(formData.distributed_quantity),
      distribution_date: formData.distribution_date,
      received_by: formData.received_by,
      receiver_name: formData.receiver_name.trim(),
      notes: formData.notes?.trim() || "",
      created_by: "", // Backend will set this from authenticated user
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-sm shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-6">
          {distribution ? "Edit Distribution" : "Create Distribution"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Distribution Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Class */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.class_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    class_id: e.target.value,
                    received_by: "",
                    receiver_name: "",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Class</option>
                {classes
                  .filter((c) => c.status === "active")
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Inventory Item */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inventory Item <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.inventory_item_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    inventory_item_id: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Item</option>
                {inventoryItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (Available: {item.current_stock})
                  </option>
                ))}
              </select>
              {selectedItem && (
                <p className="text-xs text-gray-600 mt-1">
                  Available quantity: <span className="font-medium">{selectedItem.current_stock}</span>
                </p>
              )}
            </div>

            {/* Session Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Term <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.session_term_id}
                onChange={(e) =>
                  setFormData({ ...formData, session_term_id: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="">Select Term</option>
                {academicSessions
                  .filter((s) => s.status === "active")
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Quantity + Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distributed Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.distributed_quantity || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    distributed_quantity: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
                placeholder="Enter quantity"
              />
              {selectedItem && formData.distributed_quantity > selectedItem.current_stock && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ Warning: Quantity exceeds available stock
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.distribution_date}
                onChange={(e) =>
                  setFormData({ ...formData, distribution_date: e.target.value })
                }
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Receiver Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class Teacher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Teacher <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.received_by}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedTeacher = classTeachers.find(
                    (t) => t.id === selectedId
                  );
                  setFormData({
                    ...formData,
                    received_by: selectedId,
                    receiver_name: selectedTeacher?.name || "",
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting || !formData.class_id}
              >
                <option value="">
                  {formData.class_id
                    ? "Select Class Teacher"
                    : "Select a class first"}
                </option>

                {filteredTeachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.email})
                  </option>
                ))}
              </select>

              {formData.class_id && filteredTeachers.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  ⚠️ No active teachers assigned to this class
                </p>
              )}
            </div>

            {/* Receiver Name */}
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
                disabled={isSubmitting}
                placeholder="e.g., Mrs. Johnson"
              />
              <p className="text-xs text-gray-500 mt-1">
                Auto-filled when selecting a teacher
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes <span className="text-gray-500">(Optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
              placeholder="Add any additional notes about this distribution..."
            />
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> The distribution will be recorded under your account automatically.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <SmallLoader />
                  Saving...
                </>
              ) : distribution ? (
                "Update Distribution"
              ) : (
                "Create Distribution"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}