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
    PrivilegeStatus,
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

export default function RolePrivilegesPage() {
    const [privileges, setPrivileges] = useState<RolePrivilege[]>([]);
    const [groupedPrivileges, setGroupedPrivileges] = useState<GroupedPrivileges | null>(null);
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

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [privilegesPerPage] = useState(8);

    // Load roles for dropdown
    const loadRoles = async () => {
        try {
            const data = await rolesApi.getAll();
            setRoles(data);
        } catch (err: unknown) {
            console.error("Failed to load roles:", err);
            toast.error("Failed to load roles");
        }
    };

    // Load all privileges or filter by role
    const loadPrivileges = async (roleCode?: string) => {
        try {
            setLoading(true);
            const data = await rolePrivilegesApi.getAll(roleCode);

            // Check if response is grouped (has privileges object) or array
            if (data && typeof data === 'object' && 'privileges' in data) {
                setGroupedPrivileges(data as GroupedPrivileges);
                
                // For grouped data, we don't have real IDs, so we'll show a warning
                // This data is READ-ONLY and cannot be edited directly
                const flatPrivileges: RolePrivilege[] = [];
                Object.entries((data as GroupedPrivileges).privileges).forEach(([resource, items]) => {
                    items.forEach((item) => {
                        // Normalize status to string format
                        let normalizedStatus: string;
                        if (typeof item.status === 'boolean') {
                            normalizedStatus = item.status ? 'active' : 'inactive';
                        } else {
                            normalizedStatus = String(item.status).toLowerCase() === 'active' ? 'active' : 'inactive';
                        }
                        
                        flatPrivileges.push({
                            id: `temp-${resource}-${item.description}`, // Mark as temp ID
                            role_code: roleCode || "",
                            description: item.description,
                            status: normalizedStatus,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        });
                    });
                });
                setPrivileges(flatPrivileges);
                
                // Show info message that editing grouped data requires selecting a specific role
                if (!roleCode) {
                    toast("Select a specific role to edit privileges", { 
                        icon: "ℹ️",
                        duration: 3000 
                    });
                }
            } else {
                // Normalize status for flat array response too
                const normalizedPrivileges = (data as RolePrivilege[]).map(priv => ({
                    ...priv,
                    status: typeof priv.status === 'boolean' 
                        ? (priv.status ? 'active' : 'inactive')
                        : String(priv.status).toLowerCase() === 'active' ? 'active' : 'inactive'
                }));
                setPrivileges(normalizedPrivileges);
                setGroupedPrivileges(null);
            }
        } catch (err: unknown) {
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
        if (selectedRole) {
            loadPrivileges(selectedRole);
        } else {
            loadPrivileges();
        }
    }, [selectedRole]);

    // Filter + Paginate
    const filteredPrivileges = useMemo(() => {
        return privileges.filter(
            (priv) =>
                priv.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                priv.role_code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [privileges, searchTerm]);

    const totalPages = Math.ceil(filteredPrivileges.length / privilegesPerPage);
    const startIdx = (currentPage - 1) * privilegesPerPage;
    const paginatedPrivileges = filteredPrivileges.slice(startIdx, startIdx + privilegesPerPage);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // Export to Excel
    const handleExport = () => {
        if (filteredPrivileges.length === 0) {
            toast.error("No data to export!");
            return;
        }

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
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `role_privileges_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success("Spreadsheet exported successfully!");
    };

    // Submit form (create/update)
    const handleFormSubmit = async (
        data: CreateRolePrivilegePayload | UpdateRolePrivilegePayload
    ) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading(
            editingPrivilege ? "Updating privilege..." : "Creating privilege..."
        );

        try {
            if (editingPrivilege) {
                await rolePrivilegesApi.update(editingPrivilege.id, data as UpdateRolePrivilegePayload);
                toast.success("Privilege updated successfully!");
            } else {
                await rolePrivilegesApi.create(data as CreateRolePrivilegePayload);
                toast.success("Privilege created successfully!");
            }

            setShowForm(false);
            setEditingPrivilege(null);
            await loadPrivileges(selectedRole);
        } catch (err: unknown) {
            console.error("Form submission failed:", err);
            toast.error("Failed to save privilege");
        } finally {
            toast.dismiss(loadingToast);
            setIsSubmitting(false);
        }
    };

    // Delete handlers
    const handleDeleteRequest = (privilege: RolePrivilege) => {
        setDeletingPrivilege(privilege);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingPrivilege) return;
        setIsDeleting(true);
        const loadingToast = toast.loading("Deleting privilege...");

        try {
            await rolePrivilegesApi.delete(deletingPrivilege.id);
            toast.success("Privilege deleted successfully!");
            setShowDeleteModal(false);
            setDeletingPrivilege(null);
            await loadPrivileges(selectedRole);
        } catch (err: unknown) {
            console.error("Delete failed:", err);
            toast.error("Failed to delete privilege");
        } finally {
            toast.dismiss(loadingToast);
            setIsDeleting(false);
        }
    };

    // Bulk upsert handler - Group privileges by resource
    const handleBulkUpsert = async (
        roleCode: string,
        privileges: { description: string; status: PrivilegeStatus }[]
    ) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading("Bulk upserting privileges...");

        try {
            // Group privileges by resource based on description prefix
            const groupedByResource: { [resource: string]: { description: string; status: PrivilegeStatus }[] } = {};
            
            privileges.forEach(priv => {
                // Extract resource from description (e.g., "View Users" -> "users")
                const desc = priv.description.toLowerCase();
                let resource = "general"; // default resource
                
                // Map descriptions to resources
                if (desc.includes("academic session")) resource = "academic_session_terms";
                else if (desc.includes("brand")) resource = "brands";
                else if (desc.includes("categor") && !desc.includes("sub")) resource = "categories";
                else if (desc.includes("sub categor")) resource = "sub_categories";
                else if (desc.includes("uom")) resource = "uoms";
                else if (desc.includes("inventory item")) resource = "inventory_items";
                else if (desc.includes("entitlement")) resource = "class_inventory_entitlements";
                else if (desc.includes("supplier") && !desc.includes("transaction")) resource = "suppliers";
                else if (desc.includes("supplier transaction")) resource = "supplier_transactions";
                else if (desc.includes("user")) resource = "users";
                else if (desc.includes("class") && desc.includes("teacher")) resource = "class_teachers";
                else if (desc.includes("class") && !desc.includes("teacher")) resource = "school_classes";
                else if (desc.includes("purchase")) resource = "inventory_transactions";
                else if (desc.includes("student") && desc.includes("collection")) resource = "student_inventory_collection";
                else if (desc.includes("student") && desc.includes("report")) resource = "students";
                else if (desc.includes("student")) resource = "students";
                else if (desc.includes("distribution")) resource = "inventory_transactions";
                else if (desc.includes("inventory summary")) resource = "inventory_summary";
                else if (desc.includes("role")) resource = "roles";
                
                if (!groupedByResource[resource]) {
                    groupedByResource[resource] = [];
                }
                
                // Keep status as-is (active/inactive string) - backend will handle it
                groupedByResource[resource].push({
                    description: priv.description,
                    status: priv.status  // Send as "active" or "inactive"
                });
            });

            console.log("Sending to backend:", { role: roleCode, privileges: groupedByResource });
            
            // Backend expects "role" and grouped privileges
            await rolePrivilegesApi.bulkUpsert({
                role: roleCode,
                privileges: groupedByResource,
            });
            
            toast.success(`Successfully upserted ${privileges.length} privilege(s)!`);
            setShowBulkUpsertModal(false);
            await loadPrivileges(selectedRole);
        } catch (err: unknown) {
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

    if (initialLoading) {
        return (
            <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
                <Loader />
            </div>
        );
    }

    return (
        <div className="mx-6">
            <Container>
                <div className="mt-2 pb-8">
                    {/* Stats Cards */}
                    <StatsCards privileges={privileges} />

                    {/* Controls */}
                    <div className="flex justify-between items-center mb-4 mt-8 gap-4">
                        <div className="flex gap-3 flex-1">
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
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowForm(true)}
                                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-sm transition"
                            >
                                Add Privilege
                            </button>
                            <button
                                onClick={() => setShowBulkUpsertModal(true)}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
                            >
                                <Upload className="w-5 h-5" />
                                Bulk Upsert
                            </button>
                            <button
                                onClick={handleExport}
                                className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-sm transition flex gap-2 items-center"
                            >
                                <Download className="w-5 h-5" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <RolePrivilegesTable
                        privileges={paginatedPrivileges}
                        loading={loading}
                        onEdit={(privilege) => {
                            setEditingPrivilege(privilege);
                            setShowForm(true);
                        }}
                        onDelete={handleDeleteRequest}
                        onRefresh={() => loadPrivileges(selectedRole)}
                    />

                    {/* Pagination */}
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

                    {/* Form */}
                    {showForm && (
                        <RolePrivilegeForm
                            privilege={editingPrivilege || undefined}
                            roles={roles}
                            onSubmit={handleFormSubmit}
                            onCancel={handleCancel}
                            isSubmitting={isSubmitting}
                        />
                    )}

                    {/* Delete Modal */}
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

                    {/* Bulk Upsert Modal */}
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