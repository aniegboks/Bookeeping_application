// components/class_entitlement_ui/entitlement_form.tsx

import { useState, useEffect } from "react";
import {
    ClassInventoryEntitlement,
    CreateClassInventoryEntitlementInput,
} from "@/lib/types/class_inventory_entitlement";

interface EntitlementFormProps {
    entitlement?: ClassInventoryEntitlement;
    onSubmit: (data: CreateClassInventoryEntitlementInput) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
}

export default function EntitlementForm({
    entitlement,
    onSubmit,
    onCancel,
    isSubmitting,
}: EntitlementFormProps) {
    const [formData, setFormData] = useState<CreateClassInventoryEntitlementInput>({
        class_id: "",
        inventory_item_id: "",
        session_term_id: "",
        quantity: 0,
        notes: "",
        created_by: "",
    });

    useEffect(() => {
        if (entitlement) {
            setFormData({
                class_id: entitlement.class_id,
                inventory_item_id: entitlement.inventory_item_id,
                session_term_id: entitlement.session_term_id,
                quantity: entitlement.quantity,
                notes: entitlement.notes || "",
                created_by: entitlement.created_by,
            });
        }
    }, [entitlement]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.class_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, class_id: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Inventory Item ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.inventory_item_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, inventory_item_id: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Session Term ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.session_term_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, session_term_id: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quantity <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={formData.quantity}
                                onChange={(e) =>
                                    setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Created By (User ID) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.created_by}
                                onChange={(e) =>
                                    setFormData({ ...formData, created_by: e.target.value })
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notes
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) =>
                                setFormData({ ...formData, notes: e.target.value })
                            }
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
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
                            className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Saving...
                                </>
                            ) : (
                                entitlement ? "Update" : "Create"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}