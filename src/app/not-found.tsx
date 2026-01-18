import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-3xl font-bold mb-4">404 - Página no encontrada</h2>
      <p className="text-gray-600 mb-8">La página que buscas no existe.</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
        Volver al inicio
      </Link>
    </div>
  );
}
