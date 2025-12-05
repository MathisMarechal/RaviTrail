import DragAndDrop from "../components/DragAndDrop";
import EditGpx from "../components/EditGpx";
import EditTable from "../components/EditTable";
import CalculOfTrack from "../components/calculOfTrack";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMyContext } from "../context/Context";
import { autoSaveProject, forceSaveProject } from "../supabase-client";

function EditPage() {
    const {
        nameRun,
        setNameRun,
        xmlDoc,
        setXmlDoc,
        setName,
        setKilometre,
        ravitos,
        setRavitos,
        setSelectedIndex,
        setNameItems,
        setProtItems,
        setGluItems,
        setQuantityItems,
        distanceTotal,
        setDistanceTotal,
        setDistanceNextRavitos,
        setDenivelePositifNextRavitos,
        setDeniveleNegatifNextRavitos,
        denivelePositif,
        setDenivelePositif,
        deniveleNegatif,
        setDeniveleNegatif,
        setTempsEstime,
        setEditMode,
        setAllLat,
        setAllLon,
        setAllEl,
        setAllDistance,
        currentProject,
        setCurrentProject,
        savedProjects,
        setSavedProjects,
    } = useMyContext();

    const navigate = useNavigate();
    const location = useLocation();

    const [projectName, setProjectName] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
    const [needToBeSave, setNeedToBeSave] = useState<boolean>(false);

    // Charger le projet au montage
    useEffect(() => {
        if (currentProject) {
            setProjectName(currentProject.name);
            setNameRun(currentProject.nameRun);
            setDistanceTotal(currentProject.distanceTotal);
            setDenivelePositif(currentProject.denivelePositif);
            setDeniveleNegatif(currentProject.deniveleNegatif);
            setRavitos(currentProject.ravitos);
            setSelectedIndex(-1);
            setLastSaved(currentProject.updatedAt);

            if (currentProject.xmlDoc) {
                const parser = new DOMParser();
                const xml = parser.parseFromString(currentProject.xmlDoc, "application/xml");
                setXmlDoc(xml);
            }
        } else {
            resetProject();
        }
    }, [currentProject]);

    // Sauvegarde automatique quand les données changent
    useEffect(() => {
        // Ne pas sauvegarder si le nom du projet est vide
        if (!projectName.trim()) return;

        // Ne pas sauvegarder au premier chargement
        if (!currentProject && ravitos.length === 0) return;
        if (isAutoSaving) return;

        setNeedToBeSave(true);
        setIsAutoSaving(true);

        const xmlString = xmlDoc ? new XMLSerializer().serializeToString(xmlDoc) : "";

        const projectData = {
            name: projectName,
            name_run: nameRun,
            distance_total: distanceTotal,
            denivele_positif: denivelePositif,
            denivele_negatif: deniveleNegatif,
            xml_doc: xmlString
        };

        autoSaveProject(
            currentProject?.id || null,
            projectData,
            ravitos,
            (savedProject) => {
                // Mettre a  jour le projet courant
                setCurrentProject(savedProject);
                setLastSaved(new Date());
                setIsSaving(true);
                
                // Mettre a  jour la liste des projets
                if (currentProject) {
                    // Mise a  jour d'un projet existant
                    const updatedProjects = savedProjects.map(p =>
                        p.id === currentProject.id ? savedProject : p
                    );
                    setSavedProjects(updatedProjects);
                } else {
                    // Ajout d'un nouveau projet
                    setSavedProjects([...savedProjects, savedProject]);
                }
                
                setIsSaving(false);
                setIsAutoSaving(false);
                setNeedToBeSave(false);
            },
            300000 // Délai de 2 secondes
        );

    }, [projectName, ravitos, distanceTotal, denivelePositif, deniveleNegatif, nameRun]);


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
        setLastSaved(null);

        console.log("Rénitialisation complete du projet");
    };

    const handleBackToHome = () => {
        navigate("/");
    };

    const handleBackToProfil = () => {
        navigate("/MyProfil");
    };

    const formatLastSaved = () => {
        if (!lastSaved) return "";
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
        
        if (diff < 60) return "a l'instant";
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
        return new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(lastSaved);
    };

    const handleSaveProject = async () => {
        if (!projectName.trim()) return;
        setIsSaving(true)
        const xmlString = xmlDoc ? new XMLSerializer().serializeToString(xmlDoc) : "";


        const projectData = {
            name: projectName,
            name_run: nameRun,
            distance_total: distanceTotal,
            denivele_positif: denivelePositif,
            denivele_negatif: deniveleNegatif,
            xml_doc: xmlString
        };

        await forceSaveProject(
            currentProject?.id || null,
            projectData,
            ravitos,
            (savedProject) => {
                setCurrentProject(savedProject);
                setLastSaved(new Date());
                
                if (currentProject) {
                    const updatedProjects = savedProjects.map(p =>
                        p.id === currentProject.id ? savedProject : p
                    );
                    setSavedProjects(updatedProjects);
                } else {
                    setSavedProjects([...savedProjects, savedProject]);
                }
                
                setIsSaving(false);
                setNeedToBeSave(false);
            }
        )
    };

    return (
        <div>
            <div className="d-flex justify-content-evenly" style={{ paddingBottom: "30px", paddingTop: "30px", backgroundColor: "#0D6EFD" }}>
                <div style={{ cursor: "pointer", textDecoration: location.pathname === "/" ? "underline" : "none", color: "white", fontWeight: "bold" }} onClick={handleBackToHome}>Home</div>
                <div style={{ color: "white", fontWeight: "bold" }}>RaviTrail</div>
                <div style={{ cursor: "pointer", textDecoration: location.pathname === "/MyProfil" ? "underline" : "none", color: "white", fontWeight: "bold" }} onClick={handleBackToProfil}>Profil</div>
            </div>

            <div className="card p-3 m-2 border">
                <div className="row align-items-center">
                    <div className="col-md-8">
                        <label className="form-label">Nom du projet</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Entrez le nom de votre projet de ravitaillement" 
                            value={projectName} 
                            onChange={(e) => setProjectName(e.target.value)} 
                        />
                    </div>
                    <div className="col-md-4 text-end">
                        <div className="mt-4">
                            {isSaving ? (
                                <span className="text-muted">
                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                    Sauvegarde...
                                </span>
                            ) : lastSaved ? (
                                <span className="text-success">
                                    Sauvegardé {formatLastSaved()}
                                </span>
                            ) : (
                                <span className="text-muted">Pas encore sauvegardé</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <DragAndDrop />

            {xmlDoc && <CalculOfTrack />}

            {xmlDoc && <EditGpx />}

            <EditTable />

            <div style={{display:"flex",alignItems:"center", justifyContent:"center"}}>
                <button className={`btn ${!needToBeSave ? 'btn-success' : 'btn-primary'} mt-4 mb-4`} onClick={()=>handleSaveProject()} disabled={!projectName.trim()}>{!needToBeSave?'✓ Sauvegardé' : 'Sauvegarder'}</button>
                <button className="btn btn-info mt-4 ms-4 mb-4 text-white" onClick={()=>navigate("/RecapPage")}>Racap</button>
            </div>
        </div>
    );
}

export default EditPage;