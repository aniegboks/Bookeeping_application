"use client";

import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// --- Types ---
import { CreateClassInventoryEntitlementInput } from "@/lib/types/class_inventory_entitlement";

interface ClassOption {
  id: string;
  name: string;
}

interface InventoryItemOption {
  id: string;
  name: string;
}

interface SessionTermOption {
  id: string;
  name: string;
}

interface UserOption {
  id: string;
  name: string;
  email: string;
}

interface EntitlementRow extends CreateClassInventoryEntitlementInput {
  tempId: string;
}

// --- Props ---
interface BulkUploadFormProps {
  onSubmit: (data: CreateClassInventoryEntitlementInput[]) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  classes: ClassOption[];
  inventoryItems: InventoryItemOption[];
  sessionTerms: SessionTermOption[];
  users: UserOption[];
}

export default function BulkUploadForm({
  onSubmit,
  onCancel,
  isSubmitting,
  classes,
  inventoryItems,
  sessionTerms,
  users,
}: BulkUploadFormProps) {
  const [rows, setRows] = useState<EntitlementRow[]>([createEmptyRow()]);
  const [error, setError] = useState<string>("");

  const isDataMissing =
    classes.length === 0 ||
    inventoryItems.length === 0 ||
    sessionTerms.length === 0 ||
    users.length === 0;

  function createEmptyRow(): EntitlementRow {
    return {
      tempId: crypto.randomUUID(),
      class_id: "",
      inventory_item_id: "",
      session_term_id: "",
      quantity: 0,
      notes: "",
      created_by: "",
    };
  }

  const addRow = () => {
    setRows([...rows, createEmptyRow()]);
  };

  const removeRow = (_tempId: string) => {
    if (rows.length === 1) {
      setError("You must have at least one row.");
      return;
    }
    setRows(rows.filter((r) => r.tempId !== _tempId));
    setError("");
  };

  const updateRow = <K extends keyof CreateClassInventoryEntitlementInput>(
    _tempId: string,
    field: K,
    value: CreateClassInventoryEntitlementInput[K]
  ) => {
    setRows((prev) =>
      prev.map((row) => (row.tempId === _tempId ? { ...row, [field]: value } : row))
    );
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isDataMissing) {
      setError(
        "Cannot submit: Dropdown options failed to load. Please refresh."
      );
      return;
    }

    const invalidRows: number[] = [];
    const consolidatedMap = new Map<string, CreateClassInventoryEntitlementInput>();

    rows.forEach((row, i) => {
      if (
        !row.class_id ||
        !row.inventory_item_id ||
        !row.session_term_id ||
        !row.created_by ||
        row.quantity < 0
      ) {
        invalidRows.push(i + 1);
        return;
      }

      const key = `${row.class_id}-${row.inventory_item_id}-${row.session_term_id}`;
      const { tempId, ...cleanRow } = row;

      const existing = consolidatedMap.get(key);
      if (existing) {
        const newQuantity = existing.quantity + cleanRow.quantity;
        consolidatedMap.set(key, {
          ...existing,
          quantity: newQuantity,
          notes: cleanRow.notes,
          created_by: cleanRow.created_by,
        });
        toast.error(
          `Consolidating duplicate entry for row ${i + 1}. Quantity is now ${newQuantity}.`,
          { duration: 5000, icon: "🔄" }
        );
      } else {
        consolidatedMap.set(key, cleanRow);
      }
    });

    if (invalidRows.length > 0) {
      setError(`Please fill all required fields for row(s): ${invalidRows.join(", ")}`);
      return;
    }

    const finalData = Array.from(consolidatedMap.values());

    if (finalData.length === 0 && rows.length > 0) {
      setError("The final list of entitlements is empty.");
      return;
    }

    await onSubmit(finalData);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg max-w-6xl w-full p-6 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-semibold text-[#171D26]">
            Bulk Create Entitlements
          </h2>
          <button
            type="button"
            onClick={addRow}
            disabled={isSubmitting || isDataMissing}
            className="flex items-center gap-2 text-[#171D26] transition-colors disabled:opacity-50"
          >
            <Plus size={16} /> Add Row
          </button>
        </div>

        {(error || isDataMissing) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">
              {isDataMissing
                ? "⚠️ Data Warning: Dropdown options failed to load. Cannot submit."
                : error}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4 overflow-x-auto">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {["Class", "Inventory Item", "Session Term", "Quantity", "Notes", "Created By", "Action"].map(
                        (header) => (
                          <th
                            key={header}
                            className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {header}
                            {["Class", "Inventory Item", "Session Term", "Quantity", "Created By"].includes(header) && (
                              <span className="text-red-500">*</span>
                            )}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row) => (
                      <tr key={row.tempId} className="hover:bg-gray-50">
                        <td className="px-3 py-2">
                          <select
                            value={row.class_id}
                            onChange={(e) => updateRow(row.tempId, "class_id", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                            disabled={isSubmitting || isDataMissing}
                          >
                            <option value="">Select Class</option>
                            {classes.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name || c.id}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.inventory_item_id}
                            onChange={(e) => updateRow(row.tempId, "inventory_item_id", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                            disabled={isSubmitting || isDataMissing}
                          >
                            <option value="">Select Item</option>
                            {inventoryItems.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name || item.id}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.session_term_id}
                            onChange={(e) => updateRow(row.tempId, "session_term_id", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                            disabled={isSubmitting || isDataMissing}
                          >
                            <option value="">Select Term</option>
                            {sessionTerms.map((term) => (
                              <option key={term.id} value={term.id}>
                                {term.name || term.id}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="number"
                            min={0}
                            value={row.quantity}
                            onChange={(e) =>
                              updateRow(row.tempId, "quantity", e.target.value === "" ? 0 : parseInt(e.target.value))
                            }
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                            disabled={isSubmitting}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <input
                            type="text"
                            value={row.notes}
                            onChange={(e) => updateRow(row.tempId, "notes", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                            placeholder="Optional notes"
                            disabled={isSubmitting}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.created_by}
                            onChange={(e) => updateRow(row.tempId, "created_by", e.target.value)}
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                            disabled={isSubmitting || isDataMissing}
                          >
                            <option value="">Select User</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name || user.email || user.id}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <button
                            type="button"
                            onClick={() => removeRow(row.tempId)}
                            disabled={isSubmitting || rows.length === 1}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-30"
                            title="Remove row"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Total rows: <span className="font-semibold">{rows.length}</span>
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDataMissing}
                className="px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving {rows.length}...
                  </>
                ) : (
                  `Create ${rows.length} Entitlement${rows.length > 1 ? "s" : ""}`
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
