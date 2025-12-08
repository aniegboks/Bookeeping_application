"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, Upload } from "lucide-react";

// API
import { rolePrivilegesApi } from "@/lib/roles_privilage";
import { rolesApi } from "@/lib/roles";

// Types
import {
  RolePrivilege,
  CreateRolePrivilegePayload,
  UpdateRolePrivilegePayload,
  GroupedPrivileges,
} from "@/lib/types/roles_privilage";
import { Role } from "@/lib/types/roles";

// Components
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import RolePrivilegesTable from "@/components/roles_privilage/table";
import RolePrivilegeForm from "@/components/roles_privilage/form";
import DeleteRolePrivilegeModal from "@/components/roles_privilage/delete_modal";
import StatsCards from "@/components/roles_privilage/stats_card";
import BulkUpsertModal from "@/components/roles_privilage/bulk_upsert";

// Permissions
import { useUser } from "@/contexts/UserContext";

export default function RolePrivilegesPage() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
  const canCreate = canPerformAction("RolePrivileges", "create");
  const canUpdate = canPerformAction("RolePrivileges", "update");
  const canDelete = canPerformAction("RolePrivileges", "delete");

  const [privileges, setPrivileges] = useState<RolePrivilege[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<RolePrivilege | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingPrivilege, setDeletingPrivilege] = useState<RolePrivilege | null>(null);
  const [showBulkUpsertModal, setShowBulkUpsertModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [privilegesPerPage] = useState(8);

  // Load all roles
  const loadRoles = async () => {
    try {
      const data = await rolesApi.getAll();
      setRoles(data);
    } catch (err) {
      console.error("Failed to load roles:", err);
      toast.error("Failed to load roles");
    }
  };

  // Load privileges (optionally filtered by role)
  const loadPrivileges = async (roleCode?: string) => {
    try {
      setLoading(true);
      
      // Fetch privileges - with or without role filter
      const data = await rolePrivilegesApi.getAll(roleCode);

      if (Array.isArray(data)) {
        // Direct array response with real IDs
        const normalized = (data as RolePrivilege[]).map((priv) => ({
          ...priv,
          status: String(priv.status).toLowerCase() === "active" ? "active" : "inactive",
        }));
        setPrivileges(normalized);
      } else if (data && typeof data === "object" && "privileges" in data) {
        // Grouped response format - store module info in ID
        const groupedData = data as GroupedPrivileges;

        const flatPrivileges: RolePrivilege[] = [];
        Object.entries(groupedData.privileges).forEach(([moduleName, items]) => {
          items.forEach((item, index) => {
            flatPrivileges.push({
              id: `${roleCode || 'all'}:${moduleName}:${index}`, // Format: ROLE:MODULE:INDEX
              role_code: roleCode || "",
              description: item.description,
              status: String(item.status).toLowerCase() === "active" ? "active" : "inactive",
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          });
        });
        setPrivileges(flatPrivileges);
      } else {
        setPrivileges([]);
      }
    } catch (err) {
      console.error("Failed to load privileges:", err);
      toast.error("Failed to load privileges");
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadPrivileges();
  }, []);

  useEffect(() => {
    if (selectedRole) loadPrivileges(selectedRole);
    else loadPrivileges();
  }, [selectedRole]);

  // Filter + paginate
  const filteredPrivileges = useMemo(
    () =>
      privileges.filter(
        (priv) =>
          priv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          priv.role_code.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [privileges, searchTerm]
  );

  const totalPages = Math.ceil(filteredPrivileges.length / privilegesPerPage);
  const startIdx = (currentPage - 1) * privilegesPerPage;
  const paginatedPrivileges = filteredPrivileges.slice(startIdx, startIdx + privilegesPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredPrivileges.length) return toast.error("No data to export!");

    const dataToExport = filteredPrivileges.map((p) => ({
      "Role Code": p.role_code,
      Description: p.description,
      Status: p.status,
      "Created At": new Date(p.created_at).toLocaleString(),
      "Updated At": new Date(p.updated_at).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Role Privileges");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `role_privileges_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Spreadsheet exported successfully!");
  };

  // Handle inline update - sends changes to backend
  const handleUpdatePrivilege = async (
    id: string,
    updates: Partial<RolePrivilege>
  ) => {
    // Check permission before updating
    if (!canUpdate) {
      toast.error("You don't have permission to update privileges");
      throw new Error("No update permission");
    }

    try {
      // Find the privilege by ID
      const privilege = privileges.find(p => p.id === id);
      
      if (!privilege) {
        toast.error("Privilege not found");
        throw new Error("Privilege not found");
      }

      // If no role selected, can't update
      if (!selectedRole) {
        toast.error("Please select a specific role to edit privileges", { duration: 4000 });
        throw new Error("No role selected");
      }

      // Extract module from ID (format: ROLE:MODULE:INDEX)
      const idParts = id.split(':');
      const moduleName = idParts[1] || 'Unknown';

      // Build upsert payload with the module as key
      const upsertPayload = {
        role: selectedRole,
        privileges: {
          [moduleName]: [
            {
              description: updates.description || privilege.description,
              status: (updates.status || privilege.status) === 'active',
            }
          ]
        }
      };

      // Use bulk upsert endpoint to update
      await rolePrivilegesApi.bulkUpsert(upsertPayload);

      // Reload privileges to get fresh data from backend
      await loadPrivileges(selectedRole);

    } catch (error) {
      console.error("Error updating privilege:", error);
      throw error;
    }
  };

  // Open edit form
  const handleEditClick = (privilege: RolePrivilege) => {
    // Check permission before opening form
    if (!canUpdate) {
      toast.error("You don't have permission to update privileges");
      return;
    }
    if (!selectedRole) {
      toast.error("Please select a specific role to edit privileges", { duration: 4000 });
      return;
    }
    setEditingPrivilege(privilege);
    setShowForm(true);
  };

  // Form submit (create/update)
  const handleFormSubmit = async (data: CreateRolePrivilegePayload | UpdateRolePrivilegePayload) => {
    // Double-check permissions before submitting
    if (editingPrivilege && !canUpdate) {
      toast.error("You don't have permission to update privileges");
      return;
    }
    if (!editingPrivilege && !canCreate) {
      toast.error("You don't have permission to create privileges");
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(editingPrivilege ? "Updating privilege..." : "Creating privilege...");
    try {
      if (editingPrivilege) await rolePrivilegesApi.update(editingPrivilege.id, data as UpdateRolePrivilegePayload);
      else await rolePrivilegesApi.create(data as CreateRolePrivilegePayload);

      toast.success(editingPrivilege ? "Privilege updated!" : "Privilege created!");
      setShowForm(false);
      setEditingPrivilege(null);
      await loadPrivileges(selectedRole);
    } catch (err) {
      console.error("Form submission failed:", err);
      toast.error("Failed to save privilege");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteRequest = (privilege: RolePrivilege) => {
    // Check permission before opening delete modal
    if (!canDelete) {
      toast.error("You don't have permission to delete privileges");
      return;
    }
    if (!selectedRole) {
      toast.error("Please select a specific role to delete privileges", { duration: 4000 });
      return;
    }
    
    setDeletingPrivilege(privilege);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingPrivilege) return;
    
    // Double-check permission before deleting
    if (!canDelete) {
      toast.error("You don't have permission to delete privileges");
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting privilege...");
    try {
      await rolePrivilegesApi.delete(deletingPrivilege.id);
      toast.success("Privilege deleted!");
      setShowDeleteModal(false);
      setDeletingPrivilege(null);
      await loadPrivileges(selectedRole);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete privilege");
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  // Bulk upsert
  const handleBulkUpsertClick = () => {
    // Check permission before opening bulk upsert modal
    if (!canCreate && !canUpdate) {
      toast.error("You don't have permission to manage privileges");
      return;
    }
    setShowBulkUpsertModal(true);
  };

  const handleBulkUpsert = async (payload: {
    role: string;
    privileges: Record<string, { description: string; status: boolean }[]>;
    mode: 'merge' | 'replace';
  }) => {
    const { role, privileges, mode } = payload;

    // Check permissions based on mode
    if (mode === 'replace' && !canDelete) {
      toast.error("You don't have permission to replace privileges (requires delete permission)");
      return;
    }
    if (!canCreate && !canUpdate) {
      toast.error("You don't have permission to manage privileges");
      return;
    }

    if (!role || Object.keys(privileges).length === 0)
      return toast.error("Select role and add privileges");

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      mode === 'replace' ? "Replacing all privileges..." : "Bulk upserting privileges..."
    );

    try {
      // Transform boolean status to "active"/"inactive" for backend
      const backendPayload: Record<string, { description: string; status: "active" | "inactive" }[]> = {};

      Object.entries(privileges).forEach(([resource, items]) => {
        backendPayload[resource] = items.map((item) => ({
          description: item.description,
          status: item.status ? "active" : "inactive",
        }));
      });

      await rolePrivilegesApi.bulkUpsert({ role, privileges: backendPayload });

      toast.success(
        mode === 'replace' 
          ? "All privileges replaced successfully!" 
          : "Bulk upsert successful!"
      );
      setShowBulkUpsertModal(false);
      await loadPrivileges(selectedRole);
    } catch (err) {
      console.error("Bulk upsert failed:", err);
      toast.error("Failed to bulk upsert privileges");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPrivilege(null);
    toast("Action canceled", { icon: "ℹ️" });
  };

  if (initialLoading)
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );

  return (
    <div className="mx-6">
      <Container>
        <div className="mt-2 pb-8">

          <div className="flex justify-between items-center mb-4 mt-8 gap-4">
            <div className="flex gap-3 flex-1 items-center">
              <input
                type="text"
                placeholder="Search privileges..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 w-64 focus:ring focus:ring-blue-100"
              />
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:ring focus:ring-blue-100"
              >
                <option value="">All Roles</option>
                {roles.map((role) => (
                  <option key={role.code} value={role.code}>
                    {role.name}
                  </option>
                ))}
              </select>
              {selectedRole && (canUpdate || canDelete) && (
                <span className="text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                  ✓ Editing enabled for {selectedRole}
                </span>
              )}
              {!selectedRole && (canUpdate || canDelete) && (
                <span className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
                  ⓘ Select a role to enable editing
                </span>
              )}
            </div>
            <div className="flex gap-3">
              {/* Only show Bulk Upsert button if user has create or update permission */}
              {(canCreate || canUpdate) && (
                <button
                  onClick={handleBulkUpsertClick}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
                >
                  <Upload className="w-5 h-5" /> Bulk Upsert
                </button>
              )}
              <button
                onClick={handleExport}
                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
              >
                <Download className="w-5 h-5" /> Export
              </button>
            </div>
          </div>

          <RolePrivilegesTable
            privileges={paginatedPrivileges}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteRequest}
            onUpdate={handleUpdatePrivilege}
            onRefresh={() => loadPrivileges(selectedRole)}
            // Pass permissions to the table
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 border rounded disabled:opacity-50">
                  Prev
                </button>
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">
                  Next
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <RolePrivilegeForm
              privilege={editingPrivilege || undefined}
              roles={roles}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          )}

          {showDeleteModal && deletingPrivilege && (
            <DeleteRolePrivilegeModal
              privilegeId={deletingPrivilege.id}
              description={deletingPrivilege.description}
              roleCode={deletingPrivilege.role_code}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingPrivilege(null);
                toast("Delete canceled", { icon: "ℹ️" });
              }}
              isDeleting={isDeleting}
            />
          )}

          {showBulkUpsertModal && (
            <BulkUpsertModal
              roles={roles}
              onSubmit={handleBulkUpsert}
              onCancel={() => {
                setShowBulkUpsertModal(false);
                toast("Bulk upsert canceled", { icon: "ℹ️" });
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </Container>
    </div>
  );
}