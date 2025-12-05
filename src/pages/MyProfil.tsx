import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { useHandleSubmitProfil } from "../components/AllFunctions/handleSubmitProfil";
import { useHandleEditProfil } from "../components/AllFunctions/handleEditProfil";
import { supabase } from "../supabase-client";
import { LogOut } from "../components/AllFunctions/logOut";
import type { Profil } from "../types";

function MyProfil() {
    const {
        consGluH,
        setConGluH,
        consProtH,
        setConProtH,
        profilName,
        setProfilName,
        myProfil,
        setMyProfil,
        session
    } = useMyContext();

    const { handleSubmitProfilFunction } = useHandleSubmitProfil();
    const { handleEditProfilFunction } = useHandleEditProfil();

    const navigate = useNavigate();
    const location = useLocation();
    const [editedProfil, setEditedProfil] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // États pour les modals
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // États pour le changement de mot de passe
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const fetchMyProfil = async () => {
        setIsLoading(true);
        const { error, data } = await supabase
            .from("myProfil")
            .select("*")
            .eq("email", session.user.email)
            .single();

        if (data) {
            setMyProfil(data);
            setEditedProfil(true);
        }

        if (error) {
            console.error("Error load task: ", error.message);
        }
        
        setIsLoading(false);
    };

    useEffect(() => {
        fetchMyProfil();
    }, []);

    useEffect(() => {
        const channel = supabase.channel("myProfil-channel");
        channel.on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "myProfil" },
            (payload) => {
                const newProfil = payload.new as Profil;
                setMyProfil(newProfil);
            }
        ).subscribe((status) => {
            console.log("Subscription:", status);
        });

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess("");

        if (newPassword !== confirmPassword) {
            setPasswordError("Les mots de passe ne correspondent pas");
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        setIsChangingPassword(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                setPasswordError(error.message);
            } else {
                setPasswordSuccess("Mot de passe modifié avec succès");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setTimeout(() => {
                    setShowPasswordModal(false);
                    setPasswordSuccess("");
                }, 2000);
            }
        } catch (error) {
            setPasswordError("Erreur lors du changement de mot de passe");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        // Cette fonction nécessiterait une implémentation backend appropriée
        alert("La suppression de compte nécessite une confirmation par email. Contactez le support.");
        setShowDeleteModal(false);
    };

    return (
        <>
            <div className="d-flex justify-content-evenly" style={{ paddingBottom: "30px", paddingTop: "30px", backgroundColor: "#0D6EFD", position: "relative", zIndex: 1 }}>
                <div 
                    style={{ cursor: "pointer", textDecoration: location.pathname === "/" ? "underline" : "none", color: "white", fontWeight: "bold", textUnderlineOffset: "8px" }} 
                    onClick={() => navigate("/")}
                >
                    Home
                </div>
                <div style={{ color: "white", fontWeight: "bold" }}>RaviTrail</div>
                <div 
                    style={{ cursor: "pointer", textDecoration: location.pathname === "/MyProfil" ? "underline" : "none", color: "white", fontWeight: "bold", textUnderlineOffset: "8px" }} 
                    onClick={() => navigate("/MyProfil")}
                >
                    Profil
                </div>
            </div>

            <div className="bannerMyProfil" style={{ minHeight: "calc(100vh - 80px)", padding: "40px 20px" }}>
                <div className="container" style={{ maxWidth: "1200px" }}>
                    <h1 className="text-center mb-5" style={{ color: "white", fontWeight: "bold" }}>Mon profil</h1>

                    {isLoading ? (
                        <div className="text-center">
                            <div className="spinner-border text-light" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {/* Section principale - Nutrition */}
                            <div className="col-lg-8">
                                <div className="card shadow-lg border-0 h-100">
                                    <div className="card-body p-4">
                                        {!editedProfil ? (
                                            <>
                                                <h4 className="mb-4">
                                                    <i className="bi bi-egg-fried me-2 text-primary"></i>
                                                    Créer mon profil nutritionnel
                                                </h4>
                                                <form onSubmit={(e) => handleSubmitProfilFunction(e, setEditedProfil)}>
                                                    <div className="mb-4">
                                                        <label className="form-label fw-bold">Nom du profil *</label>
                                                        <input 
                                                            type="text" 
                                                            className="form-control form-control-lg" 
                                                            placeholder="Ex: Mon profil trail" 
                                                            value={profilName} 
                                                            onChange={(e) => setProfilName(e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-6 mb-4">
                                                            <label className="form-label fw-bold">Consommation de glucides (g/h) *</label>
                                                            <input 
                                                                type="number" 
                                                                className="form-control form-control-lg" 
                                                                placeholder="40" 
                                                                value={consGluH} 
                                                                onChange={(e) => setConGluH(e.target.value === "" ? "" : Number(e.target.value))}
                                                                required
                                                            />
                                                            <small className="text-muted">Recommandé: 30-60 g/h pendant l'effort</small>
                                                        </div>
                                                        <div className="col-md-6 mb-4">
                                                            <label className="form-label fw-bold">Consommation de protéines (g/h) *</label>
                                                            <input 
                                                                type="number" 
                                                                className="form-control form-control-lg" 
                                                                placeholder="5" 
                                                                value={consProtH} 
                                                                onChange={(e) => setConProtH(e.target.value === "" ? "" : Number(e.target.value))}
                                                                required
                                                            />
                                                            <small className="text-muted">Recommandé: 5-10 g/h pour les efforts longs</small>
                                                        </div>
                                                    </div>
                                                    <button type="submit" className="btn btn-primary btn-lg w-100">
                                                        <i className="bi bi-check-circle me-2"></i>
                                                        Créer mon profil
                                                    </button>
                                                </form>
                                            </>
                                        ) : myProfil ? (
                                            <>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <h4 className="mb-0">
                                                        <i className="bi bi-person-badge me-2 text-primary"></i>
                                                        {myProfil.name}
                                                    </h4>
                                                    <button 
                                                        className="btn btn-outline-primary" 
                                                        onClick={(e) => handleEditProfilFunction(e, setEditedProfil)}
                                                    >
                                                        <i className="bi bi-pencil me-2"></i>
                                                        Modifier
                                                    </button>
                                                </div>

                                                <div className="alert alert-light border">
                                                    <h6 className="text-primary mb-3">
                                                        <i className="bi bi-graph-up me-2"></i>
                                                        Besoins nutritionnels par heure
                                                    </h6>
                                                    <div className="row text-center">
                                                        <div className="col-6">
                                                            <div className="p-3 bg-white rounded">
                                                                <small className="text-muted d-block mb-1">Glucides</small>
                                                                <h2 className="mb-0 text-success">{myProfil.consGlu}</h2>
                                                                <small className="text-muted">g/h</small>
                                                            </div>
                                                        </div>
                                                        <div className="col-6">
                                                            <div className="p-3 bg-white rounded">
                                                                <small className="text-muted d-block mb-1">Protéines</small>
                                                                <h2 className="mb-0 text-info">{myProfil.consProt}</h2>
                                                                <small className="text-muted">g/h</small>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    <h6 className="mb-3">
                                                        <i className="bi bi-info-circle me-2"></i>
                                                        Informations du compte
                                                    </h6>
                                                    <p className="text-muted mb-1">
                                                        <i className="bi bi-envelope me-2"></i>
                                                        {session?.user?.email}
                                                    </p>
                                                    <p className="text-muted mb-0">
                                                        <i className="bi bi-calendar me-2"></i>
                                                        Membre depuis: {new Date(session?.user?.created_at).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                            </>
                                        ) : null}
                                    </div>
                                </div>
                            </div>

                            {/* Menu latéral */}
                            <div className="col-lg-4">
                                <div className="card shadow-lg border-0 mb-4">
                                    <div className="card-body p-4">
                                        <h5 className="mb-3">
                                            <i className="bi bi-grid me-2 text-primary"></i>
                                            Actions rapides
                                        </h5>
                                        <div className="d-grid gap-2">
                                            <button 
                                                className="btn btn-outline-primary text-start"
                                                onClick={() => navigate("/Items")}
                                            >
                                                <i className="bi bi-box me-2"></i>
                                                Gérer mes items
                                            </button>
                                            <button 
                                                className="btn btn-outline-secondary text-start"
                                                onClick={() => setShowPasswordModal(true)}
                                            >
                                                <i className="bi bi-key me-2"></i>
                                                Changer le mot de passe
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-lg border-0 mb-4">
                                    <div className="card-body p-4">
                                        <h5 className="mb-3">
                                            <i className="bi bi-shield-check me-2 text-success"></i>
                                            Légal & Confidentialité
                                        </h5>
                                        <div className="d-grid gap-2">
                                            <button 
                                                className="btn btn-link text-start text-decoration-none"
                                                onClick={() => setShowTermsModal(true)}
                                            >
                                                <i className="bi bi-file-text me-2"></i>
                                                Conditions d'utilisation
                                            </button>
                                            <button 
                                                className="btn btn-link text-start text-decoration-none"
                                                onClick={() => setShowPrivacyModal(true)}
                                            >
                                                <i className="bi bi-lock me-2"></i>
                                                Politique de confidentialité
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="card shadow-lg border-0 border-danger">
                                    <div className="card-body p-4">
                                        <h5 className="mb-3 text-danger">
                                            <i className="bi bi-exclamation-triangle me-2"></i>
                                            Zone dangereuse
                                        </h5>
                                        <button 
                                            className="btn btn-outline-danger w-100"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            <i className="bi bi-trash me-2"></i>
                                            Supprimer mon compte
                                        </button>
                                    </div>
                                </div>

                                <div className="text-center mt-4">
                                    <button className="btn btn-danger px-4 w-100" onClick={LogOut}>
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Déconnexion
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Changement de mot de passe */}
            {showPasswordModal && (
                <div className="modal d-flex align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="bi bi-key me-2"></i>
                                    Changer le mot de passe
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => {
                                        setShowPasswordModal(false);
                                        setPasswordError("");
                                        setPasswordSuccess("");
                                    }}
                                ></button>
                            </div>
                            <form onSubmit={handleChangePassword}>
                                <div className="modal-body">
                                    {passwordError && (
                                        <div className="alert alert-danger">
                                            <i className="bi bi-exclamation-circle me-2"></i>
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="alert alert-success">
                                            <i className="bi bi-check-circle me-2"></i>
                                            {passwordSuccess}
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Nouveau mot de passe</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                        />
                                        <small className="text-muted">Minimum 6 caractères</small>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Confirmer le nouveau mot de passe</label>
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button 
                                        type="button" 
                                        className="btn btn-secondary" 
                                        onClick={() => setShowPasswordModal(false)}
                                        disabled={isChangingPassword}
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary"
                                        disabled={isChangingPassword}
                                    >
                                        {isChangingPassword ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                Modification...
                                            </>
                                        ) : (
                                            'Modifier'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Conditions d'utilisation */}
            {showTermsModal && (
                <div className="modal d-flex align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Conditions d'utilisation</h5>
                                <button type="button" className="btn-close" onClick={() => setShowTermsModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <h6>1. Acceptation des conditions</h6>
                                <p className="text-muted">En utilisant RaviTrail, vous acceptez ces conditions d'utilisation dans leur intégralité.</p>
                                
                                <h6>2. Utilisation du service</h6>
                                <p className="text-muted">RaviTrail est une application de planification de ravitaillement pour les courses de trail. Vous êtes responsable de l'exactitude des informations que vous fournissez.</p>
                                
                                <h6>3. Données personnelles</h6>
                                <p className="text-muted">Vos données sont stockées de manière sécurisée et ne sont jamais partagées avec des tiers sans votre consentement.</p>
                                
                                <h6>4. Responsabilité</h6>
                                <p className="text-muted">Les calculs nutritionnels fournis sont indicatifs. Consultez un professionnel de santé pour des conseils personnalisés.</p>
                                
                                <h6>5. Modifications</h6>
                                <p className="text-muted">Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront notifiées par email.</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => setShowTermsModal(false)}>
                                    J'ai compris
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Politique de confidentialité */}
            {showPrivacyModal && (
                <div className="modal d-flex align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Politique de confidentialité</h5>
                                <button type="button" className="btn-close" onClick={() => setShowPrivacyModal(false)}></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                <h6>Collecte des données</h6>
                                <p className="text-muted">Nous collectons uniquement les données nécessaires au fonctionnement de l'application:</p>
                                <ul className="text-muted">
                                    <li>Adresse email (pour l'authentification)</li>
                                    <li>Profil nutritionnel (consommation glucides/protéines)</li>
                                    <li>Projets de ravitaillement et items associés</li>
                                </ul>
                                
                                <h6>Utilisation des données</h6>
                                <p className="text-muted">Vos données sont utilisées exclusivement pour:</p>
                                <ul className="text-muted">
                                    <li>Fournir les services de l'application</li>
                                    <li>Sauvegarder vos projets et préférences</li>
                                    <li>Améliorer l'expérience utilisateur</li>
                                </ul>
                                
                                <h6>Sécurité</h6>
                                <p className="text-muted">Nous utilisons des mesures de sécurité standard pour protéger vos données:</p>
                                <ul className="text-muted">
                                    <li>Chiffrement des mots de passe</li>
                                    <li>Connexion sécurisée HTTPS</li>
                                    <li>Base de données sécurisée (Supabase)</li>
                                </ul>
                                
                                <h6>Vos droits</h6>
                                <p className="text-muted">Conformément au RGPD, vous avez le droit de:</p>
                                <ul className="text-muted">
                                    <li>Accéder à vos données personnelles</li>
                                    <li>Modifier vos informations</li>
                                    <li>Supprimer votre compte et toutes vos données</li>
                                    <li>Exporter vos données</li>
                                </ul>
                                
                                <h6>Contact</h6>
                                <p className="text-muted">Pour toute question concernant vos données, contactez-nous à: privacy@ravitrail.com</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-primary" onClick={() => setShowPrivacyModal(false)}>
                                    J'ai compris
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Suppression de compte */}
            {showDeleteModal && (
                <div className="modal d-flex align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header bg-danger text-white">
                                <h5 className="modal-title">
                                    <i className="bi bi-exclamation-triangle me-2"></i>
                                    Supprimer mon compte
                                </h5>
                                <button type="button" className="btn-close btn-close-white" onClick={() => setShowDeleteModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="alert alert-danger">
                                    <strong>Attention !</strong> Cette action est irréversible.
                                </div>
                                <p>La suppression de votre compte entraînera:</p>
                                <ul>
                                    <li>La suppression définitive de votre profil</li>
                                    <li>La perte de tous vos projets de ravitaillement</li>
                                    <li>La suppression de tous vos items personnalisés</li>
                                    <li>La perte de toutes vos données</li>
                                </ul>
                                <p className="mb-0"><strong>Êtes-vous sûr de vouloir continuer ?</strong></p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                    Annuler
                                </button>
                                <button type="button" className="btn btn-danger" onClick={handleDeleteAccount}>
                                    <i className="bi bi-trash me-2"></i>
                                    Oui, supprimer mon compte
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .bannerMyProfil {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
                .card {
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 16px rgba(0,0,0,0.15) !important;
                }
                .btn {
                    transition: all 0.2s;
                }
                .btn:hover {
                    transform: translateY(-1px);
                }
                .modal {
                    z-index: 1050;
                }
            `}</style>
        </>
    );
}

export default MyProfil;