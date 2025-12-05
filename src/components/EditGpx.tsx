import React, { useEffect, useState } from "react";
import CalculBetweenRavitos from "./calculBetweenRavitos";
import EstimationTemps from "./EstimationTemps";
import { useMyContext } from "../context/Context";
import { useAddRavito } from "./AllFunctions/addRavitos";
import { useHandleIndex } from "./AllFunctions/handleIndexFunction";
import { useAddItems } from "./AllFunctions/addItems";
import { useDeleteRavito } from "./AllFunctions/deleteRavitos";
import { useAutoFillForm } from "./AllFunctions/autoFillForm";

function EditGpx() {
    const { 
        xmlDoc,
        name,
        setName,
        kilometre,
        setKilometre,
        ravitos,
        selectedIndex,
        nameItems,
        setNameItems,
        protItems,
        setProtItems,
        gluItems,
        setGluItems, 
        quantityItems,
        setQuantityItems,
        distanceTotal,
        listNewItems,
    } = useMyContext();

    const { addRavitoFunction } = useAddRavito();
    const { handleIndexFunction } = useHandleIndex();
    const { addItemsFunction } = useAddItems();
    const { deleteRavitoFunction } = useDeleteRavito();
    const { autoFillFormFunction } = useAutoFillForm();

    const [selectedName, setSelectedName] = useState<string>("")
    const [selectedButton, setSelectedButton] = useState(false);
    const [isAddingItem, setIsAddingItem] = useState(false);

    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        setName(e.target.value);
    }

    function handleKilometreChange(e: React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setKilometre(value === "" ? "" : Number(value));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log(kilometre, name);
        addRavitoFunction(Number(kilometre), name);
        console.log(ravitos);
        setName("");
        setKilometre("");
    }

    async function handleSubmitItems(e: React.FormEvent) {
        e.preventDefault();
        
        if (selectedIndex === -1) return;
        if (!nameItems || protItems === "" || gluItems === "" || quantityItems === "") {
            alert("Veuillez remplir tous les champs");
            return;
        }

        setIsAddingItem(true);

        try {
            const ravitosId = ravitos[selectedIndex].id;
            await addItemsFunction(
                ravitosId, 
                nameItems, 
                Number(protItems), 
                Number(gluItems), 
                Number(quantityItems)
            );

            // Réinitialiser le formulaire
            setNameItems("");
            setGluItems("");
            setProtItems("");
            setQuantityItems("");
            setSelectedButton(false);
        } catch (error) {
            console.error('Erreur lors de l\'ajout:', error);
        } finally {
            setIsAddingItem(false);
        }
    }

    const selectButton = () => {
        setSelectedButton(prev => !prev); 
    };

    useEffect(() => {
        const hasDepart = ravitos.some(ravitos => ravitos.name === "Départ");

        if (!hasDepart) {
            addRavitoFunction(0, "Départ");
        }

        if (distanceTotal === 0) return;

        const hasFinish = ravitos.some(ravitos => ravitos.name === "Arrivé");

        if (!hasFinish) {
            addRavitoFunction(parseInt(distanceTotal.toFixed(0)), "Arrivé")
        }
    }, [xmlDoc, distanceTotal]);

    return (
        <>
            <div>
                {xmlDoc && 
                    <div className="card p-3 m-2 border">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group p-4">
                                <div>
                                    <label className="p-2">Kilometre</label>
                                    <input 
                                        type="number" 
                                        className="form-control" 
                                        placeholder="Entrer le kilomètre du ravitaillement" 
                                        value={kilometre} 
                                        onChange={handleKilometreChange}
                                    />
                                </div>
                                <div className="mt-1">
                                    <label className="p-2">Nom du ravitaillement</label>
                                    <input 
                                        type="text" 
                                        className="form-control" 
                                        placeholder="Entrer le nom du ravitaillement" 
                                        value={name} 
                                        onChange={handleNameChange}
                                    />
                                </div>
                                <button type="submit" className="btn btn-primary mt-3">Ajouter</button>
                            </div>
                        </form>
                    </div>  
                }
            </div>

            <div>
                {ravitos.length !== 0 &&
                    <div className="card p-3 m-2 border">
                        <ul className="list-group">
                            {ravitos.map((r, index) => (
                                <li 
                                    className={selectedIndex === index ? "list-group-item active d-flex justify-content-between align-items-center" : "list-group-item d-flex justify-content-between align-items-center"} 
                                    key={r.id} 
                                    onClick={() => handleIndexFunction(index, r.name, setSelectedName)}
                                >
                                    {r.distance} km {r.name} 
                                    <button 
                                        className="btn btn-secondary btn-sm" 
                                        onClick={(e) => deleteRavitoFunction(e, index, setSelectedName)}
                                    >
                                        Supprimer
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                }
            </div>

            {xmlDoc && <CalculBetweenRavitos />}

            {xmlDoc && <EstimationTemps />}

            <div>
                {selectedIndex !== -1 &&
                    <div className="card p-3 m-2 border">
                        <form onSubmit={handleSubmitItems}>
                            <p>Inventaire de {selectedName}</p>
                            <div>
                                <label className="p-2">Nom du produit</label>
                                <button 
                                    type="button" 
                                    className={selectedButton ? "btn btn-success m-2" : "btn btn-primary m-2"} 
                                    style={{ fontSize: "0.5em", fontWeight: "bold" }} 
                                    onClick={selectButton}
                                >
                                    Items Enregistré ?
                                </button>
                                {selectedButton &&
                                    <select className="form-select" onChange={autoFillFormFunction}>
                                        <option selected>Choisissez un items de votre inventaire enregistré</option>
                                        {listNewItems.map((r) => (
                                            <option key={r.id}>
                                                {r.name}  
                                            </option>
                                        ))}
                                    </select>
                                }
                                {selectedButton === false &&
                                    <input 
                                        list="listNewItems" 
                                        type="string" 
                                        className="form-control" 
                                        placeholder="Entrer le nom du produit" 
                                        value={nameItems} 
                                        onChange={(e) => setNameItems(e.target.value)}
                                    />
                                }   
                            </div>
                            <div>
                                <label className="p-2">Protéine (g)</label>
                                <input 
                                    id="inputPro" 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Entrer la quantité de protéine" 
                                    value={protItems} 
                                    onChange={(e) => setProtItems(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="p-2">Glucide (g)</label>
                                <input 
                                    id="inputGlo" 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Entrer la quantité de glucide" 
                                    value={gluItems} 
                                    onChange={(e) => setGluItems(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>
                            <div>
                                <label className="p-2">Quantité</label>
                                <input 
                                    type="number" 
                                    className="form-control" 
                                    placeholder="Entrer le nombre de produit" 
                                    value={quantityItems} 
                                    onChange={(e) => setQuantityItems(e.target.value === "" ? "" : Number(e.target.value))}
                                />
                            </div>
                            <button 
                                type="submit" 
                                className="btn btn-primary mt-3"
                                disabled={isAddingItem}
                            >
                                {isAddingItem ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                        Ajout en cours...
                                    </>
                                ) : (
                                    'Ajouter'
                                )}
                            </button>
                        </form>
                    </div>
                }
            </div>
        </>
    );
}

export default EditGpx