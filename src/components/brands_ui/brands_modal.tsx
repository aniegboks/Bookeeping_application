import { Brand, CreateBrandData } from "@/lib/brands";
import SmallLoader from "../ui/small_loader";

interface BrandModalProps {
  editingBrand: Brand | null;
  formData: CreateBrandData;
  setFormData: (data: CreateBrandData) => void;
  handleSubmit: () => void;
  setShowModal: (show: boolean) => void;
  isSubmitting: boolean;
  resetForm: () => void;
}

export default function BrandModal({
  editingBrand,
  formData,
  setFormData,
  handleSubmit,
  setShowModal,
  isSubmitting,
  resetForm,
}: BrandModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-semibold text-[#171D26] mb-4">
          {editingBrand ? "Edit Brand" : "Create New Brand"}
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3D4C63] focus:border-transparent text-[#171D26]"
              placeholder="e.g., Apple, Samsung"
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/100 characters
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowModal(false);
                resetForm();
              }}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name.trim()}
              className={`px-4 py-2 bg-[#3D4C63] text-white rounded-lg hover:bg-[#495C79] transition-colors flex items-center gap-2 ${
                isSubmitting || !formData.name.trim() ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting && <SmallLoader />}
              {isSubmitting
                ? editingBrand
                  ? "Updating..."
                  : "Creating..."
                : editingBrand
                ? "Update"
                : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
