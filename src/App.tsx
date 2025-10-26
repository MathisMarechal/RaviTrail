import { BrowserRouter as Router,Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import EditPage from "./pages/EditPage";
import MyProfil from "./pages/MyProfil";
import Items from "./pages/Items";
import RecapPage from "./pages/RecapPage";
import { ContextProvider } from "./context/Context";


function App () {

  return(
    <ContextProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage/>}></Route>
          <Route path="/EditPage" element={<EditPage/>}></Route>
          <Route path="/MyProfil" element={<MyProfil />}></Route>
          <Route path="/Items" element={<Items/>}></Route>
          <Route path="/RecapPage" element={<RecapPage />}></Route>
        </Routes>
      </Router>
    </ContextProvider>
  )
}

export default App;