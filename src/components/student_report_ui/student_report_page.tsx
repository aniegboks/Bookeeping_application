"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Filter } from "lucide-react";

import { studentInventoryCollectionApi } from "@/lib/student_inventory_collection";
import { studentApi } from "@/lib/students";
import { inventoryItemApi } from "@/lib/inventory_item";
import { academicSessionsApi } from "@/lib/academic_session";
import { userApi } from "@/lib/user";
import { categoriesApi } from "@/lib/categories";

import {
    StudentInventoryCollection,
    StudentInventoryCollectionFilters,
} from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";
import { SchoolClass } from "@/lib/types/classes";
import { Category } from "@/lib/types/categories";

import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import { ReportFilterModal } from "@/components/student_report_ui/filter_modal";
import { ReportStatsCards } from "@/components/student_report_ui/stats_card";
import { ReportSearchExport } from "@/components/student_report_ui/search_export";
import { ReportTablePagination } from "@/components/student_report_ui/table";

export default function StudentInventoryReportPage() {
    const [collections, setCollections] = useState<StudentInventoryCollection[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
    const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [filters, setFilters] = useState<StudentInventoryCollectionFilters>({});
    const [searchTerm, setSearchTerm] = useState("");
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialLoading, setInitialLoading] = useState(true);

    // Load initial data
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [studentData, itemData, sessionData, userData, classData, categoryData] = await Promise.all([
                    studentApi.getAll(),
                    inventoryItemApi.getAll(),
                    academicSessionsApi.getAll(),
                    userApi.getAll(),
                    fetch("/api/classes").then((r) => r.json()),
                    categoriesApi.getAll(),
                ]);

                setStudents(studentData);
                setInventoryItems(itemData);
                setAcademicSessions(sessionData);
                setUsers(userData);
                setClasses(classData);
                setCategories(categoryData);
            } catch (err) {
                console.error("Failed to load data:", err);
                toast.error("Failed to load data");
            } finally {
                setLoading(false);
                setInitialLoading(false);
            }
        }
        loadData();
    }, []);

    // Fetch collections based on filters
    const fetchCollections = async () => {
        try {
            setLoading(true);

            // Clean filters - remove undefined/empty values
            const cleanFilters: StudentInventoryCollectionFilters = {};
            if (filters.student_id) cleanFilters.student_id = filters.student_id;
            if (filters.class_id) cleanFilters.class_id = filters.class_id;
            if (filters.session_term_id) cleanFilters.session_term_id = filters.session_term_id;
            if (filters.inventory_item_id) cleanFilters.inventory_item_id = filters.inventory_item_id;
            if (filters.eligible !== undefined) cleanFilters.eligible = filters.eligible;
            if (filters.received !== undefined) cleanFilters.received = filters.received;

            const data = await studentInventoryCollectionApi.getAll(cleanFilters);
            setCollections(data);
            setShowFilterModal(false);
            toast.success(`Found ${data.length} records`);
        } catch (err) {
            console.error("Failed to fetch collections:", err);
            toast.error("Failed to fetch collections");
        } finally {
            setLoading(false);
        }
    };

    // Search functionality
    const filteredCollections = collections.filter((c) => {
        if (!searchTerm) return true;

        const student = students.find((s) => s.id === c.student_id);
        const studentName = student
            ? `${student.first_name} ${student.middle_name || ""} ${student.last_name}`.toLowerCase()
            : "";
        const admissionNumber = student?.admission_number?.toLowerCase() || "";
        const item = inventoryItems.find((i) => i.id === c.inventory_item_id);
        const itemName = item?.name?.toLowerCase() || "";
        const categoryItem = categories.find((cat) => cat.id === item?.category_id);
        const categoryName = categoryItem?.name?.toLowerCase() || "";
        const className = classes.find((cl) => cl.id === c.class_id)?.name?.toLowerCase() || "";
        const sessionName = academicSessions.find((s) => s.id === c.session_term_id)?.name?.toLowerCase() || "";

        const term = searchTerm.toLowerCase();
        return (
            studentName.includes(term) ||
            admissionNumber.includes(term) ||
            itemName.includes(term) ||
            categoryName.includes(term) ||
            className.includes(term) ||
            sessionName.includes(term)
        );
    });

    // Export to Excel
    const handleExportExcel = () => {
        if (filteredCollections.length === 0) {
            toast.error("No data to export!");
            return;
        }

        const dataToExport = filteredCollections.map((c) => {
            const student = students.find((s) => s.id === c.student_id);
            const item = inventoryItems.find((i) => i.id === c.inventory_item_id);
            const session = academicSessions.find((s) => s.id === c.session_term_id);
            const classObj = classes.find((cl) => cl.id === c.class_id);
            const givenByUser = users.find((u) => u.id === c.given_by);
            const categoryItem = categories.find((cat) => cat.id === item?.category_id);

            return {
                "Student ID": c.student_id,
                "Admission Number": student?.admission_number || "",
                "Student Name": student
                    ? `${student.first_name} ${student.middle_name || ""} ${student.last_name}`.trim()
                    : "",
                Gender: student?.gender || "",
                "Date of Birth": student?.date_of_birth || "",
                Class: classObj?.name || "",
                "Class ID": c.class_id,
                "Guardian Name": student?.guardian_name || "",
                "Guardian Contact": student?.guardian_contact || "",
                "Guardian Email": student?.guardian_email || "",
                "Session Term": session?.session || "",
                "Term Name": session?.name || "",
                "Session ID": c.session_term_id,
                "Inventory Item": item?.name || "",
                "Item Category": categoryItem?.name || "",
                "Item ID": c.inventory_item_id,
                Quantity: c.qty,
                Eligible: c.eligible ? "Yes" : "No",
                Received: c.received ? "Yes" : "No",
                "Received Date": c.received_date ? new Date(c.received_date).toLocaleDateString() : "",
                "Given By": givenByUser?.name || "",
                "Created At": new Date(c.created_at).toLocaleString(),
                "Updated At": new Date(c.updated_at).toLocaleString(),
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        saveAs(blob, `student_inventory_report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        toast.success("Excel exported successfully!");
    };

    // Print/PDF functionality
    const handlePrint = () => {
        window.print();
        toast.success("Print dialog opened");
    };

    const clearFilters = () => {
        setFilters({});
        setSearchTerm("");
        setCollections([]);
        toast.success("Filters cleared");
    };

    if (initialLoading) {
        return (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
                <Loader />
            </div>
        );
    }

    const stats = {
        total: filteredCollections.length,
        eligible: filteredCollections.filter((c) => c.eligible).length,
        received: filteredCollections.filter((c) => c.received).length,
        pending: filteredCollections.filter((c) => c.eligible && !c.received).length,
    };

    return (
        <div className="mx-6 py-6 print:mx-0">
            <Container>
                {/* Filter Button */}
                <div className="mb-6 print:hidden">
                    <button
                        onClick={() => setShowFilterModal(true)}
                        className="bg-[#3D4C63] rounded-sm hover:bg-[#495C79] text-white px-6 py-3 transition flex items-center gap-2"
                    >
                        <Filter className="w-5 h-5" />
                        Open Filters & Generate Report
                    </button>
                </div>

                {/* Filter Modal */}
                <ReportFilterModal
                    isOpen={showFilterModal}
                    onClose={() => setShowFilterModal(false)}
                    filters={filters}
                    setFilters={setFilters}
                    students={students}
                    classes={classes}
                    academicSessions={academicSessions}
                    inventoryItems={inventoryItems}
                    onGenerate={fetchCollections}
                    onClear={clearFilters}
                    loading={loading}
                />

                {/* Search and Export */}
                {collections.length > 0 && (
                    <ReportSearchExport
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        onExportExcel={handleExportExcel}
                        onPrint={handlePrint}
                    />
                )}

                {/* Statistics Cards */}
                {collections.length > 0 && (
                    <ReportStatsCards
                        total={stats.total}
                        eligible={stats.eligible}
                        received={stats.received}
                        pending={stats.pending}
                    />
                )}

                {/* Table with Pagination */}
                <ReportTablePagination
                    collections={filteredCollections}
                    students={students}
                    inventoryItems={inventoryItems}
                    academicSessions={academicSessions}
                    users={users}
                    classes={classes}
                    categories={categories}
                />

                {/* Footer Info */}
                {collections.length > 0 && (
                    <div className="mt-6 text-center text-sm text-gray-500 print:mt-4">
                        <p>
                            Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                        </p>
                        <p className="mt-1">Total Records: {filteredCollections.length}</p>
                    </div>
                )}
            </Container>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                    @page {
                        size: A4 landscape;
                        margin: 1cm;
                    }
                }
            `}</style>
        </div>
    );
}