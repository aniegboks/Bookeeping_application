// components/inventory_distribution_ui/distribution_table.tsx

import { Edit, Package } from "lucide-react";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";

interface DistributionTableProps {
  distributions: InventoryDistribution[];
  onEdit: (distribution: InventoryDistribution) => void;
  loading?: boolean;
}

export default function DistributionTable({
  distributions,
  onEdit,
  loading = false,
}: DistributionTableProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-sm border border-gray-200 p-12 text-center ">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading distributions...</p>
      </div>
    );
  }

  if (distributions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-sm border border-gray-200 p-12 text-center shadow-sm">
        <p className="text-gray-500">No distributions found</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-sm  border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 py-4">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Distribution
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Class ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Item ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Receiver
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-100">
            {distributions.map((distribution) => (
              <tr
                key={distribution.id}
                className="hover:bg-white/80 transition-all duration-200 group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <Package size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        Distribution
                      </div>
                      <div className="text-xs text-gray-500 max-w-[150px] truncate" title={distribution.id}>
                        ID: {distribution.id}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="max-w-[120px] truncate" title={distribution.class_id}>
                    {distribution.class_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="max-w-[120px] truncate" title={distribution.inventory_item_id}>
                    {distribution.inventory_item_id}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-teal-500 text-sm font-semibold rounded-lg">
                    {distribution.distributed_quantity}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-[150px]">
                    <div className="font-medium truncate">{distribution.receiver_name}</div>
                    <div className="text-gray-500 text-xs truncate" title={distribution.received_by}>
                      ID: {distribution.received_by}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(distribution.distribution_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onEdit(distribution)}
                    className="p-2.5  text-[#3D4C63] hover:text-[#495C79] rounded-lg  transition-all duration-200 hover:scale-110"
                    title="Edit Distribution"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}