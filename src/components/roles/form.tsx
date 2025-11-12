"use client";

import { useState, useEffect } from "react";
import { Role, CreateRolePayload, UpdateRolePayload } from "@/lib/types/roles";

interface RoleFormProps {
    role?: Role;
    onSubmit: (data: CreateRolePayload | UpdateRolePayload) => Promise<void>;
    onCancel: () => void;
    isSubmitting?: boolean;
}

export default function RoleForm({
    role,
    onSubmit,
    onCancel,
    isSubmitting,
}: RoleFormProps) {
    const [formData, setFormData] = useState<CreateRolePayload>({
        code: "",
        name: "",
        status: "active",
    });

    useEffect(() => {
        if (role) {
            setFormData({
                code: role.code,
                name: role.name,
                status: role.status,
            });
        }
    }, [role]);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
                    {role ? "Edit Role" : "Add Role"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Add a Name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-sm p-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
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
                            {isSubmitting ? "Saving..." : role ? "Update Role" : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
