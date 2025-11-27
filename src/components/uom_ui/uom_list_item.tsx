import { PenSquare, Trash2 } from "lucide-react";
import { UOM } from "@/lib/types/uom";

interface UOMListItemProps {
  uom: UOM;
  onEdit: (uom: UOM) => void;
  onDelete: (id: string, name: string) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
}

export default function UOMListItem({ 
  uom, 
  onEdit, 
  onDelete,
  canUpdate = true,
  canDelete = true,
}: UOMListItemProps) {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  // Check if user has any action permissions
  const hasAnyActionPermission = canUpdate || canDelete;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 text-[#171D26]">{uom.name}</td>
      <td className="px-6 py-4 text-gray-500">{uom.symbol}</td>
      <td className="px-6 py-4 text-gray-500">{formatDate(uom.created_at)}</td>
      {/* Only show actions cell if user has any action permission */}
      {hasAnyActionPermission && (
        <td className="px-6 py-4 flex gap-2">
          {/* Only show Edit button if user can update */}
          {canUpdate && (
            <button 
              onClick={() => onEdit(uom)} 
              className="text-[#3D4C63] hover:text-[#495C79] p-2 rounded hover:bg-blue-50"
              title="Edit UOM"
            >
              <PenSquare className="h-4 w-4" />
            </button>
          )}
          {/* Only show Delete button if user can delete */}
          {canDelete && (
            <button 
              onClick={() => onDelete(uom.id, uom.name)} 
              className="text-red-600 hover:text-red-900 p-2 rounded hover:bg-red-50"
              title="Delete UOM"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </td>
      )}
    </tr>
  );
}