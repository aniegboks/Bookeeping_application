"use client";

import { useState, useEffect } from "react";
import { User, CreateUserInput } from "@/lib/types/user";
import SmallLoader from "../ui/small_loader";

interface BackendUserPayload {
  id?: string;
  email: string;
  phone: string;
  user_metadata: {
    name: string;
    roles: string[];
  };
}

interface UserFormProps {
  user?: User;
  onSubmit: (payload: BackendUserPayload[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const VALID_ROLES = ["admin", "user", "super-admin"];

export default function UserForm({
  user,
  onSubmit,
  onCancel,
  isSubmitting,
}: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserInput>({
    email: "",
    password: "",
    phone: "",
    name: "",
    roles: [],
  });

  const [roleError, setRoleError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email ?? "",
        password: "",
        phone: user.phone ?? "",
        name: user.name ?? "",
        roles: user.roles ?? [],
      });
    }
  }, [user]);

  const handleRoleToggle = (role: string) => {
    const newRoles = formData.roles.includes(role)
      ? formData.roles.filter((r) => r !== role)
      : [...formData.roles, role];

    setFormData({ ...formData, roles: newRoles });
    setRoleError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const invalidRoles = formData.roles.filter(
      (role) => !VALID_ROLES.includes(role)
    );

    if (invalidRoles.length > 0) {
      setRoleError(`roles can only include: ${VALID_ROLES.join(", ")}`);
      return;
    }

    if (formData.roles.length === 0) {
      setRoleError("At least one role is required");
      return;
    }

    // ✅ Build backend payload
    const payload: BackendUserPayload[] = [
      {
        ...(user?.id ? { id: user.id } : {}),
        email: formData.email,
        phone: formData.phone,
        user_metadata: {
          name: formData.name,
          roles: formData.roles,
        },
      },
    ];

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <h3 className="text-lg font-semibold text-[#171D26] mb-4 py-4">
          {user ? "Edit User" : "Create New User"}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-gray-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-md p-2"
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
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </div>

          {/* ROLES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Roles <span className="text-gray-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {VALID_ROLES.map((role) => (
                <label
                  key={role}
                  className="flex items-center gap-2 text-sm border border-gray-300 rounded-md px-2 py-1 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.roles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                  />
                  {role}
                </label>
              ))}
            </div>
            {roleError && <p className="text-red-500 text-sm">{roleError}</p>}
          </div>

          {/* PASSWORD (only for create) */}
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-gray-500">*</span>
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-md bg-[#171D26] text-white hover:bg-[#1f2633] flex items-center gap-2"
            >
              {isSubmitting ? <SmallLoader /> : user ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
