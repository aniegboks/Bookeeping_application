"use client";

import { useState, useEffect } from "react";
import {
  RolePrivilege,
  CreateRolePrivilegePayload,
  UpdateRolePrivilegePayload,
} from "@/lib/types/roles_privilage";
import { Role } from "@/lib/types/roles";

interface RolePrivilegeFormProps {
  privilege?: RolePrivilege;
  roles: Role[];
  onSubmit: (
    data: CreateRolePrivilegePayload | UpdateRolePrivilegePayload
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function RolePrivilegeForm({
  privilege,
  roles,
  onSubmit,
  onCancel,
  isSubmitting,
}: RolePrivilegeFormProps) {
  const [formData, setFormData] = useState<CreateRolePrivilegePayload>({
    role_code: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (privilege) {
      setFormData({
        role_code: privilege.role_code,
        description: privilege.description,
        status: privilege.status as "active" | "inactive",
      });
    }
  }, [privilege]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-sm max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-3">
          {privilege ? "Edit Role Privilege" : "Add Role Privilege"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role_code"
              value={formData.role_code}
              onChange={handleChange}
              required
              disabled={!!privilege}
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.code} value={role.code}>
                  {role.name} ({role.code})
                </option>
              ))}
            </select>
            {privilege && (
              <p className="text-xs text-gray-500 mt-1">
                Role cannot be changed when editing
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              name="description"
              placeholder="Enter privilege description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-sm text-sm hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm hover:bg-[#495C79] transition disabled:opacity-50"
            >
              {isSubmitting
                ? "Saving..."
                : privilege
                ? "Update Privilege"
                : "Create Privilege"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}