import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [status, setStatus] = useState("cargando...");

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("error de conexión"));
  }, []);

  return (
    <div>
      <h1>Organizador de Eventos Independientes</h1>
      <p>Estado del backend: {status}</p>
    </div>
  );
}

export default App;