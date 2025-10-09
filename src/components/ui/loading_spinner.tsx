export default function LoadingSpinner() {
    return (
      <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center sticky  z-100 w-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#3D4C63]"></div>
      </div>
    );
  }
  