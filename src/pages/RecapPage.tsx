import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { updateRavitaillementItem } from "../supabase-client";
import Header from "../components/Header";
import type { Items } from "../types";

type EditingCell = {
    ravitoIndex: number;
    itemIndex: number;
    item: Items;
    field: 'name' | 'proteine' | 'glucide' | 'quantity' | 'status';
    value: string | number;
};

function Recap() {
    const {
        ravitos,
        setRavitos,
    } = useMyContext();

    const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
    const [editValue, setEditValue] = useState<string | number>("");
    
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [filterRavito, setFilterRavito] = useState<string>("");
    const navigate = useNavigate();

    const openEditCell = (ravitoIndex: number, itemIndex: number, item: Items, field: EditingCell['field']) => {
        const value = item[field];
        setEditingCell({ ravitoIndex, itemIndex, item, field, value });
        setEditValue(value);
    };

    const handleSaveCell = async (valueToSave?: string | number) => {
        if (!editingCell) return;

        const finalValue = valueToSave !== undefined ? valueToSave : editValue;

        try {
            await updateRavitaillementItem(editingCell.item.id!, {
                [editingCell.field]: editingCell.field === 'name' || editingCell.field === 'status' 
                    ? finalValue 
                    : Number(finalValue)
            });

            const updatedRavitos = [...ravitos];
            updatedRavitos[editingCell.ravitoIndex].items[editingCell.itemIndex] = {
                ...updatedRavitos[editingCell.ravitoIndex].items[editingCell.itemIndex],
                [editingCell.field]: editingCell.field === 'name' || editingCell.field === 'status' 
                    ? finalValue 
                    : Number(finalValue)
            };
            setRavitos(updatedRavitos);

            console.log('✓ Cellule mise à jour avec succès');
            setEditingCell(null);
        } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la sauvegarde');
        }
    };

    const handleStatusChange = async (status: string) => {
        await handleSaveCell(status);
    };

    const filteredData = ravitos.flatMap((ravito, ravitoIndex) =>
        ravito.items
            .filter(item => {
                const statusMatch = !filterStatus || item.status === filterStatus;
                const ravitoMatch = !filterRavito || ravito.name.toLowerCase().includes(filterRavito.toLowerCase());
                return statusMatch && ravitoMatch;
            })
            .map((item, itemIndex) => ({
                ravitoIndex,
                itemIndex,
                ravitoName: ravito.name,
                ravitoDistance: ravito.distance,
                item
            }))
    );

    const getFieldLabel = (field: string) => {
        const labels: Record<string, string> = {
            name: "Nom de l'item",
            proteine: "Protéine (g)",
            glucide: "Glucide (g)",
            quantity: "Quantité",
            status: "Statut"
        };
        return labels[field] || field;
    };

    const stats = {
        total: filteredData.length,
        enCours: filteredData.filter(d => d.item.status === 'En cours').length,
        achete: filteredData.filter(d => d.item.status === 'Acheté').length,
        prepare: filteredData.filter(d => d.item.status === 'Préparé').length
    };

    return (
        <>
            <Header isAuthenticated={true} />

            <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#f8f9fa" }}>
                <div className="container">
                    <div className="card border-0 shadow-lg mb-4">
                        <div className="card-header bg-primary text-white py-3">
                            <h3 className="mb-0">📋 Récapitulatif de préparation</h3>
                        </div>
                        <div className="card-body p-4">
                            {/* Stats */}
                            <div className="row mb-4">
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="card bg-light">
                                        <div className="card-body text-center">
                                            <h2 className="mb-0">{stats.total}</h2>
                                            <small className="text-muted">Total items</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="card bg-danger text-white">
                                        <div className="card-body text-center">
                                            <h2 className="mb-0">{stats.enCours}</h2>
                                            <small>En cours</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="card bg-warning text-dark">
                                        <div className="card-body text-center">
                                            <h2 className="mb-0">{stats.achete}</h2>
                                            <small>Acheté</small>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 col-6 mb-3">
                                    <div className="card bg-success text-white">
                                        <div className="card-body text-center">
                                            <h2 className="mb-0">{stats.prepare}</h2>
                                            <small>Préparé</small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filtres */}
                            <div className="row mb-3">
                                <div className="col-md-6 mb-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="🔍 Filtrer par nom de ravitaillement..."
                                        value={filterRavito}
                                        onChange={(e) => setFilterRavito(e.target.value)}
                                    />
                                </div>
                                <div className="col-md-6 mb-2">
                                    <select
                                        className="form-select"
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                    >
                                        <option value="">📊 Tous les statuts</option>
                                        <option value="En cours">🔴 En cours</option>
                                        <option value="Acheté">🟡 Acheté</option>
                                        <option value="Préparé">🟢 Préparé</option>
                                    </select>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered align-middle text-center">
                                    <thead className="table-light">
                                        <tr>
                                            <th scope="col">Ravitaillement</th>
                                            <th scope="col">Distance</th>
                                            <th scope="col">Item</th>
                                            <th scope="col">Protéines</th>
                                            <th scope="col">Glucides</th>
                                            <th scope="col">Quantité</th>
                                            <th scope="col">Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-5">
                                                    <div style={{ fontSize: "3rem" }}>🔍</div>
                                                    <p className="text-muted mb-0">Aucun item à afficher</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredData.map((row, index) => (
                                                <tr key={`${row.ravitoIndex}-${row.itemIndex}-${index}`}>
                                                    <td className="fw-bold">{row.ravitoName}</td>
                                                    <td>{row.ravitoDistance.toFixed(1)} km</td>
                                                    <td 
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'name')}
                                                        className="hover-cell"
                                                    >
                                                        {row.item.name}
                                                    </td>
                                                    <td 
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'proteine')}
                                                        className="hover-cell"
                                                    >
                                                        {row.item.proteine}g
                                                    </td>
                                                    <td 
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'glucide')}
                                                        className="hover-cell"
                                                    >
                                                        {row.item.glucide}g
                                                    </td>
                                                    <td 
                                                        style={{ cursor: "pointer" }}
                                                        onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'quantity')}
                                                        className="hover-cell"
                                                    >
                                                        {row.item.quantity}
                                                    </td>
                                                    <td>
                                                        <span 
                                                            className={`badge ${
                                                                row.item.status === 'En cours' ? 'bg-danger' :
                                                                row.item.status === 'Acheté' ? 'bg-warning text-dark' :
                                                                'bg-success'
                                                            }`}
                                                            style={{ cursor: "pointer" }}
                                                            onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'status')}
                                                        >
                                                            {row.item.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="text-center mt-3">
                                <button 
                                    className="btn btn-primary"
                                    onClick={() => navigate("/EditPage")}
                                >
                                    ← Retour au projet
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal d'édition */}
            {editingCell && (
                <div 
                    className="modal d-flex align-items-center justify-content-center" 
                    tabIndex={-1} 
                    style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}
                    onClick={() => setEditingCell(null)}
                >
                    <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingCell.field === 'status' ? 'Statut de l\'item' : `Éditer ${getFieldLabel(editingCell.field)}`}
                                </h5>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setEditingCell(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                {editingCell.field === 'status' ? (
                                    <p>Mettez à jour le statut de préparation de votre item</p>
                                ) : (
                                    <>
                                        <label className="form-label fw-bold">{getFieldLabel(editingCell.field)}</label>
                                        {editingCell.field === 'name' ? (
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editValue as string}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') handleSaveCell();
                                                }}
                                            />
                                        ) : (
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={editValue as number}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') handleSaveCell();
                                                }}
                                            />
                                        )}
                                    </>
                                )}
                            </div>
                            <div className="modal-footer justify-content-center">
                                {editingCell.field === 'status' ? (
                                    <>
                                        <button 
                                            type="button" 
                                            className="btn btn-danger" 
                                            onClick={() => handleStatusChange("En cours")}
                                        >
                                            En cours
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-warning" 
                                            onClick={() => handleStatusChange("Acheté")}
                                        >
                                            Acheté
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-success" 
                                            onClick={() => handleStatusChange("Préparé")}
                                        >
                                            Préparé
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button 
                                            type="button" 
                                            className="btn btn-secondary" 
                                            onClick={() => setEditingCell(null)}
                                        >
                                            Annuler
                                        </button>
                                        <button 
                                            type="button" 
                                            className="btn btn-primary" 
                                            onClick={() => handleSaveCell()}
                                        >
                                            💾 Sauvegarder
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .hover-cell:hover {
                    background-color: #e9ecef;
                }
            `}</style>
        </>
    );
}

export default Recap;