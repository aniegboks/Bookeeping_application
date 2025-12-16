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

interface TeacherFormProps {
  initialTeacher?: ClassTeacher;
  onSubmit: (
    data: CreateClassTeacherInput | UpdateClassTeacherInput
  ) => Promise<void>;
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
    class_id:
      initialTeacher?.class_id || (classes.length > 0 ? classes[0].id : ""),
    name: initialTeacher?.name || "",
    email: initialTeacher?.email || "",
    role: "CLASS_TEACHER", // Matches API spec
    status: initialTeacher?.status || "active",
  });

  // Update form data when initialTeacher changes
  useEffect(() => {
    if (initialTeacher) {
      setFormData({
        class_id: initialTeacher.class_id,
        name: initialTeacher.name || "",
        email: initialTeacher.email || "",
        role: "CLASS_TEACHER", // Matches API spec
        status: initialTeacher.status || "active",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const hasData = classes.length > 0;

  const FormContent = (
    <>
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-sm max-w-2xl w-full p-6">
                   <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. School Class */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              School Class <span className="text-red-500">*</span>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teacher Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            />
          </div>

          {/* 3. Email - Always editable */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="teacher@school.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              required
              disabled={isSubmitting}
            />
            {initialTeacher && (
              <p className="mt-1 text-xs text-gray-500">
                You can update the email address
              </p>
            )}
          </div>

          {/* 4. Role - Always CLASS_TEACHER (Display only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
              Class Teacher
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Role is automatically set to Class Teacher
            </p>
          </div>

          {/* 5. Status */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
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
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t">
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
            ) : initialTeacher ? (
              "Update Assignment"
            ) : (
              "Assign Teacher"
            )}
          </button>
        </div>
      </form>
              </div>

        </div>
    </>
  );

  return (
    <div>
      {!hasData ? (
        <div className="text-gray-500 py-8 text-center">
          <p className="mb-2">No classes available</p>
          <p className="text-sm">Please create classes first before assigning teachers</p>
        </div>
      ) : (
        FormContent
      )}
    </div>
  );
}