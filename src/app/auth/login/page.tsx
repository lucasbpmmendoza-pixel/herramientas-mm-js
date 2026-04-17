import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Herramientas MM</h1>
          <p className="mt-2 text-gray-600">Iniciar Sesión</p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
