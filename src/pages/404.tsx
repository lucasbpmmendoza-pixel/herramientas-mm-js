import Link from "next/link";

export default function Custom404() {
  return (
    <main style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#f9fafb" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "4rem", fontWeight: "bold", color: "#111827" }}>404</h1>
        <p style={{ marginTop: "1rem", color: "#6b7280" }}>Página no encontrada</p>
        <Link href="/auth/login" style={{ display: "inline-block", marginTop: "1.5rem", padding: "0.5rem 1.5rem", background: "#4f46e5", color: "#fff", borderRadius: "0.5rem", textDecoration: "none" }}>
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
