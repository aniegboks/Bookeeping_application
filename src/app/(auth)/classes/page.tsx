"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { ClassTeacher } from "@/lib/types/class_teacher";
import { User } from "@/lib/types/user";
import { schoolClassApi } from "@/lib/classes";
import { classTeacherApi } from "@/lib/class_teacher";
import { userApi } from "@/lib/user";

import Container from "@/components/ui/container";
import Loader from "@/components/ui/loading_spinner";
import StatsCards from "@/components/classes/stats_card";
import Controls from "@/components/classes/controls";
import ClassTable from "@/components/classes/tables";
import ClassForm from "@/components/classes/form";
import DeleteModal from "@/components/classes/modal";
import Trends from "@/components/classes/trends";
import { CreateSchoolClassInput, UpdateSchoolClassInput, SchoolClass } from "@/lib/types/classes";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export default function SchoolClassesPage() {
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [initialLoading, setInitialLoading] = useState(true);
    const [loading, setLoading] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletingClass, setDeletingClass] = useState<SchoolClass | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [classData, teacherData, userData]: [SchoolClass[], ClassTeacher[], User[]] = await Promise.all([
                schoolClassApi.getAll(),
                classTeacherApi.getAll(),
                userApi.getAll(),
            ]);

            setClasses(classData);
            setClassTeachers(teacherData);
            setUsers(userData);
        } catch (err: unknown) {
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : "Unknown error";

            console.error("Failed to load data:", err);
            toast.error("Failed to load data: " + message);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const getTeacherName = (teacherId: string) => {
        const teacher = classTeachers.find((t) => t.id === teacherId);
        if (!teacher) return teacherId;
        const user = users.find((u) => u.id === teacher.teacher_id);
        return user?.username ?? user?.name ?? teacher.name ?? teacher.email ?? teacher.id;
    };

    const filteredClasses = classes.filter((schoolClass) => {
        const searchLower = searchTerm.toLowerCase();
        const teacherName = schoolClass.class_teacher_id
            ? getTeacherName(schoolClass.class_teacher_id).toLowerCase()
            : "";

        return (
            schoolClass.name.toLowerCase().includes(searchLower) ||
            schoolClass.id.toLowerCase().includes(searchLower) ||
            teacherName.includes(searchLower)
        ) && (!statusFilter || schoolClass.status === statusFilter);
    });

    const handleFormSubmit = async (data: CreateSchoolClassInput | UpdateSchoolClassInput) => {
        setIsSubmitting(true);
        const loadingToast = toast.loading(editingClass ? "Updating class..." : "Creating class...");

        try {
            if (editingClass) {
                await schoolClassApi.update(editingClass.id, data as UpdateSchoolClassInput);
            } else {
                await schoolClassApi.create(data as CreateSchoolClassInput);
            }

            toast.success(editingClass ? "Class updated!" : "Class created!");
            toast.dismiss(loadingToast);
            setShowForm(false);
            setEditingClass(null);
            await loadData();
        } catch (err: unknown) {
            toast.dismiss(loadingToast);
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : "Unknown error";
            console.error("Form submission failed:", err);
            toast.error("Failed to save class: " + message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (schoolClass: SchoolClass) => {
        setEditingClass(schoolClass);
        setShowForm(true);
    };

    const handleDeleteRequest = (schoolClass: SchoolClass) => {
        setDeletingClass(schoolClass);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingClass) return;
        setIsDeleting(true);
        const loadingToast = toast.loading("Deleting class...");

        try {
            await schoolClassApi.delete(deletingClass.id);
            toast.success("Class deleted successfully!");
            toast.dismiss(loadingToast);
            setShowDeleteModal(false);
            setDeletingClass(null);
            await loadData();
        } catch (err: unknown) {
            toast.dismiss(loadingToast);
            const message =
                err instanceof Error
                    ? err.message
                    : typeof err === "string"
                        ? err
                        : "Unknown error";
            console.error("Delete failed:", err);
            toast.error("Failed to delete class: " + message);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingClass(null);
        toast("Form canceled", { icon: "ℹ️" });
    };

    const handleAdd = () => {
        setEditingClass(null);
        setShowForm(true);
    };

    const exportToExcel = () => {
        if (filteredClasses.length === 0) {
            toast("No data to export", { icon: "ℹ️" });
            return;
        }

        const dataToExport = filteredClasses.map((schoolClass) => {
            const teacherName = schoolClass.class_teacher_id
                ? getTeacherName(schoolClass.class_teacher_id)
                : "—";

            const createdByUser = users.find((u) => u.id === schoolClass.created_by);
            const createdByName =
                createdByUser?.username ??
                createdByUser?.name ??
                schoolClass.created_by;

            return {
                "Class Name": schoolClass.name,
                "Class Teacher": teacherName,
                Status:
                    schoolClass.status.charAt(0).toUpperCase() +
                    schoolClass.status.slice(1),
                "Created By": createdByName,
                "Created At": new Date(schoolClass.created_at).toLocaleString(),
                "Updated At": new Date(schoolClass.updated_at).toLocaleString(),
            };
        });

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "SchoolClasses");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, `SchoolClasses_${new Date().toISOString()}.xlsx`);
    };

    if (initialLoading)
        return (
            <div className="fixed inset-0 w-full h-full flex items-center justify-center bg-[#F3F4F7] z-50">
                <Loader />
            </div>
        );

    return (
        <div className="mx-6">
            <Container>
                <div className="mt-4 pb-8">
                    <StatsCards classes={classes} filteredClasses={filteredClasses} />
                    <Trends classes={classes} />

                    <Controls
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        statusFilter={statusFilter}
                        onStatusFilterChange={setStatusFilter}
                        onAdd={handleAdd}
                    />

                    {showForm && (
                        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                            <h2 className="text-xl font-semibold text-[#171D26] mb-4">
                                {editingClass ? "Edit Class" : "Create New Class"}
                            </h2>
                            <ClassForm
                                schoolClass={editingClass || undefined}
                                onSubmit={handleFormSubmit}
                                onCancel={handleCancel}
                                isSubmitting={isSubmitting}
                                users={users}
                                classTeachers={classTeachers}
                            />
                        </div>
                    )}

                    <ClassTable
                        classes={filteredClasses}
                        onEdit={handleEdit}
                        onDelete={handleDeleteRequest}
                        loading={loading}
                        users={users}
                        classTeachers={classTeachers}
                    />

                    <div className="mt-4 flex justify-start">
                        <button
                            onClick={exportToExcel}
                            className="px-4 py-2 bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm transition"
                        >
                            <span className="flex items-center gap-2">
                                <Download className="w-5 h-5" />
                                Export
                            </span>
                        </button>
                    </div>

                    {showDeleteModal && deletingClass && (
                        <DeleteModal
                            schoolClass={deletingClass}
                            onConfirm={confirmDelete}
                            onCancel={() => {
                                setShowDeleteModal(false);
                                setDeletingClass(null);
                                toast("Delete canceled", { icon: "ℹ️" });
                            }}
                            isDeleting={isDeleting}
                        />
                    )}
                </div>
            </Container>
        </div>
    );
}
