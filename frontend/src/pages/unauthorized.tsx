export default function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-700">
      <h1 className="text-4xl font-bold mb-4">🚫 Unauthorized Access</h1>
      <p className="text-lg bg-red-200 px-6 py-3 rounded-lg shadow-md">
        You do not have permission to access this page.
      </p>
    </div>
  );
}
