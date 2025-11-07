import { BrowserRouter as Router,Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EditPage from "./pages/EditPage";
import MyProfil from "./pages/MyProfil";
import Items from "./pages/Items";
import RecapPage from "./pages/RecapPage";
import LoginPage from "./pages/LoginPage";
import { ContextProvider, useMyContext } from "./context/Context";
import { useEffect } from "react";
import { supabase } from "./supabase-client";
import { useLocation, useNavigate } from "react-router-dom";

function AppRoutes () {

  const {session,setSession} = useMyContext();
  const navigate = useNavigate();
  const location = useLocation();

  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data.session);
  }

  useEffect(()=>{
    fetchSession()

    const {data: authListener} = supabase.auth.onAuthStateChange((_event,session)=> {
      setSession(session);
      if (session) {
        navigate("/");
      } else {
        navigate("/LoginPage");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    }

  },[]);

  return(
    <Routes>
    {session ? (
      <>
      <Route path="/" element={<HomePage/>}></Route>
      <Route path="/LoginPage" element={<LoginPage/>}></Route>
      <Route path="/EditPage" element={<EditPage/>}></Route>
      <Route path="/MyProfil" element={<MyProfil />}></Route>
      <Route path="/Items" element={<Items/>}></Route>
      <Route path="/RecapPage" element={<RecapPage />}></Route>
      </>
    )
    :
    (
      <>  
      <Route path="/" element={<LoginPage/>}></Route>
      <Route path="/LoginPage" element={<LoginPage/>}></Route>
      </>
    )
        
    }
      </Routes>
  )
}

function App() {
  return (<ContextProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ContextProvider>
  )
};

export default App;