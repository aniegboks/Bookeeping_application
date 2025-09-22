import SmallLoader from "../ui/small_loader";

interface CategoryModalProps {
  show: boolean;
  onClose: () => void;
  formData: { name: string };
  setFormData: (val: { name: string }) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  editingCategory: any;
}

export default function CategoryModal({ show, onClose, formData, setFormData, onSubmit, isSubmitting, editingCategory }: CategoryModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg text-[#171D26] font-semibold mb-4">{editingCategory ? 'Edit Category' : 'Create New Category'}</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] text-[#171D26]"
              placeholder="e.g., Electronics"
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting || !formData.name.trim()}
              className={`px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] flex items-center gap-2 ${isSubmitting || !formData.name.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting && <SmallLoader />}
              {isSubmitting ? (editingCategory ? 'Updating...' : 'Creating...') : (editingCategory ? 'Update' : 'Create')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
