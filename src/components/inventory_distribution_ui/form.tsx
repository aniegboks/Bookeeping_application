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
  users,
}: DistributionFormProps) {
  const [formData, setFormData] = useState<CreateInventoryDistributionInput>({
    class_id: "",
    inventory_item_id: "",
    session_term_id: "",
    distributed_quantity: 0,
    distribution_date: new Date().toISOString().split("T")[0],
    received_by: "",
    receiver_name: "",
    notes: "",
    created_by: "",
  });

  const [filteredTeachers, setFilteredTeachers] = useState<ClassTeacher[]>([]);

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
        created_by: distribution.created_by,
      });
    }
  }, [distribution]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.received_by) {
      alert("Please select a class teacher");
      return;
    }

    if (!formData.created_by) {
      alert("Please select who is creating this distribution");
      return;
    }

    if (formData.distributed_quantity <= 0) {
      alert("Distributed quantity must be greater than 0");
      return;
    }

    const selectedTeacher = classTeachers.find((t) => t.id === formData.received_by);
    if (!selectedTeacher) {
      alert("Selected teacher is invalid");
      return;
    }

    const creatorUser = users.find((u) => u.id === formData.created_by);
    if (!creatorUser) {
      alert("Selected creator does not have a valid user account");
      return;
    }

    const payload = {
      class_id: formData.class_id,
      inventory_item_id: formData.inventory_item_id,
      session_term_id: formData.session_term_id,
      distributed_quantity: Number(formData.distributed_quantity),
      distribution_date: formData.distribution_date,
      received_by: formData.received_by,
      receiver_name: formData.receiver_name.trim(),
      notes: formData.notes?.trim() || "",
      created_by: formData.created_by,
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
                Class <span className="text-gray-500">*</span>
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
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Inventory Item */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Inventory Item <span className="text-gray-500">*</span>
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
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Session Term */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Term <span className="text-gray-500">*</span>
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
                {academicSessions.map((s) => (
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
                Distributed Quantity <span className="text-gray-500">*</span>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Distribution Date <span className="text-gray-500">*</span>
              </label>
              <input
                type="date"
                value={formData.distribution_date}
                onChange={(e) =>
                  setFormData({ ...formData, distribution_date: e.target.value })
                }
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
                Class Teacher <span className="text-gray-500">*</span>
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
                  No active teachers with valid user accounts assigned to this
                  class
                </p>
              )}
            </div>

            {/* Receiver Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receiver Name <span className="text-gray-500">*</span>
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
            </div>
          </div>

          {/* Created By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By <span className="text-gray-500">*</span>
            </label>
            <select
              value={formData.created_by}
              onChange={(e) =>
                setFormData({ ...formData, created_by: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting || !!distribution}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
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
              placeholder="Additional distribution notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
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