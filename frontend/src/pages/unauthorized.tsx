export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-700">
      <h1 className="text-4xl font-bold mb-4 animate-bounce">
        🚫 Unauthorized Access
      </h1>
      <p className="text-lg bg-red-200 px-6 py-3 rounded-lg shadow-md animate-fade">
        You do not have permission to access this page.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 transition-all duration-300"
      >
        Go Back
      </button>
    </div>
  );
}
