// components/user_ui/controls.tsx

import { Search, Plus } from "lucide-react";

interface ControlsProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAdd: () => void;
}

export default function Controls({
    searchTerm,
    onSearchChange,
    onAdd,
}: ControlsProps) {
    return (
        <div className="bg-white rounded-sm border border-gray-200 border-b-0 p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-semibold">Users Role Managment</h3>
                <div className="gap-4 flex">
                <div className="w-full sm:w-72"> {/* reduced width */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by email, phone, or ID..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3D4C63]"
                        />
                    </div>
                </div>

                {/* Add Button */}
                <button
                    onClick={onAdd}
                    className="bg-[#3D4C63] text-white px-4 py-2 rounded-sm text-sm flex items-center gap-2 hover:bg-[#495C79] transition-colors whitespace-nowrap"
                >
                    <Plus size={20} />
                    Add User
                </button>
                </div>
            </div>
        </div>

    );
}