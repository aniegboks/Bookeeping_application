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
  users,
  classes,
}: BulkUploadFormProps) {
  const [rows, setRows] = useState<CollectionRow[]>([createEmptyRow()]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = rows.map(({ tempId: _tempId, ...rest }) => rest);
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
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-[#171D26]">
            Bulk Student Inventory Collection
          </h2>
          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center gap-2 text-sm px-3 py-1.5 bg-[#E8EBF0] hover:bg-[#D8DCE3] rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>
        </div>

        <div className="space-y-3">
          {rows.map((row, index) => {
            // <-- NO hooks here. Compute filtered students directly:
            const filteredStudents = row.class_id
              ? students.filter((s) => s.class_id === row.class_id)
              : [];

            return (
              <div
                key={row.tempId}
                className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center border p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* Index (hidden on mobile) */}
                <div className="hidden md:block text-center text-gray-500 font-medium">
                  {index + 1}.
                </div>

                {/* Class */}
                <select
                  value={row.class_id}
                  onChange={(e) => {
                    handleChange(row.tempId, "class_id", e.target.value);
                    // Reset student when class changes
                    handleChange(row.tempId, "student_id", "");
                  }}
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

                {/* Student (depends on class) */}
                <select
                  value={row.student_id}
                  onChange={(e) =>
                    handleChange(row.tempId, "student_id", e.target.value)
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  required
                  disabled={!row.class_id || isSubmitting}
                >
                  <option value="">
                    {row.class_id ? "Select Student" : "Select Class First"}
                  </option>
                  {filteredStudents.map((student) => (
                    <option key={student.id} value={student.id}>
                      {getFullName(student)}
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

                {/* Session Term */}
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
                    handleChange(row.tempId, "qty", parseInt(e.target.value) || 1)
                  }
                  className="p-2 border border-gray-300 rounded-lg text-sm text-center"
                  required
                  disabled={isSubmitting}
                />

                {/* Eligible */}
                <label className="flex items-center justify-center gap-1 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={row.eligible}
                    onChange={(e) =>
                      handleChange(row.tempId, "eligible", e.target.checked)
                    }
                    className="w-4 h-4 text-[#3D4C63] border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  Eligible
                </label>

                {/* Received */}
                <label className="flex items-center justify-center gap-1 text-xs text-gray-600">
                  <input
                    type="checkbox"
                    checked={row.received}
                    onChange={(e) => {
                      const received = e.target.checked;
                      handleChange(row.tempId, "received", received);
                      if (!received) {
                        handleChange(row.tempId, "received_date", null);
                      }
                    }}
                    className="w-4 h-4 text-[#3D4C63] border-gray-300 rounded"
                    disabled={isSubmitting}
                  />
                  Received
                </label>

                {/* Received Date */}
                {row.received ? (
                  <input
                    type="date"
                    value={row.received_date ? row.received_date.split("T")[0] : ""}
                    onChange={(e) =>
                      handleChange(
                        row.tempId,
                        "received_date",
                        e.target.value ? new Date(e.target.value).toISOString() : null
                      )
                    }
                    className="p-2 border border-gray-300 rounded-lg text-sm"
                    required
                    disabled={isSubmitting}
                  />
                ) : (
                  <div className="text-center text-gray-400 text-xs italic">—</div>
                )}

                {/* Given By */}
                <select
                  value={row.given_by || ""}
                  onChange={(e) => handleChange(row.tempId, "given_by", e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                  disabled={isSubmitting}
                >
                  <option value="">Given By</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleRemoveRow(row.tempId)}
                  className="text-red-600 hover:text-red-800 transition"
                  disabled={rows.length === 1 || isSubmitting}
                >
                  <Trash2 className="w-5 h-5 mx-auto" />
                </button>
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
