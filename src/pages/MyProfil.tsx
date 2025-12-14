import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { useHandleSubmitProfil } from "../components/AllFunctions/handleSubmitProfil";
import { useHandleEditProfil } from "../components/AllFunctions/handleEditProfil";
import { supabase } from "../supabase-client";
import Header from "../components/Header";
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
        session,
        userPlan,
        refreshUserPlan
    } = useMyContext();

    const { handleSubmitProfilFunction } = useHandleSubmitProfil();
    const { handleEditProfilFunction } = useHandleEditProfil();

    const navigate = useNavigate();
    const [editedProfil, setEditedProfil] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const isPremium = userPlan === 'premium';

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

    const handleUpgradeToPremium = async () => {
        try {
            const { error } = await supabase
                .from('myProfil')
                .update({ plan: 'premium' })
                .eq('email', session.user.email);

            if (error) throw error;

            await refreshUserPlan();
            alert("✅ Félicitations ! Vous êtes maintenant Premium !");
            setShowUpgradeModal(false);
        } catch (error) {
            console.error('Erreur lors de l\'upgrade:', error);
            alert('❌ Erreur lors de la mise à niveau');
        }
    };

    const handleDowngradeToFree = async () => {
        if (!confirm("Êtes-vous sûr de vouloir passer en plan Gratuit ? Vous perdrez l'accès aux fonctionnalités Premium.")) {
            return;
        }

        try {
            const { error } = await supabase
                .from('myProfil')
                .update({ plan: 'free' })
                .eq('email', session.user.email);

            if (error) throw error;

            await refreshUserPlan();
            alert("Vous êtes maintenant en plan Gratuit");
        } catch (error) {
            console.error('Erreur lors du downgrade:', error);
            alert('❌ Erreur lors du changement de plan');
        }
    };

    return (
        <>
            <Header isAuthenticated={true} />

            <div className="bannerMyProfil" style={{ minHeight: "calc(100vh - 80px)", padding: "40px 20px" }}>
                <div className="container" style={{ maxWidth: "1200px" }}>
                    <h1 className="text-center mb-5" style={{ color: "white", fontWeight: "bold" }}>
                        Mon profil
                        {isPremium && (
                            <span className="badge bg-warning text-dark ms-3">PREMIUM</span>
                        )}
                    </h1>

                    {isLoading ? (
                        <div className="text-center">
                            <div className="spinner-border text-light" role="status">
                                <span className="visually-hidden">Chargement...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {/* Section Abonnement */}
                            <div className="col-lg-12 mb-4">
                                <div className="card shadow-lg border-0">
                                    <div className={`card-header ${isPremium ? 'bg-warning' : 'bg-light'} py-3`}>
                                        <h5 className="mb-0">
                                            {isPremium ? '⭐ ' : '📦 '}
                                            Plan {isPremium ? 'Premium' : 'Gratuit'}
                                        </h5>
                                    </div>
                                    <div className="card-body p-4">
                                        <div className="row">
                                            <div className="col-md-8">
                                                {isPremium ? (
                                                    <>
                                                        <h6 className="fw-bold text-warning">Fonctionnalités Premium actives :</h6>
                                                        <ul>
                                                            <li>✅ Projets illimités</li>
                                                            <li>✅ Export PDF des ravitaillements</li>
                                                            <li>✅ Partage de projets</li>
                                                            <li>✅ Analyses avancées</li>
                                                            <li>✅ Accès anticipé aux nouveautés</li>
                                                        </ul>
                                                        <p className="text-muted mb-0">Prix: 5€/mois</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <h6 className="fw-bold">Fonctionnalités actuelles :</h6>
                                                        <ul>
                                                            <li>✅ 1 projet</li>
                                                            <li>✅ Import GPX illimité</li>
                                                            <li>✅ Items personnalisés illimités</li>
                                                            <li>✅ Calculs nutritionnels de base</li>
                                                        </ul>
                                                        <div className="alert alert-info">
                                                            <strong>💡 Envie de plus ?</strong> Passez à Premium pour débloquer toutes les fonctionnalités !
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                            <div className="col-md-4 text-center">
                                                {isPremium ? (
                                                    <button
                                                        className="btn btn-outline-secondary w-100"
                                                        onClick={handleDowngradeToFree}
                                                    >
                                                        Revenir au plan Gratuit
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn btn-warning btn-lg w-100"
                                                        onClick={() => setShowUpgradeModal(true)}
                                                    >
                                                        ⭐ Passer à Premium<br />
                                                        <small>5€/mois</small>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section Nutrition */}
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
                                                            <small className="text-muted">Recommandé: 30-60 g/h</small>
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
                                                            <small className="text-muted">Recommandé: 5-10 g/h</small>
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
                                <div className="card shadow-lg border-0">
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
                                                onClick={() => navigate("/home")}
                                            >
                                                <i className="bi bi-house me-2"></i>
                                                Mes projets
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Upgrade Premium */}
            {showUpgradeModal && (
                <div className="modal d-flex align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-warning">
                                <h5 className="modal-title">⭐ Passer à Premium</h5>
                                <button type="button" className="btn-close" onClick={() => setShowUpgradeModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold">5€<small>/mois</small></h2>
                                    <p className="text-muted">Sans engagement</p>
                                </div>

                                <h6 className="fw-bold mb-3">Débloquez toutes les fonctionnalités :</h6>
                                <ul className="list-unstyled">
                                    <li className="mb-2">✅ <strong>Projets illimités</strong></li>
                                    <li className="mb-2">✅ <strong>Export PDF</strong> des ravitaillements</li>
                                    <li className="mb-2">✅ <strong>Partage de projets</strong> avec d'autres utilisateurs</li>
                                    <li className="mb-2">✅ <strong>Analyses avancées</strong> et recommandations</li>
                                    <li className="mb-2">✅ <strong>Accès anticipé</strong> aux nouveautés</li>
                                </ul>

                                <div className="alert alert-info">
                                    <strong>💡 Mode démo :</strong> Cliquez sur "Activer Premium" pour tester toutes les fonctionnalités. 
                                    En production, cette fonctionnalité serait reliée à un système de paiement (Stripe, PayPal...).
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowUpgradeModal(false)}>
                                    Annuler
                                </button>
                                <button type="button" className="btn btn-warning btn-lg" onClick={handleUpgradeToPremium}>
                                    ⭐ Activer Premium (Mode démo)
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
            `}</style>
        </>
    );
}

export default MyProfil;