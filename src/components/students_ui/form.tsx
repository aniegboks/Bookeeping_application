"use client";

import { useState, useEffect } from "react";
import {
  Student,
  CreateStudentInput,
  Gender,
  StudentStatus,
} from "@/lib/types/students";
import { SchoolClass } from "@/lib/types/classes";
import { User } from "@/lib/types/user";
import SmallLoader from "../ui/small_loader";

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: CreateStudentInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  classes: SchoolClass[];
  users: User[];
}

export default function StudentForm({
  student,
  onSubmit,
  onCancel,
  isSubmitting,
  classes,
  users,
}: StudentFormProps) {
  const [formData, setFormData] = useState<CreateStudentInput>({
    admission_number: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    student_email: "",
    gender: "male",
    date_of_birth: "",
    class_id: "",
    guardian_name: "",
    guardian_email: "",
    guardian_contact: "",
    address: "",
    status: "active",
    created_by: "",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        admission_number: student.admission_number,
        first_name: student.first_name,
        middle_name: student.middle_name || "",
        last_name: student.last_name,
        student_email: student.student_email || "",
        gender: student.gender,
        date_of_birth: student.date_of_birth,
        class_id: student.class_id,
        guardian_name: student.guardian_name || "",
        guardian_email: student.guardian_email || "",
        guardian_contact: student.guardian_contact || "",
        address: student.address || "",
        status: student.status,
        created_by: student.created_by,
      });
    }
  }, [student]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center py-4 px-6 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6 overflow-y-auto max-h-[90vh] relative">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-6">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span className="text-gray-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={formData.middle_name}
                  onChange={(e) =>
                    setFormData({ ...formData, middle_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span className="text-gray-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Admission & Demographics */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Admission & Demographics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-visible">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number <span className="text-gray-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.admission_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      admission_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                  required
                  disabled={isSubmitting}
                  placeholder="2024001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student Email
                </label>
                <input
                  type="email"
                  value={formData.student_email}
                  onChange={(e) =>
                    setFormData({ ...formData, student_email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                  disabled={isSubmitting}
                  placeholder="student@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender <span className="text-gray-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      gender: e.target.value as Gender,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth <span className="text-gray-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date_of_birth}
                  onChange={(e) =>
                    setFormData({ ...formData, date_of_birth: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Class, Created By & Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Class & Guardian Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class <span className="text-gray-500">*</span>
                </label>
                <select
                  value={formData.class_id}
                  onChange={(e) =>
                    setFormData({ ...formData, class_id: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select Class</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              {/**<div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created By <span className="text-gray-500">*</span>
                </label>
                <select
                  value={formData.created_by}
                  onChange={(e) =>
                    setFormData({ ...formData, created_by: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select User</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name}
                    </option>
                  ))}
                </select>
              </div> */}


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status <span className="text-gray-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as StudentStatus })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] bg-white"
                  required
                  disabled={isSubmitting}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                  <option value="transferred">Transferred</option>
                  <option value="suspended">Suspended</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Guardian Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-visible">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Name
              </label>
              <input
                type="text"
                value={formData.guardian_name}
                onChange={(e) =>
                  setFormData({ ...formData, guardian_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Email
              </label>
              <input
                type="email"
                value={formData.guardian_email}
                onChange={(e) =>
                  setFormData({ ...formData, guardian_email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                disabled={isSubmitting}
                placeholder="guardian@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Guardian Contact
              </label>
              <input
                type="tel"
                value={formData.guardian_contact}
                onChange={(e) =>
                  setFormData({ ...formData, guardian_contact: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                disabled={isSubmitting}
                placeholder="+1234567890"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
              disabled={isSubmitting}
              placeholder="Student's residential address..."
            />
          </div>

          {/* Form Actions */}
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
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <SmallLoader />
                  Saving...
                </>
              ) : student ? (
                "Update Student"
              ) : (
                "Create Student"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
