"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useUser } from "@/contexts/UserContext";
import { User } from "@/lib/types/user";
import { userApi } from "@/lib/user";
import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/user_id/stats_card";
import Controls from "@/components/user_id/controls";
import UserTable from "@/components/user_id/table";
import UserForm from "@/components/user_id/form";
import DeleteModal from "@/components/user_id/delete_modal";
import Trends from "@/components/user_id/trends";
import { CreateUserInput, UpdateUserInput } from "@/lib/types/user";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";
import { Role } from "@/lib/types/roles";
import { rolesApi } from "@/lib/roles";

export default function UsersPage() {
  const { canPerformAction } = useUser();
  
  const canCreate = canPerformAction("Users", "create");
  const canUpdate = canPerformAction("Users", "update");
  const canDelete = canPerformAction("Users", "delete");

  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load roles
  const loadRoles = async () => {
    try {
      const data = await rolesApi.getAll();
      const activeRoles = data.filter(role => role.status === "active");
      setRoles(activeRoles);
    } catch (err: unknown) {
      console.error("Failed to load roles:", err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : "Unable to load roles. Please refresh the page or contact support.";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
      
      // Only show success on initial load
      if (initialLoading) {
        toast.success(`Successfully loaded ${data.length} user${data.length !== 1 ? 's' : ''}`);
      }
    } catch (err: unknown) {
      console.error("Failed to load users:", err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : "Unable to load users. Please refresh the page or contact support.";
      
      toast.error(errorMessage, {
        duration: 5000,
        position: "top-center",
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadRoles();
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.phone?.toLowerCase().includes(searchLower) ||
      user.roles?.join(", ").toLowerCase().includes(searchLower)
    );
  });

  const handleFormSubmit = async (data: CreateUserInput | UpdateUserInput) => {
    if (editingUser && !canUpdate) {
      toast.error("You don't have permission to update users");
      return;
    }
    if (!editingUser && !canCreate) {
      toast.error("You don't have permission to create users");
      return;
    }

    setIsSubmitting(true);
    const isCreating = !editingUser;
    const userName = editingUser?.name || data.name || data.email;
    const loadingToast = toast.loading(
      isCreating ? "Creating user..." : `Updating '${userName}'...`
    );

    try {
      if (editingUser) {
        const updated = await userApi.update(editingUser.id, data as UpdateUserInput);
        toast.dismiss(loadingToast);
        toast.success(`User '${updated.name || updated.email}' updated successfully!`, {
          duration: 4000,
        });
      } else {
        const created = await userApi.create(data as CreateUserInput);
        toast.dismiss(loadingToast);
        toast.success(`User '${created.name || created.email}' created successfully!`, {
          duration: 4000,
        });
      }

      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : "Unable to save user. Please check your input and try again.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    if (!canUpdate) {
      toast.error("You don't have permission to update users");
      return;
    }
    setEditingUser(user);
    setShowForm(true);
    toast(`Editing '${user.name || user.email}'`, { icon: "✏️" });
  };

  const handleDeleteRequest = (user: User) => {
    if (!canDelete) {
      toast.error("You don't have permission to delete users");
      return;
    }
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    if (!canDelete) {
      toast.error("You don't have permission to delete users");
      return;
    }

    setIsDeleting(true);
    const userName = deletingUser.name || deletingUser.email;
    const loadingToast = toast.loading(`Deleting '${userName}'...`);

    try {
      await userApi.delete(deletingUser.id);
      toast.dismiss(loadingToast);
      toast.success(`User '${userName}' deleted successfully!`, {
        duration: 4000,
      });
      setShowDeleteModal(false);
      setDeletingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      
      const errorMessage = err instanceof Error
        ? err.message
        : "Unable to delete user. Please try again or contact support.";
      
      toast.error(errorMessage, {
        duration: 6000,
        position: "top-center",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  const handleAdd = () => {
    if (!canCreate) {
      toast.error("You don't have permission to create users");
      return;
    }
    setEditingUser(null);
    setShowForm(true);
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      toast("No users to export", { icon: "⚠️" });
      return;
    }

    try {
      const dataToExport = filteredUsers.map((u) => ({
        Name: u.name || "",
        Email: u.email || "",
        Phone: u.phone || "",
        Roles: u.roles && u.roles.length > 0 ? u.roles.join(", ") : "—",
        CreatedAt: u.created_at
          ? new Date(u.created_at).toLocaleString()
          : "",
        UpdatedAt: u.updated_at
          ? new Date(u.updated_at).toLocaleString()
          : "",
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });

      const fileName = `users_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
      
      toast.success(
        `Successfully exported ${filteredUsers.length} user${filteredUsers.length !== 1 ? 's' : ''} to ${fileName}`
      );
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export users. Please try again or contact support.", {
        duration: 4000,
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="">
      <div className="mx-8">
        <Container>
          <div className="mt-4 pb-8">
            <Controls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAdd={handleAdd}
              canCreate={canCreate}
            />

            {showForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                  {editingUser ? "Edit User" : "Create New User"}
                </h2>
                <UserForm
                  user={editingUser || undefined}
                  roles={roles}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            <UserTable
              users={filteredUsers}
              roles={roles}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              loading={loading}
              canUpdate={canUpdate}
              canDelete={canDelete}
            />

            <div className="mt-4 flex justify-start">
              <button
                onClick={handleExport}
                disabled={filteredUsers.length === 0}
                className="bg-[#3D4C63] hover:bg-[#495C79] text-white font-medium py-2 px-4 rounded-sm shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex gap-2">
                  <Download className="w-5 h-5" />
                  Export {filteredUsers.length > 0 && `(${filteredUsers.length})`}
                </span>
              </button>
            </div>
      

            {showDeleteModal && deletingUser && (
              <DeleteModal
                user={deletingUser}
                onConfirm={confirmDelete}
                onCancel={() => {
                  setShowDeleteModal(false);
                  setDeletingUser(null);
                  toast("Delete canceled", { icon: "ℹ️" });
                }}
                isDeleting={isDeleting}
              />
            )}
          </div>
        </Container>
      </div>
    </div>
  );
}