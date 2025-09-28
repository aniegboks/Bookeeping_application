// components/entitlements/EntitlementsTable.tsx
"use client";

import { useState } from "react";
import { PenSquare, Trash2 } from "lucide-react";
import DeleteEntitlementModal from "./delete_modal";
import { ClassInventoryEntitlement } from "@/lib/types/class_inventory";

interface EntitlementsTableProps {
    entitlements: ClassInventoryEntitlement[];
    openEditModal: (ent: ClassInventoryEntitlement) => void;
    handleDelete: (id: string) => void;
    formatDate: (date: string) => string;
}

export default function EntitlementsTable({
    entitlements,
    openEditModal,
    handleDelete,
    formatDate,
}: EntitlementsTableProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedEntitlement, setSelectedEntitlement] = useState<ClassInventoryEntitlement | null>(null);

    const openDeleteModal = (ent: ClassInventoryEntitlement) => {
        setSelectedEntitlement(ent);
        setShowDeleteModal(true);
    };

    const confirmDelete = () => {
        if (selectedEntitlement) handleDelete(selectedEntitlement.id);
        setShowDeleteModal(false);
        setSelectedEntitlement(null);
    };


    return (
        <div className="overflow-x-auto relative">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Term</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>

                <tbody className="bg-white divide-y divide-gray-200">
                    {entitlements.map((e) => (
                        <tr key={e.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">{e.class_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{e.inventory_item_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{e.session_term_id}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{e.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{e.notes}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(e.created_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(e.updated_at)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex gap-2">
                                <button
                                    onClick={() => openEditModal(e)}
                                    className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50 transition-colors"
                                >
                                    <PenSquare size={16} />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(e)}
                                    className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50 transition-colors"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {showDeleteModal && selectedEntitlement && (
                <DeleteEntitlementModal
                    selectedEntitlement={selectedEntitlement}
                    setShowDeleteModal={setShowDeleteModal}
                    confirmDelete={confirmDelete}
                />
            )}
        </div>
    );
}
