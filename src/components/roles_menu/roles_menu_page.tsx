"use client";

import { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, Upload, Plus } from "lucide-react";

// API
import { roleMenusApi, menusApi } from "@/lib/roles_menu";
import { rolesApi } from "@/lib/roles";

// Types
import {
  RoleMenu,
  CreateRoleMenuPayload,
  UpdateRoleMenuPayload,
  Menu,
} from "@/lib/types/roles_menu";
import { Role } from "@/lib/types/roles";

// Components
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import RoleMenusTable from "@/components/roles_menu/table";
import RoleMenuForm from "@/components/roles_menu/form";
import DeleteRoleMenuModal from "@/components/roles_menu/delete_modal";
import RoleMenusStats from "@/components/roles_menu/stats_card";
import BulkAssignModal from "@/components/roles_menu/bulk_upsert";

// Permissions
import { useUser } from "@/contexts/UserContext";

export default function RoleMenusPage() {
  // Get permission checker from UserContext
  const { canPerformAction } = useUser();
  
  // Check permissions for different actions
  const canCreate = canPerformAction("RoleMenus", "create");
  const canUpdate = canPerformAction("RoleMenus", "update");
  const canDelete = canPerformAction("RoleMenus", "delete");

  const [roleMenus, setRoleMenus] = useState<RoleMenu[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingRoleMenu, setEditingRoleMenu] = useState<RoleMenu | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingRoleMenu, setDeletingRoleMenu] = useState<RoleMenu | null>(null);
  const [showBulkAssignModal, setShowBulkAssignModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Load roles
  const loadRoles = async () => {
    try {
      const data = await rolesApi.getAll();
      setRoles(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load roles. Please refresh the page and try again.";
      console.error("Failed to load roles:", err);
      toast.error(message, { duration: 5000 });
    }
  };

  // Load menus
  const loadMenus = async () => {
    try {
      const data = await menusApi.getAll();
      setMenus(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load available menus. Please refresh the page and try again.";
      console.error("Failed to load menus:", err);
      toast.error(message, { duration: 5000 });
    }
  };

  // Load role-menu assignments
  const loadRoleMenus = async (roleCode?: string) => {
    try {
      setLoading(true);
      const data = roleCode
        ? await roleMenusApi.getByRoleCode(roleCode)
        : await roleMenusApi.getAll();
      setRoleMenus(data);
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : roleCode 
          ? `Failed to load menu assignments for the selected role. Please try again.`
          : "Failed to load menu assignments. Please refresh the page and try again.";
      console.error("Failed to load role-menu assignments:", err);
      toast.error(message, { duration: 5000 });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadMenus();
    loadRoleMenus();
  }, []);

  useEffect(() => {
    if (selectedRole) loadRoleMenus(selectedRole);
    else loadRoleMenus();
  }, [selectedRole]);

  // Filter + paginate
  const filteredRoleMenus = useMemo(
    () =>
      roleMenus.filter(
        (rm) =>
          rm.role_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rm.role?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rm.menu?.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          rm.menu?.route?.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [roleMenus, searchTerm]
  );

  const totalPages = Math.ceil(filteredRoleMenus.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const paginatedRoleMenus = filteredRoleMenus.slice(startIdx, startIdx + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Export to Excel
  const handleExport = () => {
    if (!filteredRoleMenus.length) {
      toast.error("No menu assignments available to export. Please assign menus to roles first.", { duration: 4000 });
      return;
    }

    try {
      const dataToExport = filteredRoleMenus.map((rm) => ({
        "Role Code": rm.role_code,
        "Role Name": rm.role?.name || "N/A",
        "Menu Caption": rm.menu?.caption || "N/A",
        "Menu Route": rm.menu?.route || "N/A",
        "Assignment ID": rm.id,
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Role Menus");

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      const fileName = `role_menus_${new Date().toISOString().slice(0, 10)}.xlsx`;
      saveAs(blob, fileName);
      
      toast.success(`Successfully exported ${filteredRoleMenus.length} menu assignments to ${fileName}`, { duration: 4000 });
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export data. Please try again or contact support if the problem persists.", { duration: 5000 });
    }
  };

  // Open create form
  const handleCreateClick = () => {
    if (!canCreate) {
      toast.error("Access denied. You do not have permission to assign menus to roles. Please contact your administrator for access.", { duration: 5000 });
      return;
    }
    setEditingRoleMenu(null);
    setShowForm(true);
  };

  // Open edit form
  const handleEditClick = (roleMenu: RoleMenu) => {
    if (!canUpdate) {
      toast.error("Access denied. You do not have permission to update menu assignments. Please contact your administrator for access.", { duration: 5000 });
      return;
    }
    setEditingRoleMenu(roleMenu);
    setShowForm(true);
  };

  // Form submit (create/update)
  const handleFormSubmit = async (
    data: CreateRoleMenuPayload | UpdateRoleMenuPayload
  ) => {
    if (editingRoleMenu && !canUpdate) {
      toast.error("Access denied. You do not have permission to update menu assignments.", { duration: 5000 });
      return;
    }
    if (!editingRoleMenu && !canCreate) {
      toast.error("Access denied. You do not have permission to assign menus to roles.", { duration: 5000 });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingRoleMenu ? "Updating menu assignment..." : "Creating new menu assignment..."
    );
    
    try {
      if (editingRoleMenu) {
        await roleMenusApi.update(editingRoleMenu.id, data as UpdateRoleMenuPayload);
        toast.success(
          `Successfully updated menu assignment for ${editingRoleMenu.role?.name || editingRoleMenu.role_code}`,
          { duration: 4000 }
        );
      } else {
        await roleMenusApi.create(data as CreateRoleMenuPayload);
        toast.success(
          "Successfully assigned menu to role. Users with this role can now access the menu.",
          { duration: 4000 }
        );
      }
      
      setShowForm(false);
      setEditingRoleMenu(null);
      await loadRoleMenus(selectedRole);
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : editingRoleMenu 
          ? "Failed to update menu assignment. Please verify your changes and try again."
          : "Failed to create menu assignment. Please check your input and try again.";
      console.error("Form submission failed:", err);
      toast.error(message, { duration: 6000 });
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteRequest = (roleMenu: RoleMenu) => {
    if (!canDelete) {
      toast.error("Access denied. You do not have permission to delete menu assignments. Please contact your administrator for access.", { duration: 5000 });
      return;
    }
    setDeletingRoleMenu(roleMenu);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRoleMenu) return;
    
    if (!canDelete) {
      toast.error("Access denied. You do not have permission to delete menu assignments.", { duration: 5000 });
      return;
    }

    setIsDeleting(true);
    const loadingToast = toast.loading("Removing menu assignment...");
    
    try {
      await roleMenusApi.delete(deletingRoleMenu.id);
      toast.success(
        `Successfully removed ${deletingRoleMenu.menu?.caption || "menu"} from ${deletingRoleMenu.role?.name || deletingRoleMenu.role_code}. Users with this role will no longer see this menu.`,
        { duration: 4000 }
      );
      setShowDeleteModal(false);
      setDeletingRoleMenu(null);
      await loadRoleMenus(selectedRole);
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : "Failed to delete menu assignment. The assignment may have already been removed. Please refresh the page.";
      console.error("Delete failed:", err);
      toast.error(message, { duration: 6000 });
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  // Bulk assign
  const handleBulkAssignClick = () => {
    if (!canCreate) {
      toast.error("Access denied. You do not have permission to bulk assign menus. Please contact your administrator for access.", { duration: 5000 });
      return;
    }
    setShowBulkAssignModal(true);
  };

  const handleBulkAssign = async (payload: {
    role_code: string;
    menu_ids: string[];
  }) => {
    if (!canCreate) {
      toast.error("Access denied. You do not have permission to bulk assign menus.", { duration: 5000 });
      return;
    }

    setIsSubmitting(true);
    const loadingToast = toast.loading(`Assigning ${payload.menu_ids.length} menus to role...`);

    try {
      await roleMenusApi.bulkAssign(payload);
      const roleName = roles.find(r => r.code === payload.role_code)?.name || payload.role_code;
      toast.success(
        `Successfully assigned ${payload.menu_ids.length} menus to ${roleName}. Users with this role can now access these menus.`,
        { duration: 5000 }
      );
      setShowBulkAssignModal(false);
      await loadRoleMenus(selectedRole);
    } catch (err) {
      const message = err instanceof Error 
        ? err.message 
        : "Failed to bulk assign menus. Some menus may already be assigned to this role. Please review your selection and try again.";
      console.error("Bulk assign failed:", err);
      toast.error(message, { duration: 6000 });
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoleMenu(null);
    toast("Operation canceled. No changes were made.", { duration: 3000 });
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
            <div className="flex gap-3 flex-1">
              <input
                type="text"
                placeholder="Search role-menu assignments..."
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
            </div>
            <div className="flex gap-3">
              {canCreate && (
                <button
                  onClick={handleCreateClick}
                  className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
                >
                  <Plus className="w-5 h-5" /> Assign Menu
                </button>
              )}
              {canCreate && (
                <button
                  onClick={handleBulkAssignClick}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
                >
                  <Upload className="w-5 h-5" /> Bulk Assign
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

          <RoleMenusTable
            roleMenus={paginatedRoleMenus}
            loading={loading}
            onEdit={handleEditClick}
            onDelete={handleDeleteRequest}
            onRefresh={() => loadRoleMenus(selectedRole)}
            canUpdate={canUpdate}
            canDelete={canDelete}
          />

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4 text-sm">
              <p className="text-gray-600">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {showForm && (
            <RoleMenuForm
              roleMenu={editingRoleMenu || undefined}
              roles={roles}
              menus={menus}
              onSubmit={handleFormSubmit}
              onCancel={handleCancel}
              isSubmitting={isSubmitting}
            />
          )}

          {showDeleteModal && deletingRoleMenu && (
            <DeleteRoleMenuModal
              roleMenuId={deletingRoleMenu.id}
              roleCode={deletingRoleMenu.role_code}
              menuCaption={deletingRoleMenu.menu?.caption || "Unknown"}
              onConfirm={confirmDelete}
              onCancel={() => {
                setShowDeleteModal(false);
                setDeletingRoleMenu(null);
                toast("Delete operation canceled. No changes were made.", { duration: 3000 });
              }}
              isDeleting={isDeleting}
            />
          )}

          {showBulkAssignModal && (
            <BulkAssignModal
              roles={roles}
              menus={menus}
              onSubmit={handleBulkAssign}
              onCancel={() => {
                setShowBulkAssignModal(false);
                toast("Bulk assign operation canceled. No changes were made.", { duration: 3000 });
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </Container>
    </div>
  );
}