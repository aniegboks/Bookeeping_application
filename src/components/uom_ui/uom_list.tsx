import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { UOM } from "@/lib/types/uom";
import UOMListItem from "./uom_list_item";
import SmallLoader from "../ui/small_loader";

interface UOMListProps {
  uoms: UOM[];
  loading?: boolean;
  onEdit: (uom: UOM) => void;
  onDelete: (id: string, name: string) => void;
  openCreateModal: () => void;
}

export default function UOMList({ 
  uoms, 
  loading = false,
  onEdit, 
  onDelete, 
  openCreateModal 
}: UOMListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUOMs = uoms.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-[#171D26]">All Units of Measure</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search UOMs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63] text-[#171D26]"
            />
          </div>
          <button
            onClick={openCreateModal}
            className="bg-[#3D4C63] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#495C79] transition-colors"
          >
            <Plus size={16} /> Add UOM
          </button>
        </div>
      </div>

      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Symbol</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={4} className="text-center py-12 text-gray-500">
                <SmallLoader />
              </td>
            </tr>
          ) : filteredUOMs.length > 0 ? (
            filteredUOMs.map(uom => (
              <UOMListItem key={uom.id} uom={uom} onEdit={onEdit} onDelete={onDelete} />
            ))
          ) : (
            <tr>
              <td colSpan={4} className="text-center py-12 text-gray-500">
                {searchTerm ? "No UOMs found matching your search" : "No UOMs found"}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}