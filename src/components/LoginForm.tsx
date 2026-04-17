"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const router = useRouter();
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiRequest<{ token: string; user: any }>("POST", "/auth/login", {
        nip,
        password,
      });

      if (response.success && response.data) {
        localStorage.setItem("auth_token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        onSuccess?.();
        router.push("/dashboard");
      } else {
        setError(response.error || "Error al iniciar sesión");
      }
    } catch (err: any) {
      setError(err.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="nip" className="block text-sm font-medium text-gray-700">
          NIP
        </label>
        <input
          id="nip"
          type="text"
          value={nip}
          onChange={(e) => setNip(e.target.value)}
          placeholder="Ingresa tu NIP"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Ingresa tu contraseña"
          required
          className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
      </button>

      <p className="text-center text-sm text-gray-600">
        <Link
          href="/"
          className="font-medium text-indigo-600 hover:text-indigo-700"
        >
          Volver al inicio
        </Link>
      </p>
    </form>
  );
}
