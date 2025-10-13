import DragAndDrop from "../components/DragAndDrop";
import EditGpx from "../components/EditGpx";
import type {Ravitaillment, SavedProject, Profil,ListItems} from "../types";
import EditTable from "../components/EditTable";
import CalculOfTrack from "../components/calculOfTrack";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface EditPageProps {

  nameRun: string | null;
  setNameRun: React.Dispatch<React.SetStateAction<string | null>>;

  xmlDoc: Document | null;
  setXmlDoc: (xml: Document | null) => void

  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;

  kilometre: number | "";
  setKilometre: React.Dispatch<React.SetStateAction<number | "" >>;

  ravitos: Ravitaillment[];
  setRavitos: React.Dispatch<React.SetStateAction<Ravitaillment[]>>;

  selectedIndex: number;
  setSelectedIndex: React.Dispatch<React.SetStateAction<number>>;

  nameItems: string;
  setNameItems: React.Dispatch<React.SetStateAction<string>>;

  protItems: number | "";
  setProtItems: React.Dispatch<React.SetStateAction<number | "" >>;

  gluItems: number | "";
  setGluItems: React.Dispatch<React.SetStateAction<number | "" >>;

  quantityItems: number | "";
  setQuantityItems: React.Dispatch<React.SetStateAction<number | "" >>;

  allDistance: number[];
  allEl: number[];

  distanceTotal: number;
  setDistanceTotal: React.Dispatch<React.SetStateAction<number>>;

  distanceNextRavitos: number;
  setDistanceNextRavitos: React.Dispatch<React.SetStateAction<number>>;

  denivelePositifNextRavitos: number;
  setDenivelePositifNextRavitos: React.Dispatch<React.SetStateAction<number>>;

  deniveleNegatifNextRavitos: number;
  setDeniveleNegatifNextRavitos: React.Dispatch<React.SetStateAction<number>>;

  denivelePositif: number;
  setDenivelePositif: React.Dispatch<React.SetStateAction<number>>;

  deniveleNegatif: number;
  setDeniveleNegatif: React.Dispatch<React.SetStateAction<number>>;

  tempsEstime: number | "";
  setTempsEstime: React.Dispatch<React.SetStateAction<number | "" >>;

  editMode: boolean;
  setEditMode: React.Dispatch<React.SetStateAction<boolean>>;

  setAllLat: React.Dispatch<React.SetStateAction<number[]>>;
  setAllLon: React.Dispatch<React.SetStateAction<number[]>>;
  setAllEl: React.Dispatch<React.SetStateAction<number[]>>;
  setAllDistance: React.Dispatch<React.SetStateAction<number[]>>;

  myProfil: Profil | null;

  currentProject: SavedProject | null;
  setCurrentProject: React.Dispatch<React.SetStateAction<SavedProject | null>>;
  savedProjects: SavedProject[];
  setSavedProjects: React.Dispatch<React.SetStateAction<SavedProject[]>>;

  isMobile: boolean;

  listNewItems: ListItems[];
}

