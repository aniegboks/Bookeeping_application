"use client";

import { useState } from "react";
import { X, Upload } from "lucide-react";
import { Role } from "@/lib/types/roles";
import { Menu } from "@/lib/types/roles_menu";
import toast from "react-hot-toast";

interface BulkAssignModalProps {
  roles: Role[];
  menus: Menu[];
  onSubmit: (payload: { role_code: string; menu_ids: string[] }) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export default function BulkAssignModal({
  roles,
  menus,
  onSubmit,
  onCancel,
  isSubmitting,
}: BulkAssignModalProps) {
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());

  const handleMenuToggle = (menuId: string) => {
    const newSelected = new Set(selectedMenus);
    if (newSelected.has(menuId)) {
      newSelected.delete(menuId);
    } else {
      newSelected.add(menuId);
    }
    setSelectedMenus(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedMenus(new Set(menus.map((m) => m.id)));
  };

  const handleClearAll = () => {
    setSelectedMenus(new Set());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    if (selectedMenus.size === 0) {
      toast.error("Please select at least one menu");
      return;
    }

    const payload = {
      role_code: selectedRole,
      menu_ids: Array.from(selectedMenus),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Bulk Assign Menus to Role
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Assign multiple menus to a role at once
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="p-6 overflow-y-auto flex-1">
            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role *
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a role...</option>
                {roles.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.name} ({role.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Menu Selection */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Select Menus * ({selectedMenus.size} selected)
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleClearAll}
                    className="text-xs text-red-600 hover:text-red-800 underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <div className="border border-gray-300 rounded-md p-4 max-h-96 overflow-y-auto bg-gray-50 space-y-2">
                {menus.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No menus available
                  </p>
                ) : (
                  menus.map((menu) => (
                    <label
                      key={menu.id}
                      className="flex items-start gap-3 cursor-pointer hover:bg-white p-3 rounded transition border border-transparent hover:border-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedMenus.has(menu.id)}
                        onChange={() => handleMenuToggle(menu.id)}
                        className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {menu.caption}
                        </p>
                        <p className="text-xs text-gray-500 font-mono">
                          {menu.route}
                        </p>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This operation will assign all selected menus to the chosen role.
                Existing assignments will be preserved, and only new assignments will be created.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Assign {selectedMenus.size} Menu(s)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}