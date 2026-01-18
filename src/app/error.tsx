'use client';

export const dynamic = 'force-dynamic';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-3xl font-bold mb-4 text-red-600">Algo salió mal</h2>
      <p className="text-gray-600 mb-8">{error.message || 'Ha ocurrido un error inesperado.'}</p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Intentar de nuevo
      </button>
    </div>
  );
}
