import { useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { ClassInventoryEntitlement } from "@/lib/types/class_inventory_entitlement";
import { InventoryItem } from "@/lib/types/inventory_item";
import { SchoolClass } from "@/lib/types/classes";
import { AcademicSession } from "@/lib/types/academic_session";
import { User } from "@/lib/types/user";

interface EntitlementTableProps {
  entitlements: ClassInventoryEntitlement[];
  onEdit: (entitlement: ClassInventoryEntitlement) => void;
  onDelete: (entitlement: ClassInventoryEntitlement) => void;
  loading?: boolean;
  inventoryItems: InventoryItem[];
  classes: SchoolClass[];
  academicSessions: AcademicSession[];
  users: User[];
  pageSize?: number; // optional, default page size
}

export default function EntitlementTable({
  entitlements,
  onEdit,
  onDelete,
  loading = false,
  inventoryItems,
  classes,
  academicSessions,
  pageSize = 10,
}: EntitlementTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D4C63] mx-auto"></div>
        <p className="mt-4 text-gray-500">Loading entitlements...</p>
      </div>
    );
  }

  if (entitlements.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <p className="text-gray-500">No entitlements found</p>
      </div>
    );
  }

  // Lookup maps for fast name access
  const itemMap = Object.fromEntries((inventoryItems || []).map((item) => [item.id, item.name || "Unnamed Item"]));
  const classMap = Object.fromEntries((classes || []).map((cls) => [cls.id, cls.name || "Unnamed Class"]));
  const sessionMap = Object.fromEntries((academicSessions || []).map((session) => [session.id, session.name || "Unnamed Session"]));

  // Pagination calculations
  const totalPages = Math.ceil(entitlements.length / pageSize);
  const paginatedEntitlements = entitlements.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="bg-white rounded-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory Item</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session Term</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedEntitlements.map((entitlement) => (
              <tr key={entitlement.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-[150px] truncate" title={classMap[entitlement.class_id] || entitlement.class_id}>
                    {classMap[entitlement.class_id] || entitlement.class_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-[150px] truncate" title={itemMap[entitlement.inventory_item_id] || entitlement.inventory_item_id}>
                    {itemMap[entitlement.inventory_item_id] || entitlement.inventory_item_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="max-w-[150px] truncate" title={sessionMap[entitlement.session_term_id] || entitlement.session_term_id}>
                    {sessionMap[entitlement.session_term_id] || entitlement.session_term_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${entitlement.quantity < 5
                        ? "bg-red-100 text-red-800"
                        : entitlement.quantity < 10
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                  >
                    {entitlement.quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="max-w-[200px] truncate">{entitlement.notes || "—"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(entitlement.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(entitlement)}
                      className="p-2 text-[#3D4C63] hover:text-[#495C79] rounded-sm transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(entitlement)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center py-4 px-6 border-t border-gray-200 bg-gray-50">
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
