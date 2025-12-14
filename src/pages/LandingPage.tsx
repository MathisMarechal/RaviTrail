import { useNavigate } from "react-router-dom";
import { useState } from "react";

function LandingPage() {
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<string>("");

    const features = [
        {
            icon: "📍",
            title: "Import GPX facile",
            description: "Importe ta trace GPX et visualise instantanément tout ton parcours avec les données d'élévation"
        },
        {
            icon: "🏃",
            title: "Points de ravitaillement",
            description: "Planifie stratégiquement tes points de ravitaillement sur l'ensemble du parcours"
        },
        {
            icon: "🍫",
            title: "Gestion nutritionnelle",
            description: "Crée et personnalise tes items alimentaires avec leurs valeurs nutritionnelles complètes"
        },
        {
            icon: "⚖️",
            title: "Calcul précis",
            description: "Ajuste automatiquement les quantités selon tes besoins et la durée de l'effort"
        },
        {
            icon: "📊",
            title: "Suivi en temps réel",
            description: "Visualise ta consommation de protéines et glucides par ravitaillement"
        },
        {
            icon: "✅",
            title: "Checklist préparation",
            description: "Gère l'état de préparation de chaque item (En cours, Acheté, Préparé)"
        }
    ];

    const pricingPlans = [
        {
            name: "Gratuit",
            price: "0€",
            period: "/mois",
            description: "Pour découvrir RaviTrail",
            features: [
                "1 projet",
                "Import GPX illimité",
                "Items personnalisés illimités",
                "Calculs nutritionnels de base"
            ],
            cta: "Commencer gratuitement",
            highlighted: false,
            plan: "free"
        },
        {
            name: "Premium",
            price: "5€",
            period: "/mois",
            description: "Pour les coureurs réguliers",
            features: [
                "Projets illimités",
                "Import GPX illimité",
                "Items personnalisés illimités",
                "Analyses avancées",
                "Export PDF des ravitaillements",
                "Partage de projets",
                "Accès anticipé aux nouveautés"
            ],
            cta: "Passer à Premium",
            highlighted: true,
            plan: "premium"
        }
    ];

    const handlePlanSelection = (plan: string) => {
        setSelectedPlan(plan);
        // Rediriger vers la page d'inscription avec le plan sélectionné
        navigate("/LoginPage", { state: { selectedPlan: plan, isSignUp: true } });
    };

    return (
        <div className="landing-page">
            {/* Video Background */}
            <video autoPlay loop muted playsInline className="background-clip">
                <source src="/TrailBG1.mp4" type="video/mp4" />
            </video>

            {/* Navigation */}
            <nav className="navbar navbar-expand-lg navbar-dark fixed-top" style={{ backgroundColor: "rgba(13, 110, 253, 0.95)", backdropFilter: "blur(10px)" }}>
                <div className="container">
                    <a className="navbar-brand fw-bold fs-4" href="#">
                        RaviTrail
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <a className="nav-link" href="#features">Fonctionnalités</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#pricing">Tarifs</a>
                            </li>
                            <li className="nav-item">
                                <button className="btn btn-outline-light ms-2" onClick={() => navigate("/LoginPage")}>
                                    Connexion
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section d-flex align-items-center" style={{ minHeight: "100vh", paddingTop: "80px" }}>
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-6 text-white">
                            <div className="hero-content" style={{ backgroundColor: "rgba(13, 110, 253, 0.85)", padding: "3rem", borderRadius: "20px", backdropFilter: "blur(10px)" }}>
                                <h1 className="display-3 fw-bold mb-4">
                                    Planifie tes ravitaillements.<br />
                                    <span style={{ color: "#FFD700" }}>Franchis la ligne d'arrivée.</span>
                                </h1>
                                <p className="lead mb-4">
                                    RaviTrail t'aide à optimiser ta stratégie nutritionnelle pour tes trails et ultras. 
                                    Importe ton GPX, planifie tes ravitaillements et garde l'énergie là où ça compte.
                                </p>
                                <div className="d-flex gap-3 flex-wrap">
                                    <button 
                                        className="btn btn-warning btn-lg px-5" 
                                        onClick={() => navigate("/LoginPage", { state: { isSignUp: true } })}
                                        style={{ fontWeight: "bold" }}
                                    >
                                        🚀 Commencer gratuitement
                                    </button>
                                    <button 
                                        className="btn btn-outline-light btn-lg px-5"
                                        onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                                    >
                                        En savoir plus
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <small className="text-white-50">✓ Gratuit pour toujours · ✓ Sans carte bancaire</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section py-5" style={{ backgroundColor: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)" }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3">Tout ce dont tu as besoin</h2>
                        <p className="lead text-muted">Des outils puissants pour optimiser ta stratégie nutritionnelle</p>
                    </div>
                    <div className="row g-4">
                        {features.map((feature, index) => (
                            <div key={index} className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm hover-card" style={{ transition: "transform 0.3s" }}>
                                    <div className="card-body p-4">
                                        <div className="feature-icon fs-1 mb-3">{feature.icon}</div>
                                        <h5 className="card-title fw-bold mb-3">{feature.title}</h5>
                                        <p className="card-text text-muted">{feature.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section py-5" style={{ backgroundColor: "rgba(240, 248, 255, 0.95)", backdropFilter: "blur(10px)" }}>
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="display-4 fw-bold mb-3">Des tarifs simples et transparents</h2>
                        <p className="lead text-muted">Choisis le plan qui correspond à tes besoins</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {pricingPlans.map((plan, index) => (
                            <div key={index} className="col-lg-4 col-md-6">
                                <div 
                                    className={`card h-100 ${plan.highlighted ? 'border-primary shadow-lg' : 'border-0 shadow-sm'}`}
                                    style={{ 
                                        transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
                                        transition: 'transform 0.3s'
                                    }}
                                >
                                    {plan.highlighted && (
                                        <div className="card-header bg-primary text-white text-center py-2">
                                            <small className="fw-bold">⭐ PLUS POPULAIRE</small>
                                        </div>
                                    )}
                                    <div className="card-body p-4">
                                        <h3 className="card-title fw-bold mb-3">{plan.name}</h3>
                                        <div className="mb-3">
                                            <span className="display-4 fw-bold">{plan.price}</span>
                                            <span className="text-muted">{plan.period}</span>
                                        </div>
                                        <p className="text-muted mb-4">{plan.description}</p>
                                        <button 
                                            className={`btn ${plan.highlighted ? 'btn-primary' : 'btn-outline-primary'} w-100 mb-4`}
                                            onClick={() => handlePlanSelection(plan.plan)}
                                        >
                                            {plan.cta}
                                        </button>
                                        <ul className="list-unstyled">
                                            {plan.features.map((feature, idx) => (
                                                <li key={idx} className="mb-2">
                                                    <span className="text-success me-2">✓</span>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="text-center mt-5">
                        <p className="text-muted">
                            <small>Tous les plans incluent un essai gratuit de 14 jours. Aucune carte bancaire requise pour le plan gratuit.</small>
                        </p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section py-5" style={{ backgroundColor: "rgba(13, 110, 253, 0.95)", backdropFilter: "blur(10px)" }}>
                <div className="container text-center text-white">
                    <h2 className="display-4 fw-bold mb-4">Prêt à optimiser tes ravitaillements ?</h2>
                    <p className="lead mb-4">Rejoins des centaines de traileurs qui utilisent déjà RaviTrail</p>
                    <button 
                        className="btn btn-warning btn-lg px-5"
                        onClick={() => navigate("/LoginPage", { state: { isSignUp: true } })}
                        style={{ fontWeight: "bold" }}
                    >
                        🚀 Créer mon compte gratuitement
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-4" style={{ backgroundColor: "rgba(33, 37, 41, 0.95)", backdropFilter: "blur(10px)" }}>
                <div className="container">
                    <div className="row">
                        <div className="col-md-6">
                            <h5 className="text-white fw-bold mb-3">RaviTrail</h5>
                            <p className="text-white-50">
                                La solution complète pour planifier tes ravitaillements en trail et ultra.
                            </p>
                        </div>
                        <div className="col-md-3">
                            <h6 className="text-white mb-3">Liens rapides</h6>
                            <ul className="list-unstyled">
                                <li><a href="#features" className="text-white-50 text-decoration-none">Fonctionnalités</a></li>
                                <li><a href="#pricing" className="text-white-50 text-decoration-none">Tarifs</a></li>
                                <li><button className="btn btn-link text-white-50 text-decoration-none p-0" onClick={() => navigate("/LoginPage")}>Connexion</button></li>
                            </ul>
                        </div>
                        <div className="col-md-3">
                            <h6 className="text-white mb-3">Légal</h6>
                            <ul className="list-unstyled">
                                <li><a href="#" className="text-white-50 text-decoration-none">CGU</a></li>
                                <li><a href="#" className="text-white-50 text-decoration-none">Confidentialité</a></li>
                                <li><a href="#" className="text-white-50 text-decoration-none">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr className="bg-white-50 my-4" />
                    <div className="text-center text-white-50">
                        <p className="mb-0">© 2024 RaviTrail. Tous droits réservés.</p>
                    </div>
                </div>
            </footer>

            <style>{`
                .landing-page {
                    position: relative;
                    width: 100%;
                    overflow-x: hidden;
                }

                .background-clip {
                    position: fixed;
                    right: 0;
                    bottom: 0;
                    min-width: 100%;
                    min-height: 100%;
                    z-index: -1;
                    filter: blur(3px);
                    object-fit: cover;
                }

                .hover-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
                }

                .navbar {
                    transition: all 0.3s;
                }

                .hero-content {
                    animation: fadeInUp 1s ease-out;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @media (max-width: 768px) {
                    .hero-content {
                        padding: 2rem !important;
                    }
                    
                    .display-3 {
                        font-size: 2.5rem !important;
                    }
                }
            `}</style>
        </div>
    );
}

export default LandingPage;