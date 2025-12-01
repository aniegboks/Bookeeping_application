"use client";

import { useState } from "react";
import { X, Plus, Trash2, Upload, RefreshCw } from "lucide-react";
import { Role } from "@/lib/types/roles";
import { PrivilegeStatus } from "@/lib/types/roles_privilage";
import toast from "react-hot-toast";

interface PrivilegeRow {
    id: string;
    module: string;
    description: string;
    status: PrivilegeStatus;
}

interface BulkUpsertModalProps {
    roles: Role[];
    onSubmit: (payload: {
        role: string;
        privileges: Record<string, { description: string; status: boolean }[]>;
        mode: 'merge' | 'replace'; // ✅ NEW: Add mode parameter
    }) => void;
    onCancel: () => void;
    isSubmitting: boolean;
}

export default function BulkUpsertModal({
    roles,
    onSubmit,
    onCancel,
    isSubmitting,
}: BulkUpsertModalProps) {
    const [selectedRole, setSelectedRole] = useState("");
    const [upsertMode, setUpsertMode] = useState<'merge' | 'replace'>('merge'); // ✅ NEW: Mode selector
    const [privileges, setPrivileges] = useState<PrivilegeRow[]>([
        { id: crypto.randomUUID(), module: "", description: "", status: "active" },
    ]);
    const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

    const privilegeTemplates: Record<string, string[]> = {
        "Brands": [
            "Get all brands",
            "Create a new brand",
            "Get a brand by ID",
            "Update a brand by ID",
            "Delete a brand by ID",
        ],
        "Categories": [
            "Get all categories",
            "Create a new category",
            "Get a category by ID",
            "Update a category by ID",
            "Delete a category by ID",
        ],
        "Sub Categories": [
            "Get all sub-categories",
            "Create a new sub-category",
            "Get a sub-category by ID",
            "Update a sub-category by ID",
            "Delete a sub-category by ID",
        ],
        "Units of Measure": [
            "Get all units of measure",
            "Create a new unit of measure",
            "Get a unit of measure by ID",
            "Update a unit of measure by ID",
            "Delete a unit of measure by ID",
        ],
        "Academic Session Terms": [
            "Get all academic session terms",
            "Create a new academic session term",
            "Get an academic session term by ID",
            "Update an academic session term by ID",
            "Delete an academic session term by ID",
        ],
        "School Classes": [
            "Get all school classes",
            "Create a new school class",
            "Get a school class by ID",
            "Update a school class by ID",
            "Delete a school class by ID",
        ],
        "Students": [
            "Get all students",
            "Create a new student",
            "Get a student by ID",
            "Update a student by ID",
            "Delete a student by ID",
        ],
        "Class Teachers": [
            "Get all class teachers",
            "Create a new class teacher",
            "Get a class teacher by ID",
            "Update a class teacher by ID",
            "Delete a class teacher by ID",
        ],
        "Inventory Items": [
            "Get all inventory items",
            "Create a new inventory item",
            "Get an inventory item by ID",
            "Update an inventory item by ID",
            "Delete an inventory item by ID",
        ],
        "Inventory Transactions": [
            "Get all inventory transactions",
            "Create a new inventory transaction (purchase or sale or distribution or return)",
            "Get an inventory transaction by ID",
            "Update an inventory transaction by ID",
            "Delete an inventory transaction by ID",
            "Get class inventory distributions with optional filtering",
            "Distribute inventory items to the specified class",
            "Update inventory distribution by ID",
        ],
        "Inventory Summary": [
            "Get inventory summary by inventory ID",
            "Get inventory summaries for multiple items",
            "Get transaction summary by type for an inventory item",
            "Get all low stock inventory items",
            "Get distribution collection summary for class inventory and student logs",
        ],
        "Suppliers": [
            "Get all suppliers",
            "Create a new supplier",
            "Get supplier balances (credit - debit)",
            "Get a supplier by ID",
            "Update a supplier by ID",
            "Delete a supplier by ID",
        ],
        "Supplier Transactions": [
            "Get supplier transactions",
            "Create a supplier transaction",
            "Get a supplier transaction by id",
            "Update a supplier transaction",
            "Delete a supplier transaction",
            "Bulk upsert supplier transactions",
        ],
        "Class Inventory Entitlements": [
            "Get all class inventory entitlements",
            "Create a new class inventory entitlement",
            "Bulk upsert class inventory entitlements",
            "Get a class inventory entitlement by ID",
            "Update a class inventory entitlement by ID",
            "Delete a class inventory entitlement by ID",
        ],
        "Student Inventory Collection": [
            "Get all student inventory logs",
            "Create a new student inventory collection",
            "Bulk upsert student inventory collections",
            "Get a student inventory collection by ID",
            "Update a student inventory collection by ID",
            "Delete a student inventory collection by ID",
        ],
        "Auth": [
            "User login with email and password",
            "Refresh access token using refresh token",
            "Test authentication endpoint",
            "Protected endpoint requiring Supabase authentication",
        ],
        "Users": [
            "Get all users",
            "Get user by ID",
            "Create a new user",
            "Update a user by ID",
            "Delete a user by ID",
        ],
        "Notifications": [
            "Send test email",
            "Send low stock alert email",
            "Send welcome email to new user",
            "Send password reset email",
            "Send daily inventory summary email",
            "Test email service connection",
            "Get email service configuration status",
        ],
        "Roles": [
            "Get all roles",
            "Create a new role",
            "Get a role by code",
            "Update a role by code",
            "Delete a role by code",
        ],
        "Role Privileges": [
            "Get all role privileges",
            "Create a new role privilege",
            "Upsert role privileges",
            "Get a role privilege by ID",
            "Update a role privilege by ID",
            "Delete a role privilege by ID",
        ],
        "Menus": [
            "Get all menus",
            "Create a new menu",
            "Get a menu by ID",
            "Update a menu by ID",
            "Delete a menu by ID",
        ],
        "Role Menus": [
            "Get all role menus",
            "Create a new role menu",
            "Upsert role menus",
            "Get role menus by role code",
            "Update role menus by role code",
            "Delete a role menu by ID",
        ],
        "Inventory Distributions": [
            "Get all inventory distributions",
            "Create a new inventory distribution",
            "Get an inventory distribution by ID",
            "Update an inventory distribution by ID",
            "Delete an inventory distribution by ID",
        ],
    };

    const addPrivilege = () => {
        setPrivileges([
            ...privileges,
            { id: crypto.randomUUID(), module: "", description: "", status: "active" },
        ]);
    };

    const removePrivilege = (id: string) => {
        if (privileges.length === 1) return;
        setPrivileges(privileges.filter((p) => p.id !== id));
    };

    const updatePrivilege = (id: string, field: keyof PrivilegeRow, value: string) => {
        setPrivileges(
            privileges.map((p) => (p.id === id ? { ...p, [field]: value } : p))
        );
    };

    const handleTemplateToggle = (template: string) => {
        const newSelected = new Set(selectedTemplates);

        if (newSelected.has(template)) {
            newSelected.delete(template);
            const descriptionsToRemove = privilegeTemplates[template];
            setPrivileges(
                privileges.filter(
                    (p) => !(p.module === template && descriptionsToRemove.includes(p.description))
                )
            );
        } else {
            newSelected.add(template);
            const descriptions = privilegeTemplates[template];
            const newPrivileges = descriptions.map((desc) => ({
                id: crypto.randomUUID(),
                module: template,
                description: desc,
                status: "active" as PrivilegeStatus,
            }));
            setPrivileges([...privileges, ...newPrivileges]);
        }

        setSelectedTemplates(newSelected);
    };

    const handleSelectAll = () => {
        const allTemplates = Object.keys(privilegeTemplates);
        const allSelected = new Set(allTemplates);
        setSelectedTemplates(allSelected);

        const allPrivileges: PrivilegeRow[] = [];
        allTemplates.forEach((template) => {
            const descriptions = privilegeTemplates[template];
            descriptions.forEach((desc) => {
                allPrivileges.push({
                    id: crypto.randomUUID(),
                    module: template,
                    description: desc,
                    status: "active" as PrivilegeStatus,
                });
            });
        });
        setPrivileges(allPrivileges);
    };

    const handleClearAll = () => {
        setSelectedTemplates(new Set());
        setPrivileges([{ id: crypto.randomUUID(), module: "", description: "", status: "active" }]);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedRole) {
            toast.error("Please select a role");
            return;
        }

        const validPrivileges = privileges.filter((p) => p.description.trim());
        if (validPrivileges.length === 0) {
            toast.error("Please add at least one privilege");
            return;
        }

        // Group privileges by module and convert status to boolean
        const groupedPrivileges: Record<string, { description: string; status: boolean }[]> = {};
        validPrivileges.forEach((p) => {
            if (!groupedPrivileges[p.module]) groupedPrivileges[p.module] = [];
            groupedPrivileges[p.module].push({
                description: p.description,
                status: p.status === "active",
            });
        });

        const payload = {
            role: selectedRole,
            privileges: groupedPrivileges,
            mode: upsertMode, // ✅ Pass the mode to parent
        };

        onSubmit(payload);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-semibold text-gray-900">
                            Bulk Upsert Role Privileges
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Add or update multiple privileges for a role at once
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

                        {/* ✅ NEW: Mode Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Update Mode *
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setUpsertMode('merge')}
                                    className={`p-4 border-2 rounded-lg text-left transition ${upsertMode === 'merge'
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Plus className="w-5 h-5 text-blue-600" />
                                        <span className="font-medium">Merge (Add/Update)</span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Add new privileges and update existing ones. Keeps other privileges intact.
                                    </p>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUpsertMode('replace')}
                                    className={`p-4 border-2 rounded-lg text-left transition ${upsertMode === 'replace'
                                        ? 'border-red-500 bg-red-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <RefreshCw className="w-5 h-5 text-red-600" />
                                        <span className="font-medium">Replace (Start Fresh)</span>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        Delete ALL existing privileges and replace with these ones only.
                                    </p>
                                </button>
                            </div>
                        </div>

                        {/* Template Checkboxes */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Load Templates (Optional)
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
                            <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto bg-gray-50">
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.keys(privilegeTemplates).map((template) => (
                                        <label
                                            key={template}
                                            className="flex items-center gap-2 cursor-pointer hover:bg-white p-2 rounded transition"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedTemplates.has(template)}
                                                onChange={() => handleTemplateToggle(template)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{template}</span>
                                            <span className="text-xs text-gray-500">
                                                ({privilegeTemplates[template].length})
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Selected {selectedTemplates.size} template(s) with {privileges.filter(p => p.description.trim()).length} privilege(s)
                            </p>
                        </div>

                        {/* Privileges List */}
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                    Privileges * (You can edit or add more)
                                </label>
                                <button
                                    type="button"
                                    onClick={addPrivilege}
                                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Row
                                </button>
                            </div>

                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {privileges.map((privilege, index) => (
                                    <div key={privilege.id} className="flex gap-2 items-start">
                                        <span className="text-sm text-gray-500 mt-2 w-8">{index + 1}.</span>
                                        <input
                                            type="text"
                                            value={privilege.description}
                                            onChange={(e) =>
                                                updatePrivilege(privilege.id, "description", e.target.value)
                                            }
                                            placeholder="e.g., Get all brands"
                                            className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <select
                                            value={privilege.status}
                                            onChange={(e) =>
                                                updatePrivilege(privilege.id, "status", e.target.value)
                                            }
                                            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removePrivilege(privilege.id)}
                                            disabled={privileges.length === 1}
                                            className="text-red-600 hover:text-red-800 p-2 disabled:opacity-30 disabled:cursor-not-allowed"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className={`border rounded-md p-4 mt-4 ${upsertMode === 'replace'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-blue-50 border-blue-200'
                            }`}>
                            <p className={`text-sm ${upsertMode === 'replace' ? 'text-red-800' : 'text-blue-800'
                                }`}>
                                <strong>{upsertMode === 'replace' ? '⚠️ Warning:' : 'ℹ️ Note:'}</strong>{' '}
                                {upsertMode === 'replace'
                                    ? 'This will DELETE all existing privileges for this role and replace them with only the ones listed above.'
                                    : 'This will add new privileges or update existing ones. Other privileges for this role will remain unchanged.'
                                }
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
                            className={`px-4 py-2 text-white rounded-md transition disabled:opacity-50 flex items-center gap-2 ${upsertMode === 'replace'
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-gray-700 hover:bg-gray-800'
                                }`}
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    {upsertMode === 'replace' ? 'Replacing...' : 'Upserting...'}
                                </>
                            ) : (
                                <>
                                    {upsertMode === 'replace' ? <RefreshCw className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                                    {upsertMode === 'replace' ? 'Replace All' : 'Upsert'} ({privileges.filter((p) => p.description.trim()).length} Privilege(s))
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}