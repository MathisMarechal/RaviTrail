import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { updateRavitaillementItem } from "../supabase-client";
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
    const location = useLocation();

    const openEditCell = (ravitoIndex: number, itemIndex: number, item: Items, field: EditingCell['field']) => {
        const value = item[field];
        setEditingCell({ ravitoIndex, itemIndex, item, field, value });
        setEditValue(value);
    };

    const handleSaveCell = async (valueToSave?: string | number) => {
        if (!editingCell) return;

        const finalValue = valueToSave !== undefined ? valueToSave : editValue;

        try {
            // 1. Mettre à jour en base de données
            await updateRavitaillementItem(editingCell.item.id!, {
                [editingCell.field]: editingCell.field === 'name' || editingCell.field === 'status' 
                    ? finalValue 
                    : Number(finalValue)
            });

            // 2. Mettre à jour le contexte
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

    // Filtrer les données
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

    return (
        <>
            <div className="d-flex justify-content-evenly" style={{ 
                paddingBottom: "30px", 
                paddingTop: "30px", 
                backgroundColor: "#0D6EFD", 
                position: "relative", 
                zIndex: 1 
            }}>
                <div 
                    style={{ 
                        cursor: "pointer", 
                        textDecoration: location.pathname === "/EditPage" ? "underline" : "none", 
                        color: "white", 
                        fontWeight: "bold" 
                    }} 
                    onClick={() => navigate("/EditPage")}
                >
                    Ravitaillement
                </div>
                <div style={{ color: "white", fontWeight: "bold" }}>RaviTrail</div>
                <div 
                    style={{ 
                        cursor: "pointer", 
                        textDecoration: location.pathname === "/MyProfil" ? "underline" : "none", 
                        color: "white", 
                        fontWeight: "bold" 
                    }} 
                    onClick={() => navigate("/MyProfil")}
                >
                    Profil
                </div>
            </div>

            <div style={{ marginTop: "10px", marginLeft: "10px" }}>
                {/* Filtres */}
                <div className="row mb-3" style={{ marginRight: "10px" }}>
                    <div className="col-md-6">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Filtrer par nom de ravitaillement..."
                            value={filterRavito}
                            onChange={(e) => setFilterRavito(e.target.value)}
                        />
                    </div>
                    <div className="col-md-6">
                        <select
                            className="form-select"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="">Tous les statuts</option>
                            <option value="En cours">En cours</option>
                            <option value="Acheté">Acheté</option>
                            <option value="Préparé">Préparé</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div>
                    <table className="table table-striped table-hover table-bordered align-middle text-center shadow-sm rounded">
                        <thead>
                            <tr>
                                <th scope="col">Nom</th>
                                <th scope="col">Distance</th>
                                <th scope="col">Nom de l'item</th>
                                <th scope="col">Proteine</th>
                                <th scope="col">Glucide</th>
                                <th scope="col">Quantité</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan={7}>Aucun item à afficher</td>
                                </tr>
                            ) : (
                                filteredData.map((row, index) => (
                                    <tr className="tr" key={`${row.ravitoIndex}-${row.itemIndex}-${index}`}>
                                        <td scope="row">{row.ravitoName}</td>
                                        <td scope="row">{row.ravitoDistance.toFixed(2)}</td>
                                        <td 
                                            scope="row"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'name')}
                                        >
                                            {row.item.name}
                                        </td>
                                        <td 
                                            scope="row"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'proteine')}
                                        >
                                            {row.item.proteine}
                                        </td>
                                        <td 
                                            scope="row"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'glucide')}
                                        >
                                            {row.item.glucide}
                                        </td>
                                        <td 
                                            scope="row"
                                            style={{ cursor: "pointer" }}
                                            onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'quantity')}
                                        >
                                            {row.item.quantity}
                                        </td>
                                        <td scope="row">
                                            <div 
                                                style={{ cursor: "pointer" }} 
                                                onClick={() => openEditCell(row.ravitoIndex, row.itemIndex, row.item, 'status')}
                                            >
                                                {row.item.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal d'édition d'une cellule */}
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
        </>
    );
}

export default Recap;