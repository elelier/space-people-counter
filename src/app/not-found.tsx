import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-b from-slate-900 to-slate-950">
      <h2 className="text-4xl font-bold mb-4 text-white">404</h2>
      <p className="text-xl text-gray-300 mb-8">La página que buscas no existe.</p>
      <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Volver al inicio
      </Link>
    </div>
  );
}

