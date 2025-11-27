"use client";

import { Search, Plus, Upload } from "lucide-react";

interface ControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;

    filterSupplierId: string;
    onFilterSupplierIdChange: (value: string) => void;

    filterTransactionType: string;
    onFilterTransactionTypeChange: (value: string) => void;

    filterStatus: string;
    onFilterStatusChange: (value: string) => void;

    onAdd: () => void;
    onBulkAdd?: () => void;
    canCreate?: boolean;
}

export default function Controls({
    searchTerm,
    onSearchChange,
    filterSupplierId,
    onFilterSupplierIdChange,
    filterTransactionType,
    onFilterTransactionTypeChange,
    filterStatus,
    onFilterStatusChange,
    onAdd,
    onBulkAdd,
    canCreate = true,
}: ControlsProps) {
    return (
        <div className="bg-white rounded-sm border border-gray-200 p-4">
            <div className="flex justify-between items-center lg gap-4">
                {/* Search and Action Buttons */}
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Transaction Type Filter - Only Payment and Purchase */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Transaction Type
                        </label>
                        <select
                            value={filterTransactionType}
                            onChange={(e) => onFilterTransactionTypeChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                        >
                            <option value="">All Types</option>
                            <option value="payment">Payment</option>
                            <option value="purchase">Purchase</option>
                        </select>
                    </div>

                    {/* Status Filter - Only Pending and Completed */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => onFilterStatusChange(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div className="flex justify-between items-center lg:flex-row gap-4">

                    {/* Action Buttons - Only show if user has create permission */}
                    {canCreate && (
                        <div className="flex gap-2">
                            <button
                                onClick={onAdd}
                                className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] text-sm transition-colors whitespace-nowrap"
                            >
                                <Plus size={20} />
                                Add Transaction
                            </button>
                            {onBulkAdd && (
                                <button
                                    onClick={onBulkAdd}
                                    className="flex items-center gap-2 px-4 py-2 bg-[#3D4C63] text-white rounded-sm hover:bg-[#495C79] text-sm transition-colors whitespace-nowrap"
                                >
                                    <Upload size={20} />
                                    Bulk Add
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}