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

// Extend base type and add a tempId for React keys
interface CollectionRow extends CreateStudentInventoryCollectionInput {
    tempId: string;
}

export default function BulkUploadForm({
    onSubmit,
    onCancel,
    isSubmitting,
    students,
    inventoryItems,
    sessionTerms,
    classes,
}: BulkUploadFormProps) {
    const [rows, setRows] = useState<CollectionRow[]>([
        createEmptyRow(),
    ]);

    function createEmptyRow(): CollectionRow {
        return {
            tempId: crypto.randomUUID(),
            student_id: "",
            class_id: "",
            session_term_id: "",
            inventory_item_id: "",
            qty: 1,
            eligible: true,
            received: false,
            received_date: null,
            given_by: "",
        };
    }

    const handleAddRow = () => {
        setRows([...rows, createEmptyRow()]);
    };

    const handleRemoveRow = (tempId: string) => {
        setRows(rows.filter((row) => row.tempId !== tempId));
    };

    const handleChange = <K extends keyof CollectionRow>(
        tempId: string,
        field: K,
        value: CollectionRow[K]
    ) => {
        setRows((prevRows) =>
            prevRows.map((row) =>
                row.tempId === tempId ? { ...row, [field]: value } : row
            )
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Prefix with underscore to indicate intentionally unused
        const submitData = rows.map(({ tempId: _tempId, ...rest }) => rest);
        await onSubmit(submitData);
    };

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

                {rows.map((row) => (
                    <div
                        key={row.tempId}
                        className="grid grid-cols-8 gap-2 items-center border p-3 rounded-lg bg-gray-50"
                    >
                        {/* Student */}
                        <select
                            value={row.student_id}
                            onChange={(e) =>
                                handleChange(row.tempId, "student_id", e.target.value)
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
                            onChange={(e) =>
                                handleChange(row.tempId, "class_id", e.target.value)
                            }
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
                                handleChange(row.tempId, "inventory_item_id", e.target.value)
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
                                handleChange(row.tempId, "session_term_id", e.target.value)
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
                                handleChange(row.tempId, "qty", parseInt(e.target.value) || 1)
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
                                handleChange(row.tempId, "eligible", e.target.checked)
                            }
                        />

                        {/* Received */}
                        <input
                            type="checkbox"
                            checked={row.received}
                            onChange={(e) =>
                                handleChange(row.tempId, "received", e.target.checked)
                            }
                        />

                        {/* Remove button */}
                        <button
                            type="button"
                            onClick={() => handleRemoveRow(row.tempId)}
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
                            className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm text-sm disabled:opacity-50"
                        >
                            {isSubmitting ? "Submitting..." : "Submit All"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}