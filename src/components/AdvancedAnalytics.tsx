import { useState } from "react";
import type { SavedProject } from "../types";
import { useMyContext } from "../context/Context";

interface AdvancedAnalyticsProps {
    project: SavedProject;
}

function AdvancedAnalytics({ project }: AdvancedAnalyticsProps) {
    const { myProfil } = useMyContext();
    const [showModal, setShowModal] = useState(false);

    // Calculs d'analyses avancées
    const totalProteine = project.ravitos.reduce((sum, ravito) =>
        sum + ravito.items.reduce((itemSum, item) => itemSum + (item.proteine * item.quantity), 0), 0
    );

    const totalGlucide = project.ravitos.reduce((sum, ravito) =>
        sum + ravito.items.reduce((itemSum, item) => itemSum + (item.glucide * item.quantity), 0), 0
    );

    const totalItems = project.ravitos.reduce((sum, ravito) =>
        sum + ravito.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );

    const totalTemps = project.ravitos.reduce((sum, ravito) => sum + ravito.temps, 0);

    const besoinsProteine = (myProfil?.consProt || 5) * totalTemps;
    const besoinsGlucide = (myProfil?.consGlu || 40) * totalTemps;

    const ecartProteine = totalProteine - besoinsProteine;
    const ecartGlucide = totalGlucide - besoinsGlucide;

    const tauxCouvertureProteine = besoinsProteine > 0 ? (totalProteine / besoinsProteine * 100) : 0;
    const tauxCouvertureGlucide = besoinsGlucide > 0 ? (totalGlucide / besoinsGlucide * 100) : 0;

    // Analyse par ravitaillement
    const ravitoAnalytics = project.ravitos.map(ravito => {
        const proteineRavito = ravito.items.reduce((sum, item) => sum + (item.proteine * item.quantity), 0);
        const glucideRavito = ravito.items.reduce((sum, item) => sum + (item.glucide * item.quantity), 0);
        const besoinsProteineRavito = (myProfil?.consProt || 5) * ravito.temps;
        const besoinsGlucideRavito = (myProfil?.consGlu || 40) * ravito.temps;

        return {
            name: ravito.name,
            distance: ravito.distance,
            temps: ravito.temps,
            proteine: proteineRavito,
            glucide: glucideRavito,
            besoinsProteine: besoinsProteineRavito,
            besoinsGlucide: besoinsGlucideRavito,
            tauxCouvertureProteine: besoinsProteineRavito > 0 ? (proteineRavito / besoinsProteineRavito * 100) : 0,
            tauxCouvertureGlucide: besoinsGlucideRavito > 0 ? (glucideRavito / besoinsGlucideRavito * 100) : 0
        };
    });

    // Recommandations
    const recommendations = [];
    if (tauxCouvertureProteine < 80) {
        recommendations.push({
            type: 'warning',
            message: `⚠️ Protéines: Vous êtes en dessous de vos besoins (${tauxCouvertureProteine.toFixed(0)}%). Ajoutez ${Math.abs(ecartProteine).toFixed(0)}g de protéines.`
        });
    } else if (tauxCouvertureProteine > 120) {
        recommendations.push({
            type: 'info',
            message: `ℹ️ Protéines: Vous dépassez vos besoins (${tauxCouvertureProteine.toFixed(0)}%). Vous pouvez réduire de ${Math.abs(ecartProteine).toFixed(0)}g.`
        });
    } else {
        recommendations.push({
            type: 'success',
            message: `✅ Protéines: Parfait ! Vos apports sont équilibrés (${tauxCouvertureProteine.toFixed(0)}%).`
        });
    }

    if (tauxCouvertureGlucide < 80) {
        recommendations.push({
            type: 'warning',
            message: `⚠️ Glucides: Vous êtes en dessous de vos besoins (${tauxCouvertureGlucide.toFixed(0)}%). Ajoutez ${Math.abs(ecartGlucide).toFixed(0)}g de glucides.`
        });
    } else if (tauxCouvertureGlucide > 120) {
        recommendations.push({
            type: 'info',
            message: `ℹ️ Glucides: Vous dépassez vos besoins (${tauxCouvertureGlucide.toFixed(0)}%). Vous pouvez réduire de ${Math.abs(ecartGlucide).toFixed(0)}g.`
        });
    } else {
        recommendations.push({
            type: 'success',
            message: `✅ Glucides: Parfait ! Vos apports sont équilibrés (${tauxCouvertureGlucide.toFixed(0)}%).`
        });
    }

    return (
        <>
            <button
                className="btn btn-warning text-dark"
                onClick={() => setShowModal(true)}
            >
                📊 Analyses avancées
            </button>

            {showModal && (
                <div
                    className="modal d-flex align-items-center"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex", overflowY: "auto" }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header bg-warning">
                                <h5 className="modal-title">
                                    📊 Analyses avancées - {project.name}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body" style={{ maxHeight: "70vh", overflowY: "auto" }}>
                                {/* Vue d'ensemble */}
                                <div className="mb-4">
                                    <h6 className="fw-bold border-bottom pb-2">Vue d'ensemble</h6>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="card bg-light">
                                                <div className="card-body">
                                                    <h6 className="text-success">Protéines</h6>
                                                    <p className="mb-1"><strong>Total:</strong> {totalProteine.toFixed(0)}g</p>
                                                    <p className="mb-1"><strong>Besoins:</strong> {besoinsProteine.toFixed(0)}g</p>
                                                    <p className="mb-0">
                                                        <strong>Écart:</strong>{" "}
                                                        <span className={ecartProteine >= 0 ? "text-success" : "text-danger"}>
                                                            {ecartProteine >= 0 ? "+" : ""}{ecartProteine.toFixed(0)}g
                                                        </span>
                                                    </p>
                                                    <div className="progress mt-2">
                                                        <div
                                                            className={`progress-bar ${tauxCouvertureProteine >= 80 && tauxCouvertureProteine <= 120 ? 'bg-success' : tauxCouvertureProteine < 80 ? 'bg-danger' : 'bg-warning'}`}
                                                            style={{ width: `${Math.min(tauxCouvertureProteine, 100)}%` }}
                                                        >
                                                            {tauxCouvertureProteine.toFixed(0)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="card bg-light">
                                                <div className="card-body">
                                                    <h6 className="text-info">Glucides</h6>
                                                    <p className="mb-1"><strong>Total:</strong> {totalGlucide.toFixed(0)}g</p>
                                                    <p className="mb-1"><strong>Besoins:</strong> {besoinsGlucide.toFixed(0)}g</p>
                                                    <p className="mb-0">
                                                        <strong>Écart:</strong>{" "}
                                                        <span className={ecartGlucide >= 0 ? "text-success" : "text-danger"}>
                                                            {ecartGlucide >= 0 ? "+" : ""}{ecartGlucide.toFixed(0)}g
                                                        </span>
                                                    </p>
                                                    <div className="progress mt-2">
                                                        <div
                                                            className={`progress-bar ${tauxCouvertureGlucide >= 80 && tauxCouvertureGlucide <= 120 ? 'bg-success' : tauxCouvertureGlucide < 80 ? 'bg-danger' : 'bg-warning'}`}
                                                            style={{ width: `${Math.min(tauxCouvertureGlucide, 100)}%` }}
                                                        >
                                                            {tauxCouvertureGlucide.toFixed(0)}%
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row mt-2">
                                        <div className="col-md-6">
                                            <p className="mb-0"><strong>Temps total estimé:</strong> {totalTemps.toFixed(1)}h</p>
                                        </div>
                                        <div className="col-md-6">
                                            <p className="mb-0"><strong>Total items:</strong> {totalItems}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recommandations */}
                                <div className="mb-4">
                                    <h6 className="fw-bold border-bottom pb-2">Recommandations</h6>
                                    {recommendations.map((rec, idx) => (
                                        <div
                                            key={idx}
                                            className={`alert alert-${rec.type === 'warning' ? 'warning' : rec.type === 'success' ? 'success' : 'info'}`}
                                        >
                                            {rec.message}
                                        </div>
                                    ))}
                                </div>

                                {/* Analyse par ravitaillement */}
                                <div>
                                    <h6 className="fw-bold border-bottom pb-2">Analyse par ravitaillement</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Ravito</th>
                                                    <th>Distance</th>
                                                    <th>Temps</th>
                                                    <th>Prot. (%)</th>
                                                    <th>Gluc. (%)</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ravitoAnalytics.map((ravito, idx) => (
                                                    <tr key={idx}>
                                                        <td>{ravito.name}</td>
                                                        <td>{ravito.distance}km</td>
                                                        <td>{ravito.temps}h</td>
                                                        <td>
                                                            <span className={ravito.tauxCouvertureProteine >= 80 && ravito.tauxCouvertureProteine <= 120 ? 'text-success' : 'text-warning'}>
                                                                {ravito.tauxCouvertureProteine.toFixed(0)}%
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={ravito.tauxCouvertureGlucide >= 80 && ravito.tauxCouvertureGlucide <= 120 ? 'text-success' : 'text-warning'}>
                                                                {ravito.tauxCouvertureGlucide.toFixed(0)}%
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
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

export default AdvancedAnalytics;