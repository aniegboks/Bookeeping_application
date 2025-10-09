import { Plus, Search } from "lucide-react";

interface CategoriesControlsProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
  onAdd: () => void;
}

export default function CategoriesControls({ searchTerm, setSearchTerm, viewMode, setViewMode, onAdd }: CategoriesControlsProps) {
  return (
    <div className="px-6 py-4 border-b flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
      <h2 className="text-lg font-semibold text-[#171D26]">All Categories</h2>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
          />
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1">
          <button onClick={() => setViewMode('list')} className={`px-3 py-1 rounded-sm text-sm font-medium ${viewMode==='list'?'bg-white shadow-sm':'text-gray-600 hover:text-gray-900'}`}>List</button>
          <button onClick={() => setViewMode('grid')} className={`px-3 py-1 rounded-sm text-sm font-medium ${viewMode==='grid'?'bg-white shadow-sm':'text-gray-600 hover:text-gray-900'}`}>Grid</button>
        </div>

        <button onClick={onAdd} className="bg-[#3D4C63] hover:bg-[#495C79] text-white px-4 py-2 rounded-sm flex items-center text-sm gap-2 transition-colors whitespace-nowrap">
          <Plus size={16} /> Add Category
        </button>
      </div>
    </div>
  );
}
