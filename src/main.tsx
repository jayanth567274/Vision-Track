import { createRoot } from "react-dom/client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import "./index.css";
import App from "./App";
import SettingsRoute from "./routes/settings";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

createRoot(document.getElementById("root")!).render(
  <ConvexAuthProvider client={convex}>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/settings" element={<SettingsRoute />} />
      </Routes>
    </Router>
  </ConvexAuthProvider>,
);
