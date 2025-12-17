"use client";

import { useState, useMemo } from "react";
import {
  Plus,
  Trash2,
  Users,
  AlertCircle,
  CheckCircle,
  Package,
  Info,
} from "lucide-react";
import {
  CreateStudentInventoryCollectionInput,
  StudentInventoryCollection,
} from "@/lib/types/student_inventory_collection";
import { Student } from "@/lib/types/students";
import { InventoryItem } from "@/lib/types/inventory_item";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import {
  getFilteredInventoryItems,
  formatDistributedItemDisplay,
  getStockStatus,
} from "@/lib/utils/inventory_distribution_helper";

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
  distributions: InventoryDistribution[];
  collections: StudentInventoryCollection[]; // ADD THIS
  classes: Class[];
}

interface CollectionRow extends CreateStudentInventoryCollectionInput {
  tempId: string;
  selectedStudents: string[];
}

export default function BulkUploadForm({
  onSubmit,
  onCancel,
  isSubmitting,
  students,
  inventoryItems,
  sessionTerms,
  users,
  distributions,
  collections, // ADD THIS
  classes,
}: BulkUploadFormProps) {
  const [rows, setRows] = useState<CollectionRow[]>([createEmptyRow()]);

  function createEmptyRow(): CollectionRow {
    return {
      tempId: crypto.randomUUID(),
      class_id: "",
      selectedStudents: [],
      student_id: "",
      session_term_id: "",
      inventory_item_id: "",
      qty: 1,
      eligible: true,
      received: false,
      received_date: null,
      given_by: "",
    };
  }

  const handleAddRow = () => setRows((r) => [...r, createEmptyRow()]);
  const handleRemoveRow = (tempId: string) =>
    setRows((prev) => prev.filter((row) => row.tempId !== tempId));

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

  const handleClassSelect = (tempId: string, classId: string) => {
    const classStudents = students.filter((s) => s.class_id === classId);
    const allStudentIds = classStudents.map((s) => s.id);
    setRows((prev) =>
      prev.map((r) =>
        r.tempId === tempId
          ? {
              ...r,
              class_id: classId,
              selectedStudents: allStudentIds,
              inventory_item_id: "", // Reset item when class changes
            }
          : r
      )
    );
  };

  const handleSessionSelect = (tempId: string, sessionId: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.tempId === tempId
          ? {
              ...r,
              session_term_id: sessionId,
              inventory_item_id: "", // Reset item when session changes
            }
          : r
      )
    );
  };

  const toggleStudentSelection = (tempId: string, studentId: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.tempId !== tempId) return r;
        const selected = r.selectedStudents.includes(studentId)
          ? r.selectedStudents.filter((id) => id !== studentId)
          : [...r.selectedStudents, studentId];
        return { ...r, selectedStudents: selected };
      })
    );
  };

  // Get available items for each row based on class/session distributions
  const getRowAvailableItems = (row: CollectionRow) => {
    if (!row.class_id || !row.session_term_id) {
      return [];
    }
    return getFilteredInventoryItems(
      inventoryItems,
      distributions,
      collections,
      row.class_id,
      row.session_term_id
    );
  };

  // Validate all assignments - group by item/class/session to check totals
  const validationIssues = useMemo(() => {
    const grouped = new Map<
      string,
      {
        itemId: string;
        classId: string;
        sessionTermId: string;
        totalRequested: number;
      }
    >();

    // Group all requests by item/class/session
    rows.forEach((row) => {
      if (
        !row.inventory_item_id ||
        !row.class_id ||
        !row.session_term_id ||
        row.selectedStudents.length === 0
      ) {
        return;
      }

      const key = `${row.inventory_item_id}-${row.class_id}-${row.session_term_id}`;
      const totalNeeded = row.qty * row.selectedStudents.length;

      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.totalRequested += totalNeeded;
      } else {
        grouped.set(key, {
          itemId: row.inventory_item_id,
          classId: row.class_id,
          sessionTermId: row.session_term_id,
          totalRequested: totalNeeded,
        });
      }
    });

    // Check each group against available stock
    const issues: Array<{
      itemId: string;
      classId: string;
      sessionTermId: string;
      requested: number;
      available: number;
      issue: string;
    }> = [];

    grouped.forEach((group) => {
      const stockStatus = getStockStatus(
        distributions,
        collections,
        group.itemId,
        group.classId,
        group.sessionTermId
      );

      // Debug logging
      console.log("Bulk Validation Check:", {
        itemId: group.itemId,
        classId: group.classId,
        sessionTermId: group.sessionTermId,
        itemName: inventoryItems.find((i) => i.id === group.itemId)?.name,
        className: classes.find((c) => c.id === group.classId)?.name,
        totalRequested: group.totalRequested,
        stockStatus,
      });

      if (group.totalRequested > stockStatus.available) {
        issues.push({
          itemId: group.itemId,
          classId: group.classId,
          sessionTermId: group.sessionTermId,
          requested: group.totalRequested,
          available: stockStatus.available,
          issue: `Need ${group.totalRequested}, only ${stockStatus.available} available`,
        });
      }
    });

    return issues;
  }, [rows, distributions, collections, inventoryItems, classes]);

  const hasValidationIssues = validationIssues.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (hasValidationIssues) {
      return;
    }

    const submitData = rows.flatMap(({ tempId, selectedStudents, ...rest }) =>
      selectedStudents.map((sid) => ({ ...rest, student_id: sid }))
    );
    await onSubmit(submitData);
  };

  const getFullName = (s: Student) =>
    [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");

  const getRowStockInfo = (row: CollectionRow) => {
    if (
      !row.inventory_item_id ||
      row.selectedStudents.length === 0 ||
      !row.class_id ||
      !row.session_term_id
    ) {
      return null;
    }

    const stockStatus = getStockStatus(
      distributions,
      collections,
      row.inventory_item_id,
      row.class_id,
      row.session_term_id
    );

    const totalNeeded = row.qty * row.selectedStudents.length;
    const isValid = totalNeeded <= stockStatus.available;
    const item = inventoryItems.find((i) => i.id === row.inventory_item_id);

    return {
      ...stockStatus,
      totalNeeded,
      isValid,
      itemName: item?.name || "Unknown",
    };
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 overflow-auto p-4">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-2xl w-full max-w-7xl shadow-xl border border-gray-200"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-[#171D26] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Bulk Student Inventory Collection
          </h2>
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>

        {/* Validation Issues Summary */}
        {hasValidationIssues && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-red-900 mb-2">
                  Insufficient Available Stock
                </h3>
                <div className="space-y-2 text-sm text-red-800">
                  {validationIssues.map((issue, idx) => {
                    const item = inventoryItems.find(
                      (i) => i.id === issue.itemId
                    );
                    const cls = classes.find((c) => c.id === issue.classId);
                    const session = sessionTerms.find(
                      (s) => s.id === issue.sessionTermId
                    );

                    // Get detailed stock info for display
                    const stockStatus = getStockStatus(
                      distributions,
                      collections,
                      issue.itemId,
                      issue.classId,
                      issue.sessionTermId
                    );

                    return (
                      <div
                        key={idx}
                        className="bg-white/50 rounded p-3 border border-red-300"
                      >
                        <div className="font-medium text-base mb-1">
                          {item?.name || "Unknown Item"} →{" "}
                          {cls?.name || "Unknown Class"} (
                          {session?.name || "Unknown Session"})
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>Total distributed:</span>
                            <span className="font-medium">
                              {stockStatus.totalDistributed}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Already assigned:</span>
                            <span className="font-medium">
                              {stockStatus.totalAssigned}
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-red-200 pt-1">
                            <span>Available:</span>
                            <span className="font-medium">
                              {stockStatus.available}
                            </span>
                          </div>
                          <div className="flex justify-between text-red-900 font-semibold border-t border-red-300 pt-1 mt-1">
                            <span>{"You're trying to assign:"}</span>
                            <span>{issue.requested}</span>
                          </div>
                          <div className="flex justify-between text-red-900 font-semibold">
                            <span>Short by:</span>
                            <span>
                              {issue.requested - stockStatus.available}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="mt-3 text-sm text-red-700 font-medium">
                  Please reduce quantities, deselect some students, or
                  distribute more items to the classes first.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {rows.map((row, index) => {
            const filteredStudents = students.filter(
              (s) => s.class_id === row.class_id
            );
            const availableItems = getRowAvailableItems(row);
            const stockInfo = getRowStockInfo(row);

            return (
              <div
                key={row.tempId}
                className="border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">Row {index + 1}</h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.tempId)}
                    className="text-red-600 hover:text-red-800 transition"
                    disabled={rows.length === 1 || isSubmitting}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Distribution status banner */}
                {row.class_id &&
                  row.session_term_id &&
                  availableItems.length === 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 flex items-center gap-2">
                      <Package className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      <span className="text-sm text-amber-800">
                        No items available - either not distributed or fully
                        assigned
                      </span>
                    </div>
                  )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Class */}
                  <select
                    value={row.class_id}
                    onChange={(e) =>
                      handleClassSelect(row.tempId, e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>

                  {/* Term */}
                  <select
                    value={row.session_term_id}
                    onChange={(e) =>
                      handleSessionSelect(row.tempId, e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Term</option>
                    {sessionTerms.map((term) => (
                      <option key={term.id} value={term.id}>
                        {term.name} ({term.session})
                      </option>
                    ))}
                  </select>

                  {/* Inventory Item - Filtered */}
                  <select
                    value={row.inventory_item_id}
                    onChange={(e) =>
                      handleChange(
                        row.tempId,
                        "inventory_item_id",
                        e.target.value
                      )
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    required
                    disabled={
                      isSubmitting || !row.class_id || !row.session_term_id
                    }
                  >
                    <option value="">
                      {!row.class_id || !row.session_term_id
                        ? "Select class & term first"
                        : availableItems.length === 0
                        ? "No items available"
                        : "Select Item"}
                    </option>
                    {availableItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {formatDistributedItemDisplay(item)}
                      </option>
                    ))}
                  </select>

                  {/* Quantity */}
                  <input
                    type="number"
                    min={1}
                    value={row.qty}
                    onChange={(e) =>
                      handleChange(
                        row.tempId,
                        "qty",
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm text-center"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Stock Info for this row */}
                {stockInfo && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-white rounded px-2 py-1">
                      <Info className="w-3 h-3" />
                      <span>
                        {stockInfo.totalDistributed} distributed,{" "}
                        {stockInfo.totalAssigned} assigned to others,{" "}
                        {stockInfo.available} available
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                        stockInfo.isValid
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                      }`}
                    >
                      {stockInfo.isValid ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                      <span>
                        Need {stockInfo.totalNeeded} {stockInfo.itemName} for{" "}
                        {row.selectedStudents.length} students
                        {!stockInfo.isValid &&
                          ` (only ${stockInfo.available} available)`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Eligible / Received Checkboxes */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`eligible-${row.tempId}`}
                      checked={row.eligible}
                      onChange={(e) =>
                        handleChange(row.tempId, "eligible", e.target.checked)
                      }
                      className="w-4 h-4 text-[#3D4C63] border-gray-300 rounded focus:ring-[#3D4C63]"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`eligible-${row.tempId}`}
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Eligible
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`received-${row.tempId}`}
                      checked={row.received}
                      onChange={(e) =>
                        handleChange(row.tempId, "received", e.target.checked)
                      }
                      className="w-4 h-4 text-[#3D4C63] border-gray-300 rounded focus:ring-[#3D4C63]"
                      disabled={isSubmitting}
                    />
                    <label
                      htmlFor={`received-${row.tempId}`}
                      className="ml-2 text-sm font-medium text-gray-700"
                    >
                      Received
                    </label>
                  </div>
                </div>

                {/* Student List */}
                {row.class_id && filteredStudents.length > 0 && (
                  <div className="mt-3 border-t pt-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Select Students ({row.selectedStudents.length}/
                      {filteredStudents.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {filteredStudents.map((student) => (
                        <label
                          key={student.id}
                          className={`flex items-center gap-1 px-2 py-1 border rounded-lg text-xs cursor-pointer transition ${
                            row.selectedStudents.includes(student.id)
                              ? "bg-[#3D4C63] text-white border-[#3D4C63]"
                              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={row.selectedStudents.includes(student.id)}
                            onChange={() =>
                              toggleStudentSelection(row.tempId, student.id)
                            }
                            className="hidden"
                            disabled={isSubmitting}
                          />
                          {getFullName(student)}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end pt-4 border-t">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || hasValidationIssues}
              className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                "Submit All"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
