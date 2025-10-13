import { BrowserRouter as Router,Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import EditPage from "./pages/EditPage";
import MyProfil from "./pages/MyProfil";
import Items from "./pages/Items";
import RecapPage from "./pages/RecapPage";
import type { Ravitaillment,Profil,SavedProject,ListItems } from "./types";


function App () {

  // États pour le profil utilisateur
  const [consGluH, setConGluH] = useState<number | "">("");
  const [consProtH, setConProtH] = useState<number | "">("");
  const [profilName, setProfilName] = useState<string>("");
  const [myProfil, setMyProfil] = useState<Profil | null>(null);

  // États pour le projet en cours d'édition
  const [nameRun, setNameRun] = useState<string | null>(null);
  const [xmlDoc, setXmlDoc] = useState<Document | null>(null);
  const [name, setName] = useState<string>("");
  const [kilometre, setKilometre] = useState<number | "">("");
  const [ravitos, setRavitos] = useState<Ravitaillment[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // États pour les items
  const [nameItems, setNameItems] = useState<string>("");
  const [protItems, setProtItems] = useState<number | "">("");
  const [gluItems, setGluItems] = useState<number | "">("");
  const [quantityItems, setQuantityItems] = useState<number | "">("");
  const [nameNewItems,setNameNewItems] = useState<string>("")
  const [proNewItems, setProNewItems] = useState<number | "">("");
  const [gluNewItems, setGluNewItems] = useState<number | "">("");
  const [listNewItems, setListNewItems] = useState<ListItems[]>([]);

  // États pour les calculs GPX
  const [, setAllLat] = useState<number[]>([]);
  const [, setAllLon] = useState<number[]>([]);
  const [allEl, setAllEl] = useState<number[]>([]);
  const [allDistance, setAllDistance] = useState<number[]>([]);
  const [distanceTotal, setDistanceTotal] = useState<number>(0);
  const [denivelePositif, setDenivelePositif] = useState<number>(0);
  const [deniveleNegatif, setDeniveleNegatif] = useState<number>(0);

  // États pour les calculs entre ravitaillements
  const [distanceNextRavitos, setDistanceNextRavitos] = useState<number>(0);
  const [denivelePositifNextRavitos, setDenivelePositifNextRavitos] = useState<number>(0);
  const [deniveleNegatifNextRavitos, setDeniveleNegatifNextRavitos] = useState<number>(0);

  // États pour l'estimation de temps
  const [tempsEstime, setTempsEstime] = useState<number | "">("");
  const [editMode, setEditMode] = useState<boolean>(false);

  // États pour la gestion des projets sauvegardés
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);

  // États pour la gestion d'affichage

  const [isMobile,setIsMobile] = useState(window.innerWidth <=500);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);



  return(
    <Router>
      <Routes>
        <Route path="/" element={<HomePage setCurrentProject={setCurrentProject} savedProjects={savedProjects} setSavedProjects={setSavedProjects}/>}></Route>
        <Route path="/EditPage" element={<EditPage nameRun={nameRun}
        setNameRun={setNameRun}
        xmlDoc={xmlDoc} 
        setXmlDoc = {setXmlDoc}
        name={name} 
        setName={setName} 
        kilometre={kilometre} 
        setKilometre={setKilometre} 
        ravitos={ravitos} 
        setRavitos={setRavitos} 
        selectedIndex={selectedIndex} 
        setSelectedIndex={setSelectedIndex} 
        nameItems={nameItems}
        setNameItems={setNameItems}
        protItems={protItems}
        setProtItems={setProtItems}
        gluItems={gluItems}
        setGluItems={setGluItems}
        quantityItems={quantityItems}
        setQuantityItems = {setQuantityItems}
        allDistance = {allDistance} 
        allEl = {allEl}
        distanceNextRavitos ={distanceNextRavitos}
        setDistanceNextRavitos = {setDistanceNextRavitos}
        denivelePositifNextRavitos = {denivelePositifNextRavitos}
        setDenivelePositifNextRavitos = {setDenivelePositifNextRavitos}
        deniveleNegatifNextRavitos = {deniveleNegatifNextRavitos}
        setDeniveleNegatifNextRavitos = {setDeniveleNegatifNextRavitos}
        tempsEstime={tempsEstime}
        setTempsEstime={setTempsEstime}
        editMode={editMode}
        setEditMode={setEditMode}  
        setAllLat = {setAllLat} 
        setAllLon = {setAllLon}
        setAllEl={setAllEl}
        setAllDistance = {setAllDistance}
        distanceTotal = {distanceTotal}
        setDistanceTotal ={setDistanceTotal}
        denivelePositif = {denivelePositif}
        setDenivelePositif = {setDenivelePositif}
        deniveleNegatif = {deniveleNegatif}
        setDeniveleNegatif = {setDeniveleNegatif}
        myProfil={myProfil}
        currentProject={currentProject}
        setCurrentProject={setCurrentProject}
        savedProjects={savedProjects}
        setSavedProjects={setSavedProjects}
        isMobile = {isMobile}
        listNewItems={listNewItems}/>}></Route>

        <Route path="/MyProfil" element={<MyProfil consGluH={consGluH}
        setConGluH={setConGluH}
        consProtH={consProtH}
        setConProtH={setConProtH}
        profilName={profilName}
        setProfilName={setProfilName}
        myProfil={myProfil}
        setMyProfil={setMyProfil}/>}></Route>

        <Route path="/Items" element={<Items nameNewItems={nameNewItems} 
        setNameNewItems={setNameNewItems}
        proNewItems={proNewItems}
        setProNewItems={setProNewItems}
        gluNewItems={gluNewItems}
        setGluNewItems={setGluNewItems}
        listNewItems={listNewItems}
        setListNewItems={setListNewItems} />}></Route>

        <Route path="/RecapPage" element={<RecapPage ravitos={ravitos}/>}></Route>
      </Routes>
    </Router>
  )
}

export default App;