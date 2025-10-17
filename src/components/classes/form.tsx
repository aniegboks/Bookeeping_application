"use client";

import { useState, useEffect } from "react";
import {
  SchoolClass,
  CreateSchoolClassInput,
} from "@/lib/types/classes";
import { User } from "@/lib/types/user";

interface ClassFormProps {
  schoolClass?: SchoolClass;
  onSubmit: (data: CreateSchoolClassInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  users: User[];
}

export default function ClassForm({
  schoolClass,
  onSubmit,
  onCancel,
  isSubmitting,
  users,
}: ClassFormProps) {
  const [formData, setFormData] = useState<CreateSchoolClassInput>({
    name: "",
    status: "active",
    created_by: "",
  });

  useEffect(() => {
    if (schoolClass) {
      setFormData({
        name: schoolClass.name,
        status: schoolClass.status,
        created_by: schoolClass.created_by,
      });
    }
  }, [schoolClass]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-lg font-semibold text-[#171D26] mb-4 py-4">
          {schoolClass ? "Edit Class" : "Create New Class"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Class Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name <span className="text-gray-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
                placeholder="e.g., Grade 10A"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-gray-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 text-sm text-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                required
                disabled={isSubmitting}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Created By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created By (User) <span className="text-gray-500">*</span>
              </label>
              <select
                name="created_by"
                value={formData.created_by}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] text-sm text-gray-500"
                disabled={isSubmitting}
              >
                <option value="">Select a user</option>
                {users.map((user) => {
                  const displayName: string =
                    user.name || user.email || String(user.id);
                  return (
                    <option key={user.id} value={user.id}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Actions */}
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
              disabled={isSubmitting}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : schoolClass ? (
                "Update Class"
              ) : (
                "Create Class"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
