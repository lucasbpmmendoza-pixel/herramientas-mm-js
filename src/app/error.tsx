"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">500</h1>
        <p className="mt-4 text-lg text-gray-600">Ocurrio un error inesperado</p>
        <button
          onClick={reset}
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
