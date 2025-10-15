"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: unknown) {
      console.error("Failed to load users:", err);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading users.";
      toast.error("Failed to load users: " + message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
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
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingUser ? "Updating user..." : "Creating user..."
    );

    try {
      if (editingUser) {
        await userApi.update(editingUser.id, data as UpdateUserInput);
        toast.dismiss(loadingToast);
        toast.success("User updated successfully!");
      } else {
        await userApi.create(data as CreateUserInput);
        toast.dismiss(loadingToast);
        toast.success("User created successfully!");
      }

      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while saving the user.";
      toast.error("Failed to save user: " + message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleDeleteRequest = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    const loadingToast = toast.loading("Deleting user...");

    try {
      await userApi.delete(deletingUser.id);
      toast.dismiss(loadingToast);
      toast.success("User deleted successfully!");
      setShowDeleteModal(false);
      setDeletingUser(null);
      await loadUsers();
    } catch (err: unknown) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while deleting the user.";
      toast.error("Failed to delete user: " + message);
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
    setEditingUser(null);
    setShowForm(true);
  };

  const handleExport = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to export!");
      return;
    }

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

    saveAs(blob, `users_export_${new Date().toISOString()}.xlsx`);
    toast.success("Spreadsheet exported successfully!");
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
            <StatsCards users={users} filteredUsers={filteredUsers} />
            <Controls
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onAdd={handleAdd}
            />

            {showForm && (
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                  {editingUser ? "Edit User" : "Create New User"}
                </h2>
                <UserForm
                  user={editingUser || undefined}
                  onSubmit={handleFormSubmit}
                  onCancel={handleCancel}
                  isSubmitting={isSubmitting}
                />
              </div>
            )}

            <UserTable
              users={filteredUsers}
              onEdit={handleEdit}
              onDelete={handleDeleteRequest}
              loading={loading}
            />

            <div className="mt-4 flex justify-start">
              <button
                onClick={handleExport}
                className="bg-[#3D4C63] hover:bg-[#495C79] text-white font-medium py-2 px-4 rounded-sm shadow-sm transition-all"
              >
                <span className="flex gap-2">
                  <Download className="w-5 h-5" />
                  Export
                </span>
              </button>
            </div>
            <Trends users={users} />


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
