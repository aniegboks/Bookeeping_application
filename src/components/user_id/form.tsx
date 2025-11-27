"use client";

import { useState, useEffect } from "react";
import { User, CreateUserInput, UpdateUserInput } from "@/lib/types/user";
import { Role } from "@/lib/types/roles";
import SmallLoader from "../ui/small_loader";

interface UserFormProps {
  user?: User;
  roles: Role[];
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function UserForm({
  user,
  roles,
  onSubmit,
  onCancel,
  isSubmitting,
}: UserFormProps) {
  const [formData, setFormData] = useState<{
    email: string;
    password: string;
    phone: string;
    name: string;
    role: string;
  }>({
    email: "",
    password: "",
    phone: "",
    name: "",
    role: "",
  });

  const [roleError, setRoleError] = useState("");

  // Extract role codes from the roles array
  const validRoleCodes = roles.map((role) => role.code);

useEffect(() => {
  if (user) {
    setFormData({
      email: user.email ?? "",
      password: "",
      phone: user.phone ?? "",
      name: user.name ?? "",
      role: user.roles?.[0] ?? "",   // FIXED
    });
  }
}, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate role
    if (!formData.role) {
      setRoleError("Role is required");
      return;
    }

    if (!validRoleCodes.includes(formData.role)) {
      setRoleError(`Invalid role: ${formData.role}`);
      return;
    }

    // Build the data to submit
    const dataToSubmit: any = {
      email: formData.email,
      phone: formData.phone,
      name: formData.name,
      role: formData.role,
    };

    // Only include password if provided (for create or update with password change)
    if (formData.password) {
      dataToSubmit.password = formData.password;
    }

    await onSubmit(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-lg font-semibold text-[#171D26] mb-4 py-4">
          {user ? "Edit User" : "Create New User"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL & NAME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                placeholder="user@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
                placeholder="John Doe"
              />
            </div>
          </div>

          {/* PHONE */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
              placeholder="+2348032445678"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {!user && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required={!user}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
              placeholder={user ? "Leave blank to keep current password" : "Enter password"}
            />
            {user && (
              <p className="text-xs text-gray-500 mt-1">
                Leave blank to keep the current password
              </p>
            )}
          </div>

          {/* ROLE (Single Select) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role <span className="text-red-500">*</span>
            </label>
            {roles.length === 0 ? (
              <p className="text-sm text-gray-500 italic">
                No active roles available. Please create roles first.
              </p>
            ) : (
              <select
                value={formData.role}
                onChange={(e) => {
                  setFormData({ ...formData, role: e.target.value });
                  setRoleError("");
                }}
                required
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-[#3D4C63] focus:border-[#3D4C63]"
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
            )}
            {roleError && (
              <p className="text-red-500 text-sm mt-2">{roleError}</p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || roles.length === 0}
              className="px-4 py-2 rounded-md bg-[#3D4C63] text-white hover:bg-[#495C79] transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <SmallLoader />
                  {user ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{user ? "Update User" : "Create User"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}