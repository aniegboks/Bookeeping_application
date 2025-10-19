"use client";

import { useState, useEffect } from "react";
import {
  ClassTeacher,
  CreateClassTeacherInput,
  UpdateClassTeacherInput,
  ClassTeacherStatus,
} from "@/lib/types/class_teacher";
import { SchoolClass } from "@/lib/types/classes";
import { User } from "@/lib/types/user";

// Helper to format date for datetime-local input
const toDateTimeLocal = (dateString: string | undefined): string => {
  if (!dateString) return "";
  try {
    return new Date(dateString).toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

interface TeacherFormProps {
  initialTeacher?: ClassTeacher;
  onSubmit: (data: CreateClassTeacherInput | UpdateClassTeacherInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  classes: SchoolClass[];
  users: User[];
}

export default function TeacherForm({
  initialTeacher,
  onSubmit,
  onCancel,
  isSubmitting,
  classes,
  users,
}: TeacherFormProps) {
  const [formData, setFormData] = useState<CreateClassTeacherInput>({
    class_id: initialTeacher?.class_id || (classes.length > 0 ? classes[0].id : ""),
    name: initialTeacher?.name || "",
    email: initialTeacher?.email || "",
    role: initialTeacher?.role || "class_teacher",
    status: initialTeacher?.status || "active",
    assigned_at: initialTeacher?.assigned_at || new Date().toISOString(),
    unassigned_at: initialTeacher?.unassigned_at || undefined,
    created_by: "", // backend should handle this
  });

  // Update form data when initialTeacher changes
  useEffect(() => {
    if (initialTeacher) {
      setFormData({
        class_id: initialTeacher.class_id,
        name: initialTeacher.name || "",
        email: initialTeacher.email || "",
        role: initialTeacher.role || "class_teacher",
        status: initialTeacher.status || "active",
        assigned_at: initialTeacher.assigned_at || new Date().toISOString(),
        unassigned_at: initialTeacher.unassigned_at || undefined,
        created_by: "",
      });
    }
  }, [initialTeacher]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (name: keyof CreateClassTeacherInput, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value ? new Date(value).toISOString() : undefined,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const hasData = classes.length > 0;

  const FormContent = (
    <>
      <h3 className="text-lg font-semibold text-[#171D26] mb-4 py-4">
        {initialTeacher ? "Edit Teacher Assignment" : "Assign New Teacher"}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. School Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-4">
              School Class <span className="text-gray-500">*</span>
            </label>
            <select
              name="class_id"
              value={formData.class_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            >
              <option value="" disabled>
                Select a Class
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-4">
              Teacher Name <span className="text-gray-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 3. Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-4">
              Email <span className="text-gray-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 4. Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-4">
              Role <span className="text-gray-500">*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            >
              <option value="class_teacher">Class Teacher</option>
              <option value="assistant_teacher">Assistant Teacher</option>
              <option value="subject_teacher">Subject Teacher</option>
            </select>
          </div>

          {/* 5. Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-4">
              Status <span className="text-gray-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as ClassTeacherStatus,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* 6. Assigned At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-4">
              Assigned At <span className="text-gray-500">*</span>
            </label>
            <input
              type="datetime-local"
              value={toDateTimeLocal(formData.assigned_at)}
              onChange={(e) => handleDateChange("assigned_at", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 7. Unassigned At */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 pt-4">
              Unassigned At
            </label>
            <input
              type="datetime-local"
              value={toDateTimeLocal(formData.unassigned_at)}
              onChange={(e) => handleDateChange("unassigned_at", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-sm hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              initialTeacher ? "Update Assignment" : "Create Assignment"
            )}
          </button>
        </div>
      </form>
    </>
  );

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        {!hasData ? (
          <div className="text-gray-500 py-8 text-center">
            Loading classes...
          </div>
        ) : (
          FormContent
        )}
      </div>
    </div>
  );
}