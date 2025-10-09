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

    // ✅ EXPORT AS SPREADSHEET
    const handleExport = () => {
        if (filteredUsers.length === 0) {
            toast.error("No users to export!");
            return;
        }

        // Map user data for export
        const dataToExport = filteredUsers.map((u) => ({
            ID: u.id,
            Name: u.phone || "",
            Email: u.email || "",
            Phone: u.phone || "",
            Role: u.roles || "",
            CreatedAt: u.created_at ? new Date(u.created_at).toLocaleString() : "",
            UpdatedAt: u.updated_at ? new Date(u.updated_at).toLocaleString() : "",
          }));
          
        // Create worksheet and workbook
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

        // Convert to Excel buffer and save
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

    // Initial loading screen
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
                        {/* Stats Cards */}
                        <StatsCards users={users} filteredUsers={filteredUsers} />
                        <Trends users={users} />

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

                        {/* Export Button */}
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
        </div>
    );
}
