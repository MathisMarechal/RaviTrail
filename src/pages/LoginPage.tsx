import { type FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { supabase } from "../supabase-client";

function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    
    const { isSignUp, setIsSignUp, email, setEmail, password, setPassword } = useMyContext();
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectedPlan, setSelectedPlan] = useState<string>("free");

    // Récupérer les paramètres de la landing page
    useEffect(() => {
        if (location.state) {
            if (location.state.isSignUp) {
                setIsSignUp(true);
            }
            if (location.state.selectedPlan) {
                setSelectedPlan(location.state.selectedPlan);
            }
        }
    }, [location.state, setIsSignUp]);

    const handleSubmitLog = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            if (isSignUp) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            plan: selectedPlan
                        }
                    }
                });

                if (signUpError) {
                    setError(signUpError.message);
                    setIsLoading(false);
                    return;
                }

                // Message de succès
                setError("✅ Compte créé ! Vérifiez votre email pour confirmer votre inscription.");
            } else {
                const { error: signInError } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (signInError) {
                    setError("❌ " + signInError.message);
                    setIsLoading(false);
                    return;
                }
            }
        } catch (err) {
            setError("Une erreur s'est produite. Veuillez réessayer.");
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="containerHomePage">
                <video autoPlay loop muted playsInline className="background-clip">
                    <source src="/TrailBG1.mp4" type="video/mp4" />
                </video>

                {/* Navigation */}
                <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "rgba(13, 110, 253, 0.95)", backdropFilter: "blur(10px)" }}>
                    <div className="container">
                        <a className="navbar-brand fw-bold fs-4" href="#" onClick={() => navigate("/")}>
                            RaviTrail
                        </a>
                        <button 
                            className="btn btn-outline-light"
                            onClick={() => navigate("/")}
                        >
                            ← Retour
                        </button>
                    </div>
                </nav>

                {/* Login Form */}
                <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "calc(100vh - 80px)", paddingTop: "2rem", paddingBottom: "2rem" }}>
                    <div className="col-lg-5 col-md-7 col-sm-9">
                        <div className="card border-0 shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(10px)" }}>
                            <div className="card-body p-5">
                                {/* Header */}
                                <div className="text-center mb-4">
                                    <h2 className="fw-bold mb-2">
                                        {isSignUp ? "🚀 Créer un compte" : "👋 Bon retour !"}
                                    </h2>
                                    <p className="text-muted">
                                        {isSignUp 
                                            ? "Rejoins la communauté RaviTrail" 
                                            : "Connecte-toi pour accéder à tes projets"}
                                    </p>
                                </div>

                                {/* Plan Badge (si inscription) */}
                                {isSignUp && selectedPlan !== "free" && (
                                    <div className="alert alert-success text-center mb-4">
                                        <strong>Plan sélectionné :</strong> {selectedPlan === "premium" ? "Premium" : "Pro"} ✨
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className={`alert ${error.includes("✅") ? "alert-success" : "alert-danger"} mb-4`}>
                                        {error}
                                    </div>
                                )}

                                {/* Form */}
                                <form onSubmit={handleSubmitLog}>
                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <span className="me-2">📧</span>
                                            Adresse email
                                        </label>
                                        <input 
                                            type="email" 
                                            className="form-control form-control-lg" 
                                            placeholder="ton-email@example.com"
                                            value={email} 
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                        {isSignUp && (
                                            <small className="form-text text-muted">
                                                Nous ne partagerons jamais ton email.
                                            </small>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label fw-bold">
                                            <span className="me-2">🔒</span>
                                            Mot de passe
                                        </label>
                                        <input 
                                            type="password" 
                                            className="form-control form-control-lg" 
                                            placeholder={isSignUp ? "Minimum 6 caractères" : "Ton mot de passe"}
                                            value={password} 
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            disabled={isLoading}
                                        />
                                        {isSignUp && (
                                            <small className="form-text text-muted">
                                                Minimum 6 caractères pour plus de sécurité.
                                            </small>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary btn-lg w-100 mb-3"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2"></span>
                                                {isSignUp ? "Création en cours..." : "Connexion..."}
                                            </>
                                        ) : (
                                            <>
                                                {isSignUp ? "🚀 Créer mon compte" : "🔓 Se connecter"}
                                            </>
                                        )}
                                    </button>

                                    {/* Toggle Sign Up / Sign In */}
                                    <div className="text-center">
                                        <button 
                                            type="button" 
                                            className="btn btn-link text-decoration-none"
                                            onClick={() => {
                                                setIsSignUp(!isSignUp);
                                                setError("");
                                            }}
                                            disabled={isLoading}
                                        >
                                            {isSignUp 
                                                ? "Tu as déjà un compte ? Connecte-toi" 
                                                : "Pas encore de compte ? Inscris-toi"}
                                        </button>
                                    </div>
                                </form>

                                {/* Benefits (si inscription) */}
                                {isSignUp && (
                                    <div className="mt-4 pt-4 border-top">
                                        <h6 className="fw-bold mb-3">✨ Ce qui t'attend :</h6>
                                        <ul className="list-unstyled">
                                            <li className="mb-2">
                                                <span className="text-success me-2">✓</span>
                                                Jusqu'à 3 projets gratuits
                                            </li>
                                            <li className="mb-2">
                                                <span className="text-success me-2">✓</span>
                                                Import GPX illimité
                                            </li>
                                            <li className="mb-2">
                                                <span className="text-success me-2">✓</span>
                                                Calculs nutritionnels automatiques
                                            </li>
                                            <li className="mb-2">
                                                <span className="text-success me-2">✓</span>
                                                Items personnalisés
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Privacy Note */}
                        <div className="text-center mt-3">
                            <small className="text-white-50">
                                En continuant, tu acceptes nos{" "}
                                <a href="#" className="text-white">Conditions d'utilisation</a> et notre{" "}
                                <a href="#" className="text-white">Politique de confidentialité</a>
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .form-control:focus {
                    border-color: #0D6EFD;
                    box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
                }

                .btn-primary {
                    transition: transform 0.2s;
                }

                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                }

                @media (max-width: 768px) {
                    .card-body {
                        padding: 2rem !important;
                    }
                }
            `}</style>
        </>
    );
}

export default LoginPage;