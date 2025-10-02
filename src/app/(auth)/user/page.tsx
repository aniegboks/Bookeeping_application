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

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err: any) {
      console.error("Failed to load users:", err);
      toast.error("Failed to load users: " + err.message);
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.id.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower) ||
      user.phone.toLowerCase().includes(searchLower)
    );
  });

  // Handle form submission (create/update)
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingUser ? "Updating user..." : "Creating user..."
    );

    try {
      if (editingUser) {
        await userApi.update(editingUser.id, data);
        toast.dismiss(loadingToast);
        toast.success("User updated successfully!");
      } else {
        await userApi.create(data);
        toast.dismiss(loadingToast);
        toast.success("User created successfully!");
      }

      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Form submission failed:", err);
      toast.error("Failed to save user: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  // Handle delete request
  const handleDeleteRequest = (user: User) => {
    setDeletingUser(user);
    setShowDeleteModal(true);
  };

  // Confirm delete
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
    } catch (err: any) {
      toast.dismiss(loadingToast);
      console.error("Delete failed:", err);
      toast.error("Failed to delete user: " + err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setShowForm(false);
    setEditingUser(null);
    toast("Form canceled", { icon: "ℹ️" });
  };

  // Handle add new
  const handleAdd = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  // Initial loading screen
  if (initialLoading) {
    return (
      <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F4F7]">
      <Container>
        <div className="mt-24 pb-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#171D26] mb-2">
              User Management
            </h1>
            <p className="text-gray-600">
              Manage system users and their information
            </p>
          </div>

          {/* Stats Cards */}
          <StatsCards users={users} filteredUsers={filteredUsers} />

          {/* Controls */}
          <Controls
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAdd={handleAdd}
          />

          {/* Form Modal */}
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

          {/* Table */}
          <UserTable
            users={filteredUsers}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            loading={loading}
          />

          {/* Delete Modal */}
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
  );
}