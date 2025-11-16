"use client";

import { useState, useEffect } from "react";
import {
  RoleMenu,
  CreateRoleMenuPayload,
  UpdateRoleMenuPayload,
  Menu,
} from "@/lib/types/roles_menu";
import { Role } from "@/lib/types/roles";

interface RoleMenuFormProps {
  roleMenu?: RoleMenu;
  roles: Role[];
  menus: Menu[];
  onSubmit: (
    data: CreateRoleMenuPayload | UpdateRoleMenuPayload
  ) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function RoleMenuForm({
  roleMenu,
  roles,
  menus,
  onSubmit,
  onCancel,
  isSubmitting,
}: RoleMenuFormProps) {
  const [formData, setFormData] = useState<CreateRoleMenuPayload>({
    role_code: "",
    menu_id: "",
  });

  useEffect(() => {
    if (roleMenu) {
      setFormData({
        role_code: roleMenu.role_code,
        menu_id: roleMenu.menu_id,
      });
    }
  }, [roleMenu]);

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement>
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
          {roleMenu ? "Edit Role-Menu Assignment" : "Assign Menu to Role"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              name="role_code"
              value={formData.role_code}
              onChange={handleChange}
              required
              disabled={!!roleMenu}
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.code} value={role.code}>
                  {role.name} ({role.code})
                </option>
              ))}
            </select>
            {roleMenu && (
              <p className="text-xs text-gray-500 mt-1">
                Role cannot be changed when editing
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Menu</label>
            <select
              name="menu_id"
              value={formData.menu_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">Select a menu</option>
              {menus.map((menu) => (
                <option key={menu.id} value={menu.id}>
                  {menu.caption} ({menu.route})
                </option>
              ))}
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
                : roleMenu
                ? "Update Assignment"
                : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}