"use client";

import { useState } from "react";
import { X, Plus, Trash2, Upload } from "lucide-react";
import { Role } from "@/lib/types/roles";
import { PrivilegeStatus } from "@/lib/types/roles_privilage";

interface PrivilegeRow {
  id: string;
  description: string;
  status: PrivilegeStatus;
}

interface BulkUpsertModalProps {
  roles: Role[];
  onSubmit: (roleCode: string, privileges: { description: string; status: PrivilegeStatus }[]) => void;
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
  const [privileges, setPrivileges] = useState<PrivilegeRow[]>([
    { id: crypto.randomUUID(), description: "", status: "inactive" },
  ]);
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set());

  const addPrivilege = () => {
    setPrivileges([
      ...privileges,
      { id: crypto.randomUUID(), description: "", status: "inactive" },
    ]);
  };

  const removePrivilege = (id: string) => {
    if (privileges.length === 1) return;
    setPrivileges(privileges.filter((p) => p.id !== id));
  };

  const updatePrivilege = (id: string, field: keyof PrivilegeRow, value: string) => {
    setPrivileges(
      privileges.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedRole) {
      alert("Please select a role");
      return;
    }

    const validPrivileges = privileges.filter((p) => p.description.trim());
    if (validPrivileges.length === 0) {
      alert("Please add at least one privilege with a description");
      return;
    }

    // Remove empty privilege if it exists
    const cleanPrivileges = validPrivileges.filter(p => p.description.trim() !== "");
    
    onSubmit(
      selectedRole,
      cleanPrivileges.map(({ description, status }) => ({ description, status }))
    );
  };

  // Predefined privilege templates
  const privilegeTemplates = {
    "Academic Session": ["View Academic Sessions", "Create Academic Session", "Edit Academic Session", "Delete Academic Session"],
    "Brands": ["View Brands", "Create Brand", "Edit Brand", "Delete Brand"],
    "Categories": ["View Categories", "Create Category", "Edit Category", "Delete Category"],
    "Sub Categories": ["View Sub Categories", "Create Sub Category", "Edit Sub Category", "Delete Sub Category"],
    "Units of Measure": ["View UOMs", "Create UOM", "Edit UOM", "Delete UOM"],
    "Inventory Items": ["View Inventory Items", "Create Inventory Item", "Edit Inventory Item", "Delete Inventory Item"],
    "Inventory Entitlement": ["View Entitlements", "Create Entitlement", "Edit Entitlement", "Delete Entitlement"],
    "Suppliers": ["View Suppliers", "Create Supplier", "Edit Supplier", "Delete Supplier"],
    "Users": ["View Users", "Create User", "Edit User", "Delete User", "Reset User Password"],
    "Classes": ["View Classes", "Create Class", "Edit Class", "Delete Class"],
    "Class Teachers": ["View Class Teachers", "Assign Class Teacher", "Remove Class Teacher"],
    "Purchase": ["View Purchases", "Create Purchase", "Edit Purchase", "Delete Purchase", "Approve Purchase"],
    "Students": ["View Students", "Create Student", "Edit Student", "Delete Student"],
    "Student Collection": ["View Student Collections", "Record Collection", "Edit Collection", "Delete Collection"],
    "Inventory Distributions": ["View Distributions", "Create Distribution", "Edit Distribution", "Delete Distribution"],
    "Inventory Summary": ["View Inventory Summary", "Export Inventory Report"],
    "Students Report": ["View Student Reports", "Export Student Reports"],
    "Supplier Transaction": ["View Supplier Transactions", "Record Transaction", "Edit Transaction", "Delete Transaction"],
    "Roles": ["View Roles", "Create Role", "Edit Role", "Delete Role"],
  };

  const handleTemplateToggle = (template: string) => {
    const newSelected = new Set(selectedTemplates);
    
    if (newSelected.has(template)) {
      // Remove template privileges
      newSelected.delete(template);
      const descriptionsToRemove = privilegeTemplates[template as keyof typeof privilegeTemplates];
      setPrivileges(privileges.filter(p => !descriptionsToRemove.includes(p.description)));
    } else {
      // Add template privileges with active status
      newSelected.add(template);
      const descriptions = privilegeTemplates[template as keyof typeof privilegeTemplates];
      const newPrivileges = descriptions.map((desc) => ({
        id: crypto.randomUUID(),
        description: desc,
        status: "active" as PrivilegeStatus, // Active when allocated from template
      }));
      setPrivileges([...privileges, ...newPrivileges]);
    }
    
    setSelectedTemplates(newSelected);
  };

  const handleSelectAll = () => {
    const allTemplates = Object.keys(privilegeTemplates);
    const allSelected = new Set(allTemplates);
    setSelectedTemplates(allSelected);
    
    // Add all privileges from all templates with active status
    const allPrivileges: PrivilegeRow[] = [];
    allTemplates.forEach(template => {
      const descriptions = privilegeTemplates[template as keyof typeof privilegeTemplates];
      descriptions.forEach(desc => {
        allPrivileges.push({
          id: crypto.randomUUID(),
          description: desc,
          status: "active" as PrivilegeStatus, // Active when allocated
        });
      });
    });
    setPrivileges(allPrivileges);
  };

  const handleClearAll = () => {
    setSelectedTemplates(new Set());
    setPrivileges([
      { id: crypto.randomUUID(), description: "", status: "inactive" },
    ]);
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
                {roles && roles.length > 0 ? (
                  roles.map((role) => (
                    <option key={role.code} value={role.code}>
                      {role.name} ({role.code})
                    </option>
                  ))
                ) : (
                  <option disabled>No roles available</option>
                )}
              </select>
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
                        ({privilegeTemplates[template as keyof typeof privilegeTemplates].length})
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Selected {selectedTemplates.size} template(s) with {privileges.filter(p => p.description.trim()).length} privilege(s). 
                Templates default to <span className="font-semibold text-green-600">Active</span>, empty rows to <span className="font-semibold text-gray-600">Inactive</span>.
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
                    <span className="text-sm text-gray-500 mt-2 w-8">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={privilege.description}
                      onChange={(e) =>
                        updatePrivilege(privilege.id, "description", e.target.value)
                      }
                      placeholder="e.g., View Users"
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
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> This operation will insert new privileges or update
                existing ones based on the role code and description combination. Existing
                privileges with matching role and description will have their status updated.
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
                  Upserting...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upsert {privileges.filter(p => p.description.trim()).length} Privilege(s)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}