"use client";

import React from "react";
import { Trash2 } from "lucide-react";
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
  if (!selectedSubCategory) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70 transition-opacity"
        onClick={() => setShowDeleteModal(null)}
      ></div>

      {/* Modal Content */}
      <div className="relative z-10 bg-white rounded-sm shadow-xl w-full max-w-md p-6 animate-fadeIn">
        <div className="flex items-start gap-4">
          {/* Icon on Left */}
          <div className="p-4 bg-red-100 rounded-full flex-shrink-0 flex items-center justify-center">
            <Trash2 className="h-8 w-8 text-red-600" />
          </div>

          {/* Right Side Content */}
          <div className="flex flex-col flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete Subcategory
            </h2>

            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-800">
                {selectedSubCategory.name}
              </span>
              ? <br />
              This action cannot be undone.
            </p>

            {/* Buttons */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 108 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" /> Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubCategoryModal;
