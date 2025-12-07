import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { fetchProjects, deleteProject } from "../supabase-client";

function HomePage() {
    const { savedProjects, setSavedProjects, setCurrentProject } = useMyContext();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadProjects = async () => {
            try {
                setIsLoading(true);
                const projects = await fetchProjects();
                setSavedProjects(projects);
            } catch (error) {
                console.error('Erreur lors du chargement des projets:', error);
                alert('Erreur lors du chargement des projets');
            } finally {
                setIsLoading(false);
            }
        };

        loadProjects();
    }, [setSavedProjects]);

    const handleCreateNewProject = () => {
        if (savedProjects.length >= 3) {
            alert("Vous n'avez le droit qu'à 3 projets ravitaillement maximum");
            return;
        }
        setCurrentProject(null);
        navigate("/EditPage");
    };

    const handleOpenProject = (project: any) => {
        setCurrentProject(project);
        navigate("/EditPage");
    };

    const handleDeleteProject = async (projectId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const project = savedProjects.find(p => p.id === projectId);
        
        if (project && window.confirm(`Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?`)) {
            try {
                await deleteProject(projectId);
                
                // Mettre à jour l'état local
                const updatedProjects = savedProjects.filter(p => p.id !== projectId);
                setSavedProjects(updatedProjects);
                
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression du projet');
            }
        }
    };

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    return (
        <>
            <div className="containerHomePage">
                <video autoPlay loop muted playsInline className="background-clip">
                    <source src="/TrailBG1.mp4" type="video/mp4" />
                </video>
                <header style={{ display: "flex", flexDirection: "column", justifyContent: "normal", width: "100%" }}>
                    <div className="d-flex justify-content-evenly" style={{ paddingBottom: "30px", paddingTop: "30px", backgroundColor: "#0D6EFD" }}>
                        <div style={{ cursor: "pointer", textDecoration: location.pathname === "/" ? "underline" : "none", color: "white", fontWeight: "bold", textUnderlineOffset: "8px" }} onClick={() => navigate("/")}>Home</div>
                        <div style={{ color: "white", fontWeight: "bold" }}>RaviTrail</div>
                        <div style={{ cursor: "pointer", textDecoration: location.pathname === "/MyProfil" ? "underline" : "none", color: "white", fontWeight: "bold", textUnderlineOffset: "8px" }} onClick={() => navigate("/MyProfil")}>Profil</div>
                    </div>
                </header>
                <div className="overlay">
                    <p style={{ textAlign: "center", fontWeight: "bold", fontSize: "1.5rem" }}>Planifie tes ravitaillements. <br /> Garde l'énergie pour franchir la ligne d'arrivée. </p>
                    <ul style={{ textAlign: "left", maxWidth: "600px" }}>
                        <li>📍 Importe ta trace GPX et visualise tout ton parcours.</li>
                        <li>🍎 Ajoute facilement tes points de ravitaillement sur la carte.</li>
                        <li>🍫 Crée tes propres items alimentaires avec leurs valeurs énergétiques (calories, glucides, etc.).</li>
                        <li>⚖️ Ajuste les quantités selon tes besoins et la durée de l'effort.</li>
                        <li>💰 Gère ton budget pour garder le contrôle sur les coûts.</li>
                    </ul>
                </div>
                <h1 style={{ color: "#0D6EFD", textAlign: "center", marginBottom: "70px", marginTop: "50px" }}>Commencer maintenant</h1>
                <div className="d-flex justify-content-center btn-container" style={{ width: "100%" }}>
                    <div>
                        <button 
                            type="button" 
                            className="btn btn-primary btnSize" 
                            onClick={handleCreateNewProject}
                            disabled={savedProjects.length >= 3}
                        >
                            Créer un ravitaillement
                        </button>
                    </div>
                    <div>
                        <button type="button" className="btn btn-info btnSize" onClick={() => navigate("/Items")}>Créer des items</button>
                    </div>
                </div>

                {savedProjects.length >= 3 && (
                    <div className="alert alert-warning text-center mt-3 mx-auto" style={{ maxWidth: "600px" }}>
                        Vous avez atteint la limite de 3 projets. Supprimez-en un pour en créer un nouveau.
                    </div>
                )}

                {isLoading ? (
                    <div className="container mt-5 text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Chargement...</span>
                        </div>
                    </div>
                ) : savedProjects.length > 0 ? (
                    <div className="container mt-5" style={{ backgroundColor: "rgba(255,255,255,0.9)", borderRadius: "10px", padding: "20px", marginBottom: "50px" }}>
                        <h2 className="text-center mb-4" style={{ color: "#0D6EFD" }}>Mes Ravitaillements</h2>
                        <div className="row">
                            {savedProjects.map((project) => (
                                <div key={project.id} className="col-md-6 col-lg-4 mb-3">
                                    <div className="card h-100 shadow-sm"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleOpenProject(project)}>
                                        <div className="card-body">
                                            <div className="d-flex justify-content-between align-items-start mb-2">
                                                <h5 className="card-title text-truncate">{project.name}</h5>
                                                <button className="btn btn-outline-danger btn-sm" onClick={(e) => handleDeleteProject(project.id, e)}> x </button>
                                            </div>
                                            <p className="card-text">
                                                <strong>Parcours:</strong> {project.nameRun || 'Non défini'}<br />
                                                <strong>Distance:</strong> {project.distanceTotal.toFixed(0)} km<br />
                                                <strong>D+ :</strong> {project.denivelePositif.toFixed(0)} m<br />
                                                <strong>Ravitaillements:</strong> {project.ravitos.length}
                                            </p>
                                        </div>
                                        <div className="card-footer">
                                            <small className="text-muted">
                                                Modifié le {formatDate(project.updatedAt)}
                                            </small>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="container mt-5 text-center">
                        <p className="text-muted">Aucun projet pour le moment. Créez-en un pour commencer !</p>
                    </div>
                )}
                <div className="bottomBanner">
                    <p style={{ textAlign: "center", color: "white", marginBottom: "0px" }}>@raviTrail</p>
                </div>
            </div>
        </>
    );
}

export default HomePage;