import { useState } from "react";
import { supabase } from "../supabase-client";
import type { SavedProject } from "../types";

interface ShareProjectProps {
    project: SavedProject;
    ownerEmail: string;
}

function ShareProject({ project, ownerEmail }: ShareProjectProps) {
    const [showModal, setShowModal] = useState(false);
    const [shareEmail, setShareEmail] = useState("");
    const [isSharing, setIsSharing] = useState(false);
    const [shares, setShares] = useState<Array<{ email: string; access: string }>>([]);

    const loadShares = async () => {
        try {
            const { data, error } = await supabase
                .from('project_shares')
                .select('shared_with_email, access_level')
                .eq('project_id', project.id)
                .eq('owner_email', ownerEmail);

            if (error) throw error;

            setShares(data.map(s => ({ email: s.shared_with_email, access: s.access_level })));
        } catch (error) {
            console.error('Erreur lors du chargement des partages:', error);
        }
    };

    const handleShare = async () => {
        if (!shareEmail || !shareEmail.includes('@')) {
            alert('Veuillez entrer une adresse email valide');
            return;
        }

        if (shareEmail === ownerEmail) {
            alert('Vous ne pouvez pas partager avec vous-même');
            return;
        }

        setIsSharing(true);

        try {
            const { error } = await supabase
                .from('project_shares')
                .insert({
                    project_id: project.id,
                    owner_email: ownerEmail,
                    shared_with_email: shareEmail,
                    access_level: 'view'
                });

            if (error) {
                if (error.code === '23505') { // Duplicate key
                    alert('Ce projet est déjà partagé avec cet utilisateur');
                } else {
                    throw error;
                }
            } else {
                alert(`✓ Projet partagé avec ${shareEmail}`);
                setShareEmail("");
                await loadShares();
            }
        } catch (error: any) {
            console.error('Erreur lors du partage:', error);
            alert('❌ Erreur lors du partage du projet');
        } finally {
            setIsSharing(false);
        }
    };

    const handleRemoveShare = async (email: string) => {
        if (!confirm(`Retirer l'accès à ${email} ?`)) return;

        try {
            const { error } = await supabase
                .from('project_shares')
                .delete()
                .eq('project_id', project.id)
                .eq('shared_with_email', email);

            if (error) throw error;

            alert(`✓ Accès retiré pour ${email}`);
            await loadShares();
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('❌ Erreur lors de la suppression du partage');
        }
    };

    const openModal = async () => {
        setShowModal(true);
        await loadShares();
    };

    return (
        <>
            <button
                className="btn btn-info text-white"
                onClick={openModal}
            >
                🔗 Partager
            </button>

            {showModal && (
                <div
                    className="modal d-flex align-items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    🔗 Partager "{project.name}"
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label fw-bold">
                                        Partager avec un utilisateur
                                    </label>
                                    <div className="input-group">
                                        <input
                                            type="email"
                                            className="form-control"
                                            placeholder="email@example.com"
                                            value={shareEmail}
                                            onChange={(e) => setShareEmail(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') handleShare();
                                            }}
                                        />
                                        <button
                                            className="btn btn-primary"
                                            onClick={handleShare}
                                            disabled={isSharing}
                                        >
                                            {isSharing ? (
                                                <span className="spinner-border spinner-border-sm"></span>
                                            ) : (
                                                'Partager'
                                            )}
                                        </button>
                                    </div>
                                    <small className="text-muted">
                                        L'utilisateur pourra consulter ce projet (lecture seule)
                                    </small>
                                </div>

                                {shares.length > 0 && (
                                    <div>
                                        <h6 className="fw-bold">Partagé avec :</h6>
                                        <ul className="list-group">
                                            {shares.map((share, idx) => (
                                                <li
                                                    key={idx}
                                                    className="list-group-item d-flex justify-content-between align-items-center"
                                                >
                                                    <span>
                                                        <i className="bi bi-person-check me-2"></i>
                                                        {share.email}
                                                        <span className="badge bg-secondary ms-2">
                                                            {share.access === 'view' ? 'Lecture' : 'Édition'}
                                                        </span>
                                                    </span>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => handleRemoveShare(share.email)}
                                                    >
                                                        Retirer
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {shares.length === 0 && (
                                    <p className="text-muted text-center">
                                        Ce projet n'est partagé avec personne pour le moment
                                    </p>
                                )}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    Fermer
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ShareProject;