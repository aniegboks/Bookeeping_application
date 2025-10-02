// components/school_class_ui/class_form.tsx

import { useState, useEffect } from "react";
import { SchoolClass, CreateSchoolClassInput, SchoolClassStatus } from "@/lib/types/classes";

interface ClassFormProps {
  schoolClass?: SchoolClass;
  onSubmit: (data: CreateSchoolClassInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function ClassForm({
  schoolClass,
  onSubmit,
  onCancel,
  isSubmitting,
}: ClassFormProps) {
  const [formData, setFormData] = useState<CreateSchoolClassInput>({
    name: "",
    class_teacher_id: "",
    status: "active",
    created_by: "",
  });

  useEffect(() => {
    if (schoolClass) {
      setFormData({
        name: schoolClass.name,
        class_teacher_id: schoolClass.class_teacher_id,
        status: schoolClass.status,
        created_by: schoolClass.created_by,
      });
    }
  }, [schoolClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="e.g., Grade 10A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Class Teacher ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.class_teacher_id}
            onChange={(e) =>
              setFormData({ ...formData, class_teacher_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="Teacher UUID"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.status}
            onChange={(e) =>
              setFormData({ ...formData, status: e.target.value as SchoolClassStatus })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Created By (User ID) <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.created_by}
            onChange={(e) =>
              setFormData({ ...formData, created_by: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
            required
            disabled={isSubmitting}
            placeholder="User UUID"
          />
        </div>
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
          disabled={isSubmitting}
          className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Saving...
            </>
          ) : (
            schoolClass ? "Update Class" : "Create Class"
          )}
        </button>
      </div>
    </form>
  );
}