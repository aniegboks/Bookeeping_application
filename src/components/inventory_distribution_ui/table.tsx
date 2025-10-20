import { useState, useMemo } from "react";
import { Edit, Package } from "lucide-react";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { ClassTeacher } from "@/lib/types/class_teacher";

interface DistributionTableProps {
  distributions: InventoryDistribution[];
  onEdit: (distribution: InventoryDistribution) => void;
  loading?: boolean;
  classes: SchoolClass[];
  inventoryItems: InventoryItem[];
  classTeachers: ClassTeacher[];
  itemsPerPage?: number;
}

export default function DistributionTable({
  distributions,
  onEdit,
  loading = false,
  classes,
  inventoryItems,
  classTeachers,
  itemsPerPage = 10,
}: DistributionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(distributions.length / itemsPerPage);

  const currentDistributions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return distributions.slice(startIndex, startIndex + itemsPerPage);
  }, [distributions, currentPage, itemsPerPage]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-sm border border-gray-200 p-12 text-center">
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

  const getClassName = (classId: string) =>
    classes.find((cls) => cls.id === classId)?.name || "N/A";

  const getItemName = (itemId: string) =>
    inventoryItems.find((item) => item.id === itemId)?.name || "N/A";

  const getTeacherName = (teacherId: string) => {
    const teacher = classTeachers.find((t) => t.id === teacherId);
    return teacher?.name || "N/A";
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 py-4">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Class
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Item
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
            {currentDistributions.map((distribution) => (
              <tr
                key={distribution.id}
                className="hover:bg-white/80 transition-all duration-200 group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl group-hover:scale-110 transition-transform duration-200">
                      <Package className="text-blue-600 h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {getClassName(distribution.class_id)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Class
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="max-w-[150px] truncate" title={getItemName(distribution.inventory_item_id)}>
                    {getItemName(distribution.inventory_item_id)}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-sm font-semibold rounded-lg">
                    {distribution.distributed_quantity}
                  </span>
                </td>

                <td className="px-6 py-4 text-sm text-gray-900">
                  <div className="max-w-[150px]">
                    <div className="font-medium truncate" title={distribution.receiver_name}>
                      {distribution.receiver_name}
                    </div>
                    <div className="text-gray-500 text-xs truncate" title={getTeacherName(distribution.received_by)}>
                      {getTeacherName(distribution.received_by)}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {new Date(distribution.distribution_date).toLocaleDateString()}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => onEdit(distribution)}
                    className="p-2.5 text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-all duration-200 hover:scale-110"
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

      {/* Pagination */}
      <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 text-sm gap-4">
        <span className="text-gray-600">
          Showing {Math.min((currentPage - 1) * itemsPerPage + 1, distributions.length)} - {Math.min(currentPage * itemsPerPage, distributions.length)} of {distributions.length}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-gray-700 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-md text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}