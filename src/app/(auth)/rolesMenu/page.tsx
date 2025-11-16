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

export default function RoleMenusPage() {
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
      console.error("Failed to load roles:", err);
      toast.error("Failed to load roles");
    }
  };

  // Load menus
  const loadMenus = async () => {
    try {
      const data = await menusApi.getAll();
      setMenus(data);
    } catch (err) {
      console.error("Failed to load menus:", err);
      toast.error("Failed to load menus");
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
      console.error("Failed to load role-menu assignments:", err);
      toast.error("Failed to load assignments");
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
    if (!filteredRoleMenus.length) return toast.error("No data to export!");

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
    saveAs(blob, `role_menus_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Spreadsheet exported successfully!");
  };

  // Form submit (create/update)
  const handleFormSubmit = async (
    data: CreateRoleMenuPayload | UpdateRoleMenuPayload
  ) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingRoleMenu ? "Updating assignment..." : "Creating assignment..."
    );
    try {
      if (editingRoleMenu)
        await roleMenusApi.update(editingRoleMenu.id, data as UpdateRoleMenuPayload);
      else await roleMenusApi.create(data as CreateRoleMenuPayload);

      toast.success(editingRoleMenu ? "Assignment updated!" : "Assignment created!");
      setShowForm(false);
      setEditingRoleMenu(null);
      await loadRoleMenus(selectedRole);
    } catch (err) {
      console.error("Form submission failed:", err);
      toast.error("Failed to save assignment");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  // Delete handlers
  const handleDeleteRequest = (roleMenu: RoleMenu) => {
    setDeletingRoleMenu(roleMenu);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingRoleMenu) return;
    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting assignment...");
    try {
      await roleMenusApi.delete(deletingRoleMenu.id);
      toast.success("Assignment deleted!");
      setShowDeleteModal(false);
      setDeletingRoleMenu(null);
      await loadRoleMenus(selectedRole);
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete assignment");
    } finally {
      toast.dismiss(loadingToast);
      setIsDeleting(false);
    }
  };

  // Bulk assign
  const handleBulkAssign = async (payload: {
    role_code: string;
    menu_ids: string[];
  }) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("Bulk assigning menus...");

    try {
      await roleMenusApi.bulkAssign(payload);
      toast.success("Bulk assignment successful!");
      setShowBulkAssignModal(false);
      await loadRoleMenus(selectedRole);
    } catch (err) {
      console.error("Bulk assign failed:", err);
      toast.error("Failed to bulk assign menus");
    } finally {
      toast.dismiss(loadingToast);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoleMenu(null);
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
          <RoleMenusStats roleMenus={roleMenus} />

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
              <button
                onClick={() => {
                  setEditingRoleMenu(null);
                  setShowForm(true);
                }}
                className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
              >
                <Plus className="w-5 h-5" /> Assign Menu
              </button>
              <button
                onClick={() => setShowBulkAssignModal(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
              >
                <Upload className="w-5 h-5" /> Bulk Assign
              </button>
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
            onEdit={(roleMenu) => {
              setEditingRoleMenu(roleMenu);
              setShowForm(true);
            }}
            onDelete={handleDeleteRequest}
            onRefresh={() => loadRoleMenus(selectedRole)}
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
                toast("Delete canceled", { icon: "ℹ️" });
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
                toast("Bulk assign canceled", { icon: "ℹ️" });
              }}
              isSubmitting={isSubmitting}
            />
          )}
        </div>
      </Container>
    </div>
  );
}