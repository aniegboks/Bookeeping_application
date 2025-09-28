// app/class-inventory-entitlements/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import EntitlementsStatsCards from "@/components/class_inventory_ui/stats_card";
import EntitlementsTable from "@/components/class_inventory_ui/class_inventory_table";
import EntitlementModal from "@/components/class_inventory_ui/class_modal";
import DeleteEntitlementModal from "@/components/class_inventory_ui/delete_modal";
import { ClassInventoryEntitlement } from "@/lib/class_inventory";
import Container from "@/components/ui/container";

export default function EntitlementsPage() {
    const [entitlements, setEntitlements] = useState<ClassInventoryEntitlement[]>([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [editingEntitlement, setEditingEntitlement] = useState<ClassInventoryEntitlement | null>(null);
    const [formData, setFormData] = useState<Partial<ClassInventoryEntitlement>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEntitlement, setSelectedEntitlement] = useState<ClassInventoryEntitlement | null>(null);

    // Fetch entitlements from Next.js API route
    const fetchEntitlements = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/class_inventory");
            if (!res.ok) throw new Error("Failed to fetch entitlements");
            const data: ClassInventoryEntitlement[] = await res.json();
            setEntitlements(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEntitlements();
    }, [fetchEntitlements]);

    // Format date helper
    const formatDate = (date: string) => new Date(date).toLocaleDateString();

    // Open create modal
    const openCreateModal = () => {
        setEditingEntitlement(null);
        setFormData({});
        setShowModal(true);
    };

    // Open edit modal
    const openEditModal = (ent: ClassInventoryEntitlement) => {
        setEditingEntitlement(ent);
        setFormData(ent);
        setShowModal(true);
    };

    // Open delete modal
    const openDeleteModal = (ent: ClassInventoryEntitlement) => {
        setSelectedEntitlement(ent);
        setShowDeleteModal(true);
    };

    // Confirm delete via Next.js API route
    const confirmDelete = async () => {
        if (!selectedEntitlement) return;
        try {
            const res = await fetch(`/api/class_inventory/${selectedEntitlement.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete entitlement");
            setEntitlements((prev) => prev.filter((e) => e.id !== selectedEntitlement.id));
        } catch (err) {
            console.error(err);
        } finally {
            setShowDeleteModal(false);
            setSelectedEntitlement(null);
        }
    };

    // Handle create/update submit via Next.js API routes
    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            if (editingEntitlement) {
                // Update
                const res = await fetch(`/api/class_inventory/${editingEntitlement.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to update entitlement");
                const updated: ClassInventoryEntitlement = await res.json();
                setEntitlements((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
            } else {
                // Create
                const res = await fetch("/api/class_inventory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                });
                if (!res.ok) throw new Error("Failed to create entitlement");
                const created: ClassInventoryEntitlement = await res.json();
                setEntitlements((prev) => [created, ...prev]);
            }
            setShowModal(false);
            setFormData({});
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6">
            <Container>
                <div>
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-[#171D26]">Class Inventory Entitlements</h1>
                        <button
                            onClick={openCreateModal}
                            className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79]"
                        >
                            Add Entitlement
                        </button>
                    </div>

                    <EntitlementsStatsCards
                        total={entitlements.length}
                        addedToday={entitlements.filter((e) => new Date(e.created_at).toDateString() === new Date().toDateString()).length}
                        searchResults={entitlements.length}
                        viewMode="list"
                    />

                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        <EntitlementsTable
                            entitlements={entitlements}
                            openEditModal={openEditModal}
                            handleDelete={confirmDelete} // openDeleteModal now triggers modal
                            formatDate={formatDate}
                        />
                    )}

                    {/* Create / Edit Modal */}
                    <EntitlementModal
                        show={showModal}
                        onClose={() => setShowModal(false)}
                        formData={formData}
                        setFormData={setFormData}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                        editingEntitlement={editingEntitlement}
                    />

                    {/* Delete Confirmation Modal */}
                    {selectedEntitlement && (
                        <DeleteEntitlementModal
                            selectedEntitlement={selectedEntitlement}
                            setShowDeleteModal={setShowDeleteModal}
                            confirmDelete={confirmDelete}
                        />
                    )}
                </div>
            </Container>
        </div>
    );
}
