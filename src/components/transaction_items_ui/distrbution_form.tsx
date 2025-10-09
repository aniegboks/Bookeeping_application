"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
    InventoryDistribution,
    CreateInventoryDistributionInput,
} from "@/lib/types/inventory_distribution";
import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";
import SmallLoader from "../ui/small_loader";

interface DistributionFormProps {
    distribution?: InventoryDistribution;
    onSubmit: (data: CreateInventoryDistributionInput) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    classes: SchoolClass[];
    inventoryItems: InventoryItem[];
    academicSessions: AcademicSession[];
    users: User[];
    currentUser: User | null;
}

export default function DistributionForm({
    distribution,
    onSubmit,
    onCancel,
    isSubmitting,
    classes,
    inventoryItems,
    academicSessions,
    users,
    currentUser,
}: DistributionFormProps) {
    const [formData, setFormData] = useState<CreateInventoryDistributionInput>({
        class_id: "",
        inventory_item_id: "",
        session_term_id: "",
        distributed_quantity: 0,
        distribution_date: new Date().toISOString().split("T")[0],
        received_by: "",
        receiver_name: "",
        notes: "",
        created_by: currentUser?.id || "",
    });

    useEffect(() => {
        if (distribution) {
            setFormData({
                class_id: distribution.class_id,
                inventory_item_id: distribution.inventory_item_id,
                session_term_id: distribution.session_term_id,
                distributed_quantity: distribution.distributed_quantity,
                distribution_date: distribution.distribution_date.split("T")[0],
                received_by: distribution.received_by,
                receiver_name: distribution.receiver_name,
                notes: distribution.notes || "",
                created_by: distribution.created_by,
            });
        } else if (currentUser) {
            setFormData(prev => ({ ...prev, created_by: currentUser.id }));
        }
    }, [distribution, currentUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Print JSON being sent to the server
        console.log("Submitting Distribution Data:", JSON.stringify(formData, null, 2));

        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-sm shadow-lg w-full max-w-2xl">
                <h3 className="text-lg font-semibold mb-6">Distribution Form</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Distribution Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class <span className="text-gray-500">*</span>
                            </label>
                            <select
                                value={formData.class_id}
                                onChange={(e) => setFormData({ ...formData, class_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inventory Item <span className="text-gray-500">*</span>
                            </label>
                            <select
                                value={formData.inventory_item_id}
                                onChange={(e) => setFormData({ ...formData, inventory_item_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select Item</option>
                                {inventoryItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Session Term <span className="text-gray-500">*</span>
                            </label>
                            <select
                                value={formData.session_term_id}
                                onChange={(e) => setFormData({ ...formData, session_term_id: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select Term</option>
                                {academicSessions.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quantity and Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Distributed Quantity <span className="text-gray-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={formData.distributed_quantity}
                                onChange={(e) =>
                                    setFormData({ ...formData, distributed_quantity: parseInt(e.target.value) || 0 })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Distribution Date <span className="text-gray-500">*</span>
                            </label>
                            <input
                                type="date"
                                value={formData.distribution_date}
                                onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Receiver Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Received By <span className="text-gray-500">*</span>
                            </label>
                            <select
                                value={formData.received_by}
                                onChange={(e) => {
                                    const selectedUserId = e.target.value;
                                    const selectedUser = users.find(u => u.id === selectedUserId);
                                    setFormData({
                                        ...formData,
                                        received_by: selectedUserId,
                                        receiver_name: selectedUser?.name || "",
                                    });
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.name} ({user.email})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Receiver Name <span className="text-gray-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.receiver_name}
                                onChange={(e) => setFormData({ ...formData, receiver_name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={isSubmitting}
                                placeholder="e.g., Mrs. Johnson"
                            />
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                            placeholder="Additional distribution notes..."
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isSubmitting}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79]  transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <SmallLoader />
                                    Saving...
                                </>
                            ) : (
                                distribution ? "Update Distribution" : "Create Distribution"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