function EditPage ({nameRun,
  setNameRun,
  xmlDoc,
  setXmlDoc,
  name,
  setName,
  kilometre,
  setKilometre,
  ravitos,
  setRavitos,
  selectedIndex,
  setSelectedIndex,
  nameItems,
  setNameItems,
  protItems,
  setProtItems,
  gluItems,
  setGluItems,
  quantityItems,
  setQuantityItems,
  allDistance,
  allEl,
  distanceTotal,
  setDistanceTotal,
  distanceNextRavitos,
  setDistanceNextRavitos,
  denivelePositifNextRavitos,
  setDenivelePositifNextRavitos,
  deniveleNegatifNextRavitos,
  setDeniveleNegatifNextRavitos,
  denivelePositif,
  setDenivelePositif,
  deniveleNegatif,
  setDeniveleNegatif,
  tempsEstime,
  setTempsEstime,
  editMode,
  setEditMode,
  setAllLat,
  setAllLon,
  setAllEl,
  setAllDistance,
  myProfil,
  currentProject, 
  setCurrentProject, 
  savedProjects, 
  setSavedProjects,
  isMobile,
  listNewItems,
}: EditPageProps) {

  const navigate = useNavigate();
  const location = useLocation();

  const [projectName,setProjectName] = useState<string>("");
  const [isProjectSaved, setIsProjectSaved] = useState<boolean>(false);
  const [isUpdated, setIsUpdated] = useState<boolean>(false)

  useEffect(()=>{ 
    setIsUpdated(false);
  },[ravitos,projectName, distanceTotal, denivelePositif, deniveleNegatif])

  useEffect(()=>{
    if (currentProject) {
      setProjectName(currentProject.name);
      setNameRun(currentProject.nameRun);
      setDistanceTotal(currentProject.distanceTotal);
      setDenivelePositif(currentProject.denivelePositif);
      setDeniveleNegatif(currentProject.deniveleNegatif);
      setRavitos(currentProject.ravitos);
      setSelectedIndex(-1);
      setIsProjectSaved(true);
      setIsUpdated(true);

      if (currentProject.xmlDoc) {
        const parser = new DOMParser();
        const xml = parser.parseFromString(currentProject.xmlDoc,"application/xml");
        setXmlDoc(xml);
      }
    } else {
      resetProject();
    }
  },[currentProject]);


  const resetProject = () => {
    setProjectName("");
    setNameRun(null);
    setXmlDoc(null);
    setName("");
    setKilometre("");
    setRavitos([]);
    setSelectedIndex(-1);
    setNameItems("");
    setProtItems("");
    setGluItems("");
    setQuantityItems("");
    setDistanceTotal(0);
    setDistanceNextRavitos(0);
    setDenivelePositifNextRavitos(0);
    setDeniveleNegatifNextRavitos(0);
    setDenivelePositif(0);
    setDeniveleNegatif(0);
    setTempsEstime("");
    setEditMode(false);
    setAllLat([]);
    setAllLon([]);
    setAllEl([]);
    setAllDistance([]);
    setIsProjectSaved(false);

    console.log("Réinitialisation complète du projet");
  };

  const handleSaveProject = () => {
    if (!projectName.trim()) {
      alert("Veuillez donner un nom à votre projet");
      return;
    }

    const xmlString = xmlDoc ? new XMLSerializer().serializeToString(xmlDoc) : "";
    const now = new Date();

    let savedProject: SavedProject;

    if (currentProject && isProjectSaved) {
      savedProject = {
        ...currentProject,
        name: projectName,
        nameRun,
        distanceTotal,
        denivelePositif,
        deniveleNegatif,
        ravitos,
        xmlDoc: xmlString,
        updatedAt: now
      };

      const updatedProjects = savedProjects.map(p=>p.id===currentProject.id ? savedProject : p);
      setSavedProjects(updatedProjects);
      localStorage.setItem("ravitrail_projects", JSON.stringify(updatedProjects));
    } else {
      savedProject = {
        id: Date.now(),
        name: projectName,
        nameRun,
        distanceTotal,
        denivelePositif,
        deniveleNegatif,
        ravitos,
        xmlDoc: xmlString,
        createdAt: now,
        updatedAt: now
      };

      const updatedProjects = [...savedProjects, savedProject];
      setSavedProjects(updatedProjects);
      localStorage.setItem("ravitrail_projects",JSON.stringify(updatedProjects));
      setCurrentProject(savedProject);
    }

    setIsProjectSaved(true);
    alert("Projet sauvegardé avec succès !");
    setIsUpdated(true);
  };



  const handleBackToHome = () => {
    if (!isUpdated && (xmlDoc || ravitos.length > 0)) {
      if (window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous quitter sans sauvegarder ?")) {
        navigate('/');
      }
    } else {
      navigate('/');
    }
  };

  const handleBackToProfil = () => {
    if (!isUpdated) {
      if (window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous quitter sans sauvegarder ?")) {
        navigate("/MyProfil");
      }
    } else {
      navigate("/MyProfil")
    }
  };

  return <div>

    <div className="d-flex justify-content-evenly" style={{paddingBottom:"30px",paddingTop:"30px", backgroundColor:"#0D6EFD"}}>
      <div style={{ cursor: "pointer", textDecoration: location.pathname=== "/" ? "underline" : "none" , color:"white ",fontWeight:"bold"}} onClick={handleBackToHome}>Home</div>
      <div style={{color:"white ",fontWeight:"bold"}}>RaviTrail</div>
      <div style={{cursor:"pointer",textDecoration: location.pathname=== "/MyProfil" ? "underline" : "none" ,color:"white ",fontWeight:"bold"}} onClick={handleBackToProfil}>Profil</div>
    </div>

    <div className="card p-3 m-2 border">
      <div className="row align-items-center">
        <div className="col-md-8">
          <label className="form-label">Nom du projet</label>
          <input type="text" className="form-control" placeholder="Entrez le nom de votre projet de ravitaillement" value={projectName} onChange={(e)=>setProjectName(e.target.value)}/>
        </div>
        <div className="col-md-4 text-end">
          <button className={`btn ${isUpdated ? 'btn-success' : 'btn-primary'} mt-4`} onClick={handleSaveProject} disabled={!projectName.trim()}>{isUpdated?'✓ Sauvegardé' : 'Sauvegarder'}</button>
        </div>
      </div>
    </div>

    <DragAndDrop xmlDoc={xmlDoc} 
    setXmlDoc={setXmlDoc}
    nameRun={nameRun}
    setNameRun={setNameRun}/> 

    {xmlDoc && <CalculOfTrack 
    xmlDoc={xmlDoc} 
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
    isMobile = {isMobile}
    />}

    {xmlDoc && 
    <EditGpx xmlDoc={xmlDoc} 
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
    distanceTotal = {distanceTotal}
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
    isMobile = {isMobile}
    listNewItems={listNewItems}
    />}


    {<EditTable ravitos={ravitos} selectedIndex={selectedIndex} setRavitos={setRavitos} myProfil={myProfil}/>}

    <div style={{display:"flex",alignItems:"center", justifyContent:"center"}}>
      <button className={`btn ${isUpdated ? 'btn-success' : 'btn-primary'} mt-4 mb-4`} onClick={handleSaveProject} disabled={!projectName.trim()}>{isUpdated?'✓ Sauvegardé' : 'Sauvegarder'}</button>
      <button className="btn btn-info mt-4 ms-4 mb-4 text-white" onClick={()=>navigate("/RecapPage")}>Racap</button>
    </div>

    
  </div>
  
}

export default EditPage;