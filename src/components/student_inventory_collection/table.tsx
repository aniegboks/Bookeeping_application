"use client";

import { useState } from "react";
import { Edit, Trash2, XCircle, CircleCheck } from "lucide-react";
import { StudentInventoryCollection } from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";

interface CollectionTableProps {
    collections: StudentInventoryCollection[];
    onEdit: (collection: StudentInventoryCollection) => void;
    onDelete: (collection: StudentInventoryCollection) => void;
    loading?: boolean;
    students?: Student[];
    inventoryItems?: InventoryItem[];
    academicSessions?: AcademicSession[];
    users?: User[];
    rowsPerPage?: number; // optional prop to set rows per page
}

export default function CollectionTable({
    collections,
    onEdit,
    onDelete,
    loading = false,
    students = [],
    rowsPerPage = 10,
}: CollectionTableProps) {
    const [currentPage, setCurrentPage] = useState(1);

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
                <p className="mt-4 text-gray-500">Loading collections...</p>
            </div>
        );
    }

    if (collections.length === 0) {
        return (
            <div className="bg-white rounded-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No collections found</p>
            </div>
        );
    }

    // Pagination logic
    const totalPages = Math.ceil(collections.length / rowsPerPage);
    const paginatedCollections = collections.slice(
        (currentPage - 1) * rowsPerPage,
        currentPage * rowsPerPage
    );

    const getStudentFullName = (student_id: string) => {
        const student = students.find((s) => s.id === student_id);
        return student
            ? [student.first_name, student.middle_name, student.last_name].filter(Boolean).join(" ")
            : "—";
    };

    const getAdmissionNumber = (student_id: string) => {
        const student = students.find((s) => s.id === student_id);
        return student?.admission_number || "—";
    };

    return (
        <div className="bg-white rounded-sm border border-t-0 border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligible</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received Date</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {paginatedCollections.map((collection) => (
                            <tr key={collection.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm">
                                        <div className="font-medium text-gray-900">{getStudentFullName(collection.student_id)}</div>
                                        <div className="text-gray-500 text-xs">{getAdmissionNumber(collection.student_id)}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{collection.school_classes?.name || "—"}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <div className="max-w-[150px]">
                                        <div className="font-medium">{collection.inventory_items?.name || "—"}</div>
                                        <div className="text-xs text-gray-500">{collection.inventory_items?.categories?.name || "—"}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{collection.qty}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => onEdit({ ...collection, eligible: !collection.eligible })}>
                                    {collection.eligible ? <span className="flex items-center gap-1 text-green-600"><CircleCheck className="h-4 w-4" /></span> : <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /></span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => onEdit({ ...collection, received: !collection.received })}>
                                    {collection.received ? <span className="flex items-center gap-1 text-green-600"><CircleCheck className="h-4 w-4" /></span> : <span className="flex items-center gap-1 text-red-600"><XCircle className="h-4 w-4" /></span>}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {collection.received_date ? new Date(collection.received_date).toLocaleDateString() : "—"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onEdit(collection)} className="text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                                        <button onClick={() => onDelete(collection)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-between items-center mt-4 p-4">

                <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
}
