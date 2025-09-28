"use client";

import React from "react";
import { SubCategory } from "@/lib/types/sub_categories";

interface DeleteSubCategoryModalProps {
  selectedSubCategory: SubCategory | null;
  setShowDeleteModal: (id: string | null) => void;
  deleting: boolean;
  confirmDelete: () => Promise<void>;
}

const DeleteSubCategoryModal = ({
  selectedSubCategory,
  setShowDeleteModal,
  deleting,
  confirmDelete,
}: DeleteSubCategoryModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/70">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
        <h2 className="text-lg font-semibold text-gray-800">Confirm Deletion</h2>
        <p className="text-sm text-gray-600 mt-2">
          Are you sure you want to delete{" "}
          <span className="font-bold">{selectedSubCategory?.name}</span>? This action
          cannot be undone.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowDeleteModal(null)}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 disabled:opacity-50"
          >
            {deleting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubCategoryModal;
