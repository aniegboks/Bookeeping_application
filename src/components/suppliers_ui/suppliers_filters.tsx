"use client";

import React from "react";
import { Filter, Search, Plus } from "lucide-react";
import { Supplier } from "@/lib/types/suppliers";

interface Props {
    searchTerm: string;
    setSearchTerm: (val: string) => void;
    filterCountry: string;
    setFilterCountry: (val: string) => void;
    suppliers: Supplier[];
    setShowAddModal: (val: boolean) => void;
}

export default function SuppliersFilters({
    searchTerm,
    setSearchTerm,
    filterCountry,
    setFilterCountry,
    suppliers,
    setShowAddModal,
}: Props) {
    const countries = ["all", ...new Set(suppliers.map((s) => s.country))];

    return (
        <div className="bg-white mt-8 p-4 border border-slate-200">
            {/* Flex row with space between */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">

                {/* Search bar */}
                <div className="relative w-full md:w-64">
                    <Search
                        className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-slate-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search suppliers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <div className="my-4 flex">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-6 py-2  bg-[#3D4C63] hover:bg-[#495C79] text-white rounded-sm"
                        >
                            <Plus size={18} />
                            Add Supplier
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select
                            value={filterCountry}
                            onChange={(e) => setFilterCountry(e.target.value)}
                            className="px-3 py-1.5 text-sm border border-slate-300 rounded-md 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                            {countries.map((country) => (
                                <option key={country} value={country}>
                                    {country === "all" ? "All Countries" : country}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
