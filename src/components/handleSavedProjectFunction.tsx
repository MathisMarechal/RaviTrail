import { useMyContext } from "../context/Context";
import type {SavedProject} from "../types";

export const handleSaveProjectFunction = (projectName:string,isProjectSaved:boolean, setIsProjectSaved:React.Dispatch<boolean>, setIsUpdated:React.Dispatch<boolean>) => {

    const {xmlDoc,currentProject,nameRun,distanceTotal,denivelePositif, deniveleNegatif, ravitos, savedProjects, setSavedProjects, setCurrentProject} = useMyContext();

  return () => {
    
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
  }
};
