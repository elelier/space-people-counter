"use client";

export default function KofiTestPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-8">Ko-fi Button Test</h1>
      <a
        href="https://ko-fi.com/spacepeoplecounter"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 bg-[#2F2C7D] text-white py-3 px-6 rounded-md transition-all duration-300 hover:bg-[#413B9F] hover:-translate-y-1 hover:shadow-lg"
      >
        <div className="relative w-5 h-5">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
        </div>
        <span className="font-medium">Combustible para la Misión</span>
      </a>
    </div>
  );
}
