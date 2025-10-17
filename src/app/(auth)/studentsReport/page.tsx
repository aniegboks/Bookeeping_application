"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, FileText, Search, Filter, X, Printer } from "lucide-react";

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
  const [showFilters, setShowFilters] = useState(true);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);

  const printRef = useRef<HTMLDivElement>(null);

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
        {/* Header */}
        <div className="mb-6 print:mb-4">
          <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
            Student Inventory Collection Report
          </h1>
          <p className="text-gray-600 mt-2 print:text-sm">
            Detailed inventory distribution report with comprehensive filtering
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6 print:hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              {showFilters ? "Hide" : "Show"}
            </button>
          </div>

          {showFilters && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Student Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student
                  </label>
                  <select
                    value={filters.student_id || ""}
                    onChange={(e) => setFilters({ ...filters, student_id: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Students</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.first_name} {s.last_name} ({s.admission_number})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={filters.class_id || ""}
                    onChange={(e) => setFilters({ ...filters, class_id: e.target.value || undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Session Term Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Session Term
                  </label>
                  <select
                    value={filters.session_term_id || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, session_term_id: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Sessions</option>
                    {academicSessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.session} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Inventory Item Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inventory Item
                  </label>
                  <select
                    value={filters.inventory_item_id || ""}
                    onChange={(e) =>
                      setFilters({ ...filters, inventory_item_id: e.target.value || undefined })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Items</option>
                    {inventoryItems.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Eligible Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Eligible Status
                  </label>
                  <select
                    value={filters.eligible === undefined ? "" : filters.eligible.toString()}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        eligible: e.target.value === "" ? undefined : e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="true">Eligible</option>
                    <option value="false">Not Eligible</option>
                  </select>
                </div>

                {/* Received Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Received Status
                  </label>
                  <select
                    value={filters.received === undefined ? "" : filters.received.toString()}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        received: e.target.value === "" ? undefined : e.target.value === "true",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="true">Received</option>
                    <option value="false">Not Received</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={fetchCollections}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-4 h-4" />
                  {loading ? "Searching..." : "Generate Report"}
                </button>
                <button
                  onClick={clearFilters}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-md transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search and Export */}
        {collections.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 print:hidden">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 w-full md:max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by student name, admission number, item..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleExportExcel}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Excel
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print/PDF
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        {collections.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 print:mb-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-600">Total Records</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-green-50 rounded-lg shadow-sm p-4">
              <div className="text-sm text-green-600">Eligible</div>
              <div className="text-2xl font-bold text-green-700">{stats.eligible}</div>
            </div>
            <div className="bg-blue-50 rounded-lg shadow-sm p-4">
              <div className="text-sm text-blue-600">Received</div>
              <div className="text-2xl font-bold text-blue-700">{stats.received}</div>
            </div>
            <div className="bg-orange-50 rounded-lg shadow-sm p-4">
              <div className="text-sm text-orange-600">Pending</div>
              <div className="text-2xl font-bold text-orange-700">{stats.pending}</div>
            </div>
          </div>
        )}

        {/* Data Table */}
        <div ref={printRef} className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader />
            </div>
          ) : collections.length === 0 ? (
            <div className="text-center py-20">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Data</h3>
              <p className="text-gray-500">
                Select filters and click "Generate Report" to view data
              </p>
            </div>
          ) : filteredCollections.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Results</h3>
              <p className="text-gray-500">No records match your search criteria</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student Info</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Guardian</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Session</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Received</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Given By</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCollections.map((c) => {
                    const student = students.find((s) => s.id === c.student_id);
                    const item = inventoryItems.find((i) => i.id === c.inventory_item_id);
                    const session = academicSessions.find((s) => s.id === c.session_term_id);
                    const classObj = classes.find((cl) => cl.id === c.class_id);
                    const givenByUser = users.find((u) => u.id === c.given_by);
                    const categoryItem = categories.find((cat) => cat.id === item?.category_id);

                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student ? `${student.first_name} ${student.middle_name || ""} ${student.last_name}`.trim() : "N/A"}
                          </div>
                          <div className="text-sm text-gray-500">{student?.admission_number || "N/A"}</div>
                          <div className="text-xs text-gray-400">{student?.gender || ""}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{classObj?.name || "N/A"}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student?.guardian_name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{student?.guardian_contact || ""}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{session?.session || "N/A"}</div>
                          <div className="text-xs text-gray-500">{session?.name || ""}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item?.name || "N/A"}</div>
                          <div className="text-xs text-gray-500">{categoryItem?.name || ""}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{c.qty}</td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.eligible ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                            {c.eligible ? "Eligible" : "Not Eligible"}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${c.received ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"}`}>
                            {c.received ? "Received" : "Pending"}
                          </span>
                          {c.received_date && <div className="text-xs text-gray-500 mt-1">{new Date(c.received_date).toLocaleDateString()}</div>}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">{givenByUser?.name || "N/A"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

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