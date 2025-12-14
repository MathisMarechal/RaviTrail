import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import EditPage from "./pages/EditPage";
import MyProfil from "./pages/MyProfil";
import Items from "./pages/Items";
import RecapPage from "./pages/RecapPage";
import LoginPage from "./pages/LoginPage";
import { ContextProvider, useMyContext } from "./context/Context";
import { useEffect } from "react";
import { supabase } from "./supabase-client";
import { useNavigate } from "react-router-dom";

function AppRoutes() {
  const { session, setSession } = useMyContext();
  const navigate = useNavigate();

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data.session);
  };

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        // Rediriger vers HomePage quand connecté
        navigate("/home");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Routes>
      {session ? (
        // Routes pour utilisateurs connectés
        <>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/EditPage" element={<EditPage />} />
          <Route path="/MyProfil" element={<MyProfil />} />
          <Route path="/Items" element={<Items />} />
          <Route path="/RecapPage" element={<RecapPage />} />
          <Route path="/LoginPage" element={<Navigate to="/home" replace />} />
          <Route path="*" element={<Navigate to="/home" replace />} />
        </>
      ) : (
        // Routes pour utilisateurs non connectés
        <>
          <Route path="/" element={<LandingPage />} />
          <Route path="/LoginPage" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      )}
    </Routes>
  );
}

function App() {
  return (
    <ContextProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ContextProvider>
  );
}

export default App;