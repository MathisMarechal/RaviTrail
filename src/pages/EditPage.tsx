import DragAndDrop from "../components/DragAndDrop";
import EditGpx from "../components/EditGpx";
import EditTable from "../components/EditTable";
import CalculOfTrack from "../components/calculOfTrack";
import Header from "../components/Header";
import ExportPDF from "../components/ExportPDF";
import ShareProject from "../components/ShareProject";
import AdvancedAnalytics from "../components/AdvancedAnalytics";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useMyContext } from "../context/Context";
import { autoSaveProject, forceSaveProject } from "../supabase-client";
import { PLAN_LIMITS } from "../types";

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
        userPlan,
        session
    } = useMyContext();

    const navigate = useNavigate();

    const [projectName, setProjectName] = useState<string>("");
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
    const [needToBeSave, setNeedToBeSave] = useState<boolean>(false);

    const isPremium = userPlan === 'premium';
    const features = PLAN_LIMITS[userPlan].features;

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

    useEffect(() => {
        if (!projectName.trim()) return;
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
                setCurrentProject(savedProject);
                setLastSaved(new Date());
                setIsSaving(true);
                
                if (currentProject) {
                    const updatedProjects = savedProjects.map(p =>
                        p.id === currentProject.id ? savedProject : p
                    );
                    setSavedProjects(updatedProjects);
                } else {
                    setSavedProjects([...savedProjects, savedProject]);
                }
                
                setIsSaving(false);
                setIsAutoSaving(false);
                setNeedToBeSave(false);
            },
            300000
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
    };

    const formatLastSaved = () => {
        if (!lastSaved) return "";
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
        
        if (diff < 60) return "à l'instant";
        if (diff < 3600) return `il y a ${Math.floor(diff / 60)} min`;
        return new Intl.DateTimeFormat('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        }).format(lastSaved);
    };

    const handleSaveProject = async () => {
        if (!projectName.trim()) return;
        setIsSaving(true);
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
        );
    };

    const currentProjectForExport = currentProject ? {
        ...currentProject,
        ravitos,
        distanceTotal,
        denivelePositif,
        deniveleNegatif
    } : null;

    return (
        <div>
            <Header isAuthenticated={true} />

            <div className="card p-3 m-2 border">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <label className="form-label">Nom du projet</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Entrez le nom de votre projet" 
                            value={projectName} 
                            onChange={(e) => setProjectName(e.target.value)} 
                        />
                    </div>
                    <div className="col-md-6 text-end">
                        <div className="mt-4">
                            {isSaving ? (
                                <span className="text-muted">
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    Sauvegarde...
                                </span>
                            ) : lastSaved ? (
                                <span className="text-success">
                                    ✓ Sauvegardé {formatLastSaved()}
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

            <div style={{display:"flex", alignItems:"center", justifyContent:"center", gap: "10px", flexWrap: "wrap", padding: "20px"}}>
                <button 
                    className={`btn ${!needToBeSave ? 'btn-success' : 'btn-primary'}`}
                    onClick={handleSaveProject}
                    disabled={!projectName.trim()}
                >
                    {!needToBeSave ? '✓ Sauvegardé' : '💾 Sauvegarder'}
                </button>

                <button 
                    className="btn btn-info text-white"
                    onClick={() => navigate("/RecapPage")}
                >
                    📋 Récap
                </button>

                {/* Boutons Premium */}
                {currentProjectForExport && (
                    <>
                        {features.pdfExport ? (
                            <ExportPDF project={currentProjectForExport} />
                        ) : (
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    alert("🔒 Export PDF disponible en Premium");
                                    navigate("/MyProfil");
                                }}
                            >
                                🔒 Export PDF
                            </button>
                        )}

                        {features.projectSharing ? (
                            <ShareProject 
                                project={currentProjectForExport} 
                                ownerEmail={session?.user?.email || ""}
                            />
                        ) : (
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    alert("🔒 Partage de projets disponible en Premium");
                                    navigate("/MyProfil");
                                }}
                            >
                                🔒 Partager
                            </button>
                        )}

                        {features.advancedAnalytics ? (
                            <AdvancedAnalytics project={currentProjectForExport} />
                        ) : (
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    alert("🔒 Analyses avancées disponibles en Premium");
                                    navigate("/MyProfil");
                                }}
                            >
                                🔒 Analyses
                            </button>
                        )}
                    </>
                )}

                {!isPremium && (
                    <button
                        className="btn btn-warning"
                        onClick={() => navigate("/MyProfil")}
                    >
                        ⭐ Passer à Premium
                    </button>
                )}
            </div>
        </div>
    );
}

export default EditPage;