import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { fetchProjects, deleteProject } from "../supabase-client";
import Header from "../components/Header";
import { PLAN_LIMITS } from "../types";

function HomePage() {
    const { savedProjects, setSavedProjects, setCurrentProject, userPlan, session } = useMyContext();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [showWelcome, setShowWelcome] = useState(false);

    const maxProjects = PLAN_LIMITS[userPlan].maxProjects;
    const canCreateProject = savedProjects.length < maxProjects;

    useEffect(() => {
        const loadProjects = async () => {
            try {
                setIsLoading(true);
                const projects = await fetchProjects();
                setSavedProjects(projects);
                
                if (projects.length === 0) {
                    setShowWelcome(true);
                }
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
        if (!canCreateProject) {
            if (userPlan === 'free') {
                alert("🔒 Limite atteinte ! Passez à Premium pour créer des projets illimités.");
                navigate("/MyProfil");
            }
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

                <Header isAuthenticated={true} />

                {/* Welcome Message */}
                {showWelcome && (
                    <div className="container mt-4">
                        <div className="alert alert-success alert-dismissible fade show" role="alert" style={{ backgroundColor: "rgba(25, 135, 84, 0.9)", backdropFilter: "blur(10px)", color: "white" }}>
                            <h4 className="alert-heading">🎉 Bienvenue sur RaviTrail !</h4>
                            <p>Prêt à optimiser tes ravitaillements ? Commence par créer ton premier projet.</p>
                            <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />
                            <p className="mb-0">💡 <strong>Astuce :</strong> N'oublie pas de créer d'abord tes items alimentaires personnalisés dans la section "Items" !</p>
                            <button type="button" className="btn-close btn-close-white" onClick={() => setShowWelcome(false)}></button>
                        </div>
                    </div>
                )}

                {/* Main Content */}
                <div className="container mt-5 mb-5">
                    {/* Quick Actions */}
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card border-0 shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)" }}>
                                <div className="card-body p-4">
                                    <div className="row align-items-center">
                                        <div className="col-md-8">
                                            <h2 className="mb-2">
                                                Mes projets de ravitaillement
                                                {userPlan === 'premium' && (
                                                    <span className="badge bg-warning text-dark ms-2">PREMIUM</span>
                                                )}
                                            </h2>
                                            <p className="text-muted mb-0">
                                                {userPlan === 'free' ? (
                                                    <>
                                                        {savedProjects.length}/{maxProjects} projet utilisé (Plan Gratuit)
                                                        {savedProjects.length >= maxProjects && (
                                                            <span className="badge bg-danger ms-2">Limite atteinte</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <>
                                                        {savedProjects.length} projet{savedProjects.length > 1 ? 's' : ''} (Illimité)
                                                        <span className="badge bg-success ms-2">✓</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                        <div className="col-md-4 text-md-end mt-3 mt-md-0">
                                            <button 
                                                className="btn btn-primary btn-lg me-2 mb-2 mb-md-0"
                                                onClick={handleCreateNewProject}
                                                disabled={!canCreateProject && userPlan === 'free'}
                                            >
                                                ➕ Nouveau projet
                                            </button>
                                            <button 
                                                className="btn btn-outline-primary btn-lg"
                                                onClick={() => navigate("/Items")}
                                            >
                                                📦 Gérer items
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Projects Grid */}
                    {isLoading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                            <p className="mt-3 text-white fw-bold">Chargement de vos projets...</p>
                        </div>
                    ) : savedProjects.length > 0 ? (
                        <div className="row g-4">
                            {savedProjects.map((project) => (
                                <div key={project.id} className="col-lg-4 col-md-6">
                                    <div 
                                        className="card h-100 border-0 shadow-lg project-card"
                                        style={{ cursor: "pointer", transition: "transform 0.3s", backgroundColor: "rgba(255, 255, 255, 0.95)" }}
                                        onClick={() => handleOpenProject(project)}
                                    >
                                        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                                            <h5 className="mb-0 text-truncate flex-grow-1">
                                                {project.name}
                                                {project.isShared && (
                                                    <span className="badge bg-info ms-2" style={{ fontSize: "0.7rem" }}>
                                                        Partagé
                                                    </span>
                                                )}
                                            </h5>
                                            <button 
                                                className="btn btn-sm btn-outline-light"
                                                onClick={(e) => handleDeleteProject(project.id, e)}
                                                title="Supprimer"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                        <div className="card-body">
                                            <div className="mb-3">
                                                <h6 className="text-muted mb-2">
                                                    <span className="badge bg-info text-dark">
                                                        {project.nameRun || 'Parcours non défini'}
                                                    </span>
                                                </h6>
                                            </div>
                                            <div className="row text-center mb-3">
                                                <div className="col-4">
                                                    <div className="p-2 bg-light rounded">
                                                        <small className="text-muted d-block">Distance</small>
                                                        <strong>{project.distanceTotal.toFixed(0)} km</strong>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="p-2 bg-light rounded">
                                                        <small className="text-muted d-block">D+</small>
                                                        <strong>{project.denivelePositif.toFixed(0)} m</strong>
                                                    </div>
                                                </div>
                                                <div className="col-4">
                                                    <div className="p-2 bg-light rounded">
                                                        <small className="text-muted d-block">Ravitos</small>
                                                        <strong>{project.ravitos.length}</strong>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <small className="text-muted">
                                                    📅 {formatDate(project.updatedAt)}
                                                </small>
                                                <span className="badge bg-success">Sauvegardé</span>
                                            </div>
                                        </div>
                                        <div className="card-footer bg-transparent border-top-0">
                                            <button className="btn btn-outline-primary btn-sm w-100">
                                                ✏️ Ouvrir le projet
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-5">
                            <div className="card border-0 shadow-lg d-inline-block" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", maxWidth: "500px" }}>
                                <div className="card-body p-5">
                                    <div className="mb-4" style={{ fontSize: "4rem" }}>🏃‍♂️</div>
                                    <h3 className="mb-3">Aucun projet pour le moment</h3>
                                    <p className="text-muted mb-4">
                                        Crée ton premier projet de ravitaillement pour commencer à planifier ton trail !
                                    </p>
                                    <button 
                                        className="btn btn-primary btn-lg"
                                        onClick={handleCreateNewProject}
                                    >
                                        🚀 Créer mon premier projet
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Upgrade Banner */}
                    {userPlan === 'free' && savedProjects.length >= maxProjects && (
                        <div className="row mt-4">
                            <div className="col-12">
                                <div className="card border-0 shadow-lg" style={{ backgroundColor: "rgba(255, 215, 0, 0.95)", backdropFilter: "blur(10px)" }}>
                                    <div className="card-body p-4 text-center">
                                        <h4 className="mb-3">⭐ Besoin de plus de projets ?</h4>
                                        <p className="mb-3">Passez à Premium pour créer des projets illimités et accéder à des fonctionnalités avancées !</p>
                                        <ul className="list-unstyled mb-3">
                                            <li>✅ Projets illimités</li>
                                            <li>✅ Export PDF</li>
                                            <li>✅ Partage de projets</li>
                                            <li>✅ Analyses avancées</li>
                                        </ul>
                                        <button className="btn btn-dark btn-lg" onClick={() => navigate("/MyProfil")}>
                                            🚀 Passer à Premium - 5€/mois
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .project-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 15px 40px rgba(0,0,0,0.2) !important;
                }

                .containerHomePage {
                    position: relative;
                    min-height: 100vh;
                    width: 100%;
                }

                @media (max-width: 768px) {
                    .btn-lg {
                        font-size: 1rem;
                        padding: 0.5rem 1rem;
                    }
                }
            `}</style>
        </>
    );
}

export default HomePage;