"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { CreateStudentInventoryCollectionInput } from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";

interface Class {
    id: string;
    name: string;
}

interface BulkUploadFormProps {
    onSubmit: (data: CreateStudentInventoryCollectionInput[]) => Promise<void>;
    onCancel: () => void;
    isSubmitting: boolean;
    students: Student[];
    inventoryItems: InventoryItem[];
    sessionTerms: AcademicSession[];
    users: User[];
    classes: Class[];
}

interface CollectionRow extends CreateStudentInventoryCollectionInput {}

export default function BulkUploadForm({
    onSubmit,
    onCancel,
    isSubmitting,
    students,
    inventoryItems,
    sessionTerms,
    users,
    classes,
}: BulkUploadFormProps) {
    const [rows, setRows] = useState<CollectionRow[]>([
        {
            student_id: "",
            class_id: "",
            session_term_id: "",
            inventory_item_id: "",
            qty: 1,
            eligible: true,
            received: false,
            received_date: null,
            given_by: "",
        },
    ]);

    const handleAddRow = () => {
        setRows([
            ...rows,
            {
                student_id: "",
                class_id: "",
                session_term_id: "",
                inventory_item_id: "",
                qty: 1,
                eligible: true,
                received: false,
                received_date: null,
                given_by: "",
            },
        ]);
    };

    const handleRemoveRow = (index: number) => {
        setRows(rows.filter((_, i) => i !== index));
    };

    const handleChange = (
        index: number,
        field: keyof CollectionRow,
        value: string | number | boolean | null
    ) => {
        const updated = [...rows];
        (updated[index] as any)[field] = value;
        setRows(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(rows);
    };

    // Helper to safely get full name
    const getFullName = (s: Student) =>
        [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-auto p-4">
            <form
                onSubmit={handleSubmit}
                className="space-y-4 bg-white p-6 rounded-lg w-full max-w-6xl shadow-lg"
            >
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={handleAddRow}
                        className="flex items-center gap-2 text-[#000] text-sm"
                    >
                        <Plus className="w-4 h-4" />
                        Add Row
                    </button>
                </div>

                {rows.map((row, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-8 gap-2 items-center border p-3 rounded-lg bg-gray-50"
                    >
                        {/* Student */}
                        <select
                            value={row.student_id}
                            onChange={(e) =>
                                handleChange(index, "student_id", e.target.value)
                            }
                            className="p-2 border rounded"
                            required
                        >
                            <option value="">Select Student</option>
                            {students.map((student) => (
                                <option key={student.id} value={student.id}>
                                    {getFullName(student)}
                                </option>
                            ))}
                        </select>

                        {/* Class */}
                        <select
                            value={row.class_id}
                            onChange={(e) => handleChange(index, "class_id", e.target.value)}
                            className="p-2 border rounded"
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map((cls) => (
                                <option key={cls.id} value={cls.id}>
                                    {cls.name}
                                </option>
                            ))}
                        </select>

                        {/* Inventory Item */}
                        <select
                            value={row.inventory_item_id}
                            onChange={(e) =>
                                handleChange(index, "inventory_item_id", e.target.value)
                            }
                            className="p-2 border rounded"
                            required
                        >
                            <option value="">Select Item</option>
                            {inventoryItems.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </select>

                        {/* Session Term */}
                        <select
                            value={row.session_term_id}
                            onChange={(e) =>
                                handleChange(index, "session_term_id", e.target.value)
                            }
                            className="p-2 border rounded"
                            required
                        >
                            <option value="">Select Term</option>
                            {sessionTerms.map((term) => (
                                <option key={term.id} value={term.id}>
                                    {term.name} ({term.session})
                                </option>
                            ))}
                        </select>

                        {/* Quantity */}
                        <input
                            type="number"
                            value={row.qty}
                            onChange={(e) =>
                                handleChange(index, "qty", parseInt(e.target.value))
                            }
                            className="p-2 border rounded"
                            min={1}
                            required
                        />

                        {/* Eligible */}
                        <input
                            type="checkbox"
                            checked={row.eligible}
                            onChange={(e) =>
                                handleChange(index, "eligible", e.target.checked)
                            }
                        />

                        {/* Received */}
                        <input
                            type="checkbox"
                            checked={row.received}
                            onChange={(e) =>
                                handleChange(index, "received", e.target.checked)
                            }
                        />

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="p-2 text-red-600 hover:text-red-800"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}

                <div className="flex justify-end mt-4">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 border rounded-sm text-sm text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-4 py-2 bg-green-600 text-white rounded-sm text-sm hover:bg-green-700 disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit All"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
