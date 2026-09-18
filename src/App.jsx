import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "error"

  const checkHealth = () => {
    setStatus("loading");
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status === "ok" ? "ok" : "error"))
      .catch(() => setStatus("error"));
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const statusConfig = {
    loading: {
      label: "Verificando conexión...",
      color: "var(--color-loading)",
      icon: "◐",
      pulse: true,
    },
    ok: {
      label: "Backend conectado",
      color: "var(--color-ok)",
      icon: "✓",
      pulse: false,
    },
    error: {
      label: "Backend no disponible",
      color: "var(--color-error)",
      icon: "✕",
      pulse: false,
    },
  };

  const current = statusConfig[status];

  return (
    <div className="page">
      <div className="shape shape-1" />
      <div className="shape shape-2" />
      <div className="shape shape-3" />

      <main className="card">
        <span className="badge">Proyecto Integrador I</span>
        <h1>Organizador de Eventos Independientes</h1>
        <p className="subtitle">
          Planifica, coordina y da seguimiento a tus eventos sin perder el control.
        </p>

        <div className={`status-panel status-${status}`}>
          <div className="status-icon-wrap">
            <span
              className={`status-dot ${current.pulse ? "pulse" : ""}`}
              style={{ backgroundColor: current.color }}
            />
            <span className="status-icon" style={{ color: current.color }}>
              {current.icon}
            </span>
          </div>
          <div className="status-text">
            <span className="status-label">{current.label}</span>
            <span className="status-detail">GET /api/health</span>
          </div>
        </div>

        <button className="retry-btn" onClick={checkHealth}>
          Verificar de nuevo
        </button>
      </main>
    </div>
  );
}

export default App;