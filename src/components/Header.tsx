import { useLocation, useNavigate } from "react-router-dom";
import { LogOut } from "./AllFunctions/logOut";
import { useMyContext } from "../context/Context";

interface HeaderProps {
    isAuthenticated?: boolean;
}

function Header({ isAuthenticated = false }: HeaderProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { session, myProfil } = useMyContext();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#0D6EFD", position: "relative", zIndex: 10 }}>
            <div className="container-fluid px-4">
                <span 
                    className="navbar-brand fw-bold" 
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(isAuthenticated ? "/home" : "/")}
                >
                    RaviTrail
                    {myProfil?.plan === 'premium' && (
                        <span className="badge bg-warning text-dark ms-2" style={{ fontSize: "0.6rem" }}>
                            PREMIUM
                        </span>
                    )}
                </span>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto align-items-center">
                        {isAuthenticated ? (
                            <>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link btn btn-link text-white ${location.pathname === '/home' ? 'fw-bold' : ''}`}
                                        onClick={() => navigate("/home")}
                                    >
                                        🏠 Accueil
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link btn btn-link text-white ${location.pathname === '/Items' ? 'fw-bold' : ''}`}
                                        onClick={() => navigate("/Items")}
                                    >
                                        📦 Items
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link btn btn-link text-white ${location.pathname === '/MyProfil' ? 'fw-bold' : ''}`}
                                        onClick={() => navigate("/MyProfil")}
                                    >
                                        👤 Profil
                                    </button>
                                </li>
                                {session?.user?.email && (
                                    <li className="nav-item">
                                        <span className="nav-link text-white-50">
                                            {session.user.email.split('@')[0]}
                                        </span>
                                    </li>
                                )}
                                <li className="nav-item">
                                    <button className="btn btn-danger btn-sm ms-2" onClick={LogOut}>
                                        Déconnexion
                                    </button>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="nav-item">
                                    <a className="nav-link text-white" href="#features">Fonctionnalités</a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-white" href="#pricing">Tarifs</a>
                                </li>
                                <li className="nav-item">
                                    <button className="btn btn-outline-light ms-2" onClick={() => navigate("/LoginPage")}>
                                        Connexion
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Header;