import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import "@/App.css";

import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";

import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Pipeline from "@/pages/Pipeline";
import GrantDetail from "@/pages/GrantDetail";
import Persona from "@/pages/Persona";
import Vault from "@/pages/Vault";
import Pricing from "@/pages/Pricing";
import Success from "@/pages/Success";

function Guarded({ children }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            theme="dark"
            toastOptions={{
              style: { background: "#0a0a0a", border: "1px solid #262626", color: "#fff", borderRadius: "2px", fontFamily: "IBM Plex Mono, monospace", fontSize: "12px" },
            }}
          />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Guarded><Dashboard /></Guarded>} />
            <Route path="/pipeline" element={<Guarded><Pipeline /></Guarded>} />
            <Route path="/grants/:id" element={<Guarded><GrantDetail /></Guarded>} />
            <Route path="/persona" element={<Guarded><Persona /></Guarded>} />
            <Route path="/vault" element={<Guarded><Vault /></Guarded>} />
            <Route path="/pricing" element={<Guarded><Pricing /></Guarded>} />
            <Route path="/success" element={<Guarded><Success /></Guarded>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
