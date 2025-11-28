"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Users } from "lucide-react";
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
          ? { ...r, class_id: classId, selectedStudents: allStudentIds }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = rows.flatMap(({ tempId, selectedStudents, ...rest }) =>
      selectedStudents.map((sid) => ({ ...rest, student_id: sid }))
    );
    await onSubmit(submitData);
  };

  const getFullName = (s: Student) =>
    [s.first_name, s.middle_name, s.last_name].filter(Boolean).join(" ");

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

        <div className="space-y-5">
          {rows.map((row, index) => {
            const filteredStudents = students.filter(
              (s) => s.class_id === row.class_id
            );

            return (
              <div
                key={row.tempId}
                className="border border-gray-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition p-4 space-y-3"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-700">
                    Row {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(row.tempId)}
                    className="text-red-600 hover:text-red-800 transition"
                    disabled={rows.length === 1 || isSubmitting}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

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

                  {/* Inventory Item */}
                  <select
                    value={row.inventory_item_id}
                    onChange={(e) =>
                      handleChange(row.tempId, "inventory_item_id", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Item</option>
                    {inventoryItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  {/* Term */}
                  <select
                    value={row.session_term_id}
                    onChange={(e) =>
                      handleChange(row.tempId, "session_term_id", e.target.value)
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

                  {/* Given By */}
                  {/**   <select
                    value={row.given_by || ""}
                    onChange={(e) =>
                      handleChange(row.tempId, "given_by", e.target.value)
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    disabled={isSubmitting}
                  >
                    <option value="">Given By</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>*/}

                </div>

                {/* ✅ Eligible / Received Checkboxes */}
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
                          className={`flex items-center gap-1 px-2 py-1 border rounded-lg text-xs cursor-pointer transition ${row.selectedStudents.includes(student.id)
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
              disabled={isSubmitting}
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
