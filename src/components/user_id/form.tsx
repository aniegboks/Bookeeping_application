// components/user_ui/user_form.tsx

import { useState, useEffect } from "react";
import { User, CreateUserInput } from "@/lib/types/user";
import SmallLoader from "../ui/small_loader";

interface UserFormProps {
    user?: User;
    onSubmit: (data: CreateUserInput) => Promise<void>;
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
                password: "", // never prefill password
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

        const invalidRoles = formData.roles.filter(role => !VALID_ROLES.includes(role));
        if (invalidRoles.length > 0) {
            setRoleError(`roles can only include: ${VALID_ROLES.join(", ")}`);
            return;
        }

        if (formData.roles.length === 0) {
            setRoleError("At least one role is required");
            return;
        }

        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
                <h3 className="text-lg font-semibold text-[#171D26] mb-4 py-4">
                    {user ? "Edit User" : "Create New User"}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email <span className="text-gray-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email ?? ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, email: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                                placeholder="name@mail.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name <span className="text-gray-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.name ?? ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, name: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                                placeholder="name"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone <span className="text-gray-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={formData.phone ?? ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, phone: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                                placeholder="phone"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password <span className="text-gray-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={formData.password ?? ""}
                                onChange={(e) =>
                                    setFormData({ ...formData, password: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required={!user}
                                disabled={isSubmitting}
                                placeholder={user ? "Leave blank to keep current" : "password"}
                            />
                            {user && (
                                <p className="text-gray-500 text-xs mt-1">
                                    Leave blank to keep current password
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roles <span className="text-gray-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {VALID_ROLES.map((role) => (
                                <label
                                    key={role}
                                    className="flex items-center gap-2 cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={formData.roles?.includes(role) ?? false}
                                        onChange={() => handleRoleToggle(role)}
                                        disabled={isSubmitting}
                                        className="w-4 h-4 text-[#3D4C63] border-gray-300 rounded focus:ring-[#3D4C63]"
                                    />
                                    <span className="text-sm text-gray-700 capitalize">{role}</span>
                                </label>
                            ))}
                        </div>
                        {roleError && (
                            <p className="text-red-500 text-sm mt-2">{roleError}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-2">
                            Select at least one role: admin, user, or super-admin
                        </p>
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
                            disabled={isSubmitting || !!roleError}
                            className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <SmallLoader />
                                    Saving...
                                </>
                            ) : (
                                user ? "Update User" : "Create User"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
