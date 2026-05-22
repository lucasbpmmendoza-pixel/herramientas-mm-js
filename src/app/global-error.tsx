"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900">500</h1>
            <p className="mt-4 text-lg text-gray-600">Ocurrió un error inesperado</p>
            <div className="mt-6 flex gap-4 justify-center">
              <button onClick={reset} className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                Reintentar
              </button>
              <Link href="/auth/login" className="rounded-lg bg-gray-200 px-6 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
                Volver al inicio
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
