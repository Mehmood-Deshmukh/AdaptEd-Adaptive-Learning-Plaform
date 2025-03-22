import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { PrimeReactProvider } from "primereact/api";
import { AuthProvider } from "./context/authContext.jsx";
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
    </AuthProvider>
  </StrictMode>
);
