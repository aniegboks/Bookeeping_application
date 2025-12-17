import { useState, useMemo } from "react";
import { Edit, Package, Search, X } from "lucide-react";
import { InventoryDistribution } from "@/lib/types/inventory_distribution";
import { SchoolClass } from "@/lib/types/classes";
import { InventoryItem } from "@/lib/types/inventory_item";
import { ClassTeacher } from "@/lib/types/class_teacher";
import { AcademicSession } from "@/lib/types/academic_session";

interface DistributionTableProps {
  distributions: InventoryDistribution[];
  onEdit: (distribution: InventoryDistribution) => void;
  loading?: boolean;
  classes: SchoolClass[];
  inventoryItems: InventoryItem[];
  classTeachers: ClassTeacher[];
  academicSessions: AcademicSession[];
  itemsPerPage?: number;
  canUpdate?: boolean;
}

export default function DistributionTable({
  distributions,
  onEdit,
  loading = false,
  classes,
  inventoryItems,
  classTeachers,
  academicSessions,
  itemsPerPage = 10,
  canUpdate = true,
}: DistributionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sessionFilter, setSessionFilter] = useState<string>("");
  const [classFilter, setClassFilter] = useState<string>("");
  const [itemSearch, setItemSearch] = useState<string>("");

  // Filter distributions based on all filters
  const filteredDistributions = useMemo(() => {
    return distributions.filter((distribution) => {
      const matchesSession = !sessionFilter || distribution.session_term_id === sessionFilter;
      const matchesClass = !classFilter || distribution.class_id === classFilter;
      
      const itemInfo = inventoryItems.find((i) => i.id === distribution.inventory_item_id);
      const itemName = itemInfo?.name || "";
      const matchesItemSearch = !itemSearch || itemName.toLowerCase().includes(itemSearch.toLowerCase());
      
      return matchesSession && matchesClass && matchesItemSearch;
    });
  }, [distributions, sessionFilter, classFilter, itemSearch, inventoryItems]);

  const totalPages = Math.ceil(filteredDistributions.length / itemsPerPage);

  const currentDistributions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDistributions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDistributions, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  useMemo(() => {
    setCurrentPage(1);
  }, [sessionFilter, classFilter, itemSearch]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const clearFilters = () => {
    setSessionFilter("");
    setClassFilter("");
    setItemSearch("");
  };

  const hasActiveFilters = sessionFilter || classFilter || itemSearch;

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-sm border border-gray-200 p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-500 font-medium">Loading distributions...</p>
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

  const getSessionName = (sessionId: string) =>
    academicSessions.find((session) => session.id === sessionId)?.name || "N/A";

  return (
    <div className="bg-gradient-to-br from-white to-gray-50/50 rounded-sm border border-gray-200 overflow-hidden">
      {/* Filters Section */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Item Search */}
          <div className="relative">
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Search Item
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by item name..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Session Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Academic Session
            </label>
            <select
              value={sessionFilter}
              onChange={(e) => setSessionFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Sessions</option>
              {academicSessions.map((session) => (
                <option key={session.id} value={session.id}>
                  {session.name}
                </option>
              ))}
            </select>
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">
              Class
            </label>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">
              Showing {filteredDistributions.length} of {distributions.length} records
            </span>
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <X className="h-4 w-4" />
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      {filteredDistributions.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-gray-500">
            {hasActiveFilters 
              ? "No distributions found matching your filters" 
              : "No distributions found"}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Clear filters to see all distributions
            </button>
          )}
        </div>
      ) : (
        <>
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
                    Session
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
                  {canUpdate && (
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
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

                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="max-w-[150px] truncate" title={getSessionName(distribution.session_term_id)}>
                        {getSessionName(distribution.session_term_id)}
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

                    {canUpdate && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => onEdit(distribution)}
                          className="p-2.5 text-[#3D4C63] hover:text-[#495C79] rounded-lg transition-all duration-200 hover:scale-110"
                          title="Edit Distribution"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200 text-sm gap-4">
            <span className="text-gray-600">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredDistributions.length)} - {Math.min(currentPage * itemsPerPage, filteredDistributions.length)} of {filteredDistributions.length}
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
        </>
      )}
    </div>
  );
}