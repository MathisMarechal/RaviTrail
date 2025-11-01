import React, { useEffect, useState } from "react";
import CalculBetweenRavitos from "./calculBetweenRavitos";
import EstimationTemps from "./EstimationTemps";
import { useMyContext } from "../context/Context";
import { useAddRavito } from "./AllFunctions/addRavitos";
import { useHandleIndex } from "./AllFunctions/handleIndexFunction";

function EditGpx() {

    const { xmlDoc,
        name,
        setName,
        kilometre,
        setKilometre,
        ravitos,
        setRavitos,
        selectedIndex,
        setSelectedIndex,
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

    const {addRavitoFunction} = useAddRavito();
    const {handleIndexFunction} = useHandleIndex();



    const [selectedName, setSelectedName] = useState<string>("")
    const [selectedButton, setSelectedButton] = useState(false);

    

    function handleNameChange(e:React.ChangeEvent<HTMLInputElement>) {
        setName(e.target.value);
    }

    function handleKilometreChange(e:React.ChangeEvent<HTMLInputElement>) {
        const value = e.target.value
        setKilometre(value === "" ? "" : Number(value));
    }

    function handleSubmit (e: React.FormEvent) {
        e.preventDefault();
        console.log(kilometre,name);
        addRavitoFunction(Number(kilometre),name);
        console.log(ravitos);
        setName("");
        setKilometre("");
    }

    function addItems(ravitosId:number, nameItems:string,protItems:number, gluItems:number, quantityItems:number) {
        const statusInitial = "En cours";
        setRavitos(
            ravitos.map((r) =>
                r.id === ravitosId ? { ...r, items: [...r.items, { id: Date.now(), name: nameItems, proteine: protItems, glucide: gluItems, quantity: quantityItems,status: statusInitial }]} : r
            )
        );
    }

    function handleSubmitItems(e: React.FormEvent) {
        e.preventDefault();
        if (selectedIndex === -1) return;
        const ravitosId = ravitos[selectedIndex].id;
        addItems(ravitosId,nameItems, Number(protItems), Number(gluItems), Number(quantityItems));
        setNameItems("");
        setGluItems("");
        setProtItems("");
        setQuantityItems("");
    }

    const deleteRavito = (e: React.MouseEvent<HTMLButtonElement>, indexToDelete: number) => {
        e.stopPropagation();
        const ravitoToDelete = ravitos[indexToDelete];
        console.log(`Tentative de suppression du ravitaillement: ${ravitoToDelete?.name}`);
        console.log(`Index Ã  supprimer: ${indexToDelete}, Index sÃ©lectionnÃ©: ${selectedIndex}`);
        const confirmDelete = window.confirm(
            `ÃŠtes-vous sÃ»r de vouloir supprimer ce ravitaillement "${ravitoToDelete?.name}" et tous ses items ?`
        );
        if (confirmDelete) {
            console.log(`Suppression confirmÃ©e pour: ${ravitoToDelete?.name}`);
            setRavitos((prev) => prev.filter((_, i) => i !== indexToDelete));
            if (selectedIndex === indexToDelete) {
                console.log("L'élément sélectionné a été supprimé - désélection");
                setSelectedIndex(-1);
                setSelectedName("");
                setNameItems("");
                setProtItems("");
                setGluItems("");
            } else if (selectedIndex > indexToDelete) {
                console.log(`Ajustement de l'index sélectionné: ${selectedIndex} -> ${selectedIndex - 1}`);
                setSelectedIndex(selectedIndex - 1);
            }
             console.log("Suppression terminée");
        }
    };

    const selectButton = () => {
        setSelectedButton(prev => !prev); 
    };

    function autoFillForm (e: React.ChangeEvent<HTMLSelectElement>) {
        const selectedName = e.target.value;
        if (!selectedName) return;

        const selectedItems = listNewItems.find(item => item.name === selectedName)

        if (selectedItems) {
            setNameItems(selectedItems.name);
            setGluItems(selectedItems.glucide);
            setProtItems(selectedItems.proteine);
        }
    }
    
    useEffect(()=> {

        const hasDepart = ravitos.some(ravitos => ravitos.name === "Départ");

        if (!hasDepart) {
            addRavitoFunction(0,"Départ");
        }

        if (distanceTotal===0) return;

        const hasFinish = ravitos.some(ravitos => ravitos.name === "Arrivé");

        if (!hasFinish) {
            addRavitoFunction(parseInt(distanceTotal.toFixed(0)),"Arrivé")
        }
    },[xmlDoc,distanceTotal]);

    

  return (
    <>
    <div>
      {xmlDoc && 
      <div className="card p-3 m-2 border">
        <form onSubmit={handleSubmit}>
            <div className="form-group p-4">
                <div>
                    <label className="p-2">Kilometre</label>
                    <input type="number" className="form-control" placeholder="Entrer le kilomètre du ravitaillment" value={kilometre} onChange={handleKilometreChange}></input>
                </div>
                <div className="mt-1">
                    <label className="p-2">Nom du ravitaillment</label>
                    <input type="text" className="form-control" placeholder="Entrer le nom du ravitaillment" value={name} onChange={handleNameChange}></input>
                </div>
                <button type="submit" className="btn btn-primary mt-3">Ajouter</button>
            </div>
        </form>
        </div>  
      }
    </div>
    


    <div>
        { ravitos.length!==0 &&
        <div className="card p-3 m-2 border">
            <ul className="list-group">
                {ravitos.map((r,index) => (
                    <li  className={selectedIndex===index ? "list-group-item active d-flex justify-content-between align-items-center" : "list-group-item d-flex justify-content-between align-items-center"} key={r.id} onClick={() => handleIndexFunction(index,r.name,setSelectedName)}>
                        {r.distance} km {r.name} <button className="btn btn-secondary btn-sm" onClick={(e) => deleteRavito(e, index)}>Supprimer</button>
                    </li>
                )) }
            </ul>
        </div>
        }
    </div>

    {xmlDoc && 
        <CalculBetweenRavitos />
    }

    {xmlDoc &&
    <EstimationTemps/>}

    <div>
        {selectedIndex !== -1 &&
        <div className="card p-3 m-2 border">
            <form onSubmit={handleSubmitItems}>
                <p>Inventaire de {selectedName}</p>
                <div>
                    <label className="p-2">Nom du produit</label>
                    <button type="button" className={selectedButton ? "btn btn-success m-2" : "btn btn-primary m-2"} style={{fontSize:"0.5em",fontWeight:"bold"}} onClick={selectButton}>Items Enregistré ?</button>
                    {selectedButton &&
                        <select className="form-select" onChange={autoFillForm}>
                            <option selected>Choisisez un items de votre inventaire enregistré</option>
                            {listNewItems.map((r) => (
                                <option  key={r.id}>
                                    {r.name}  
                                </option>
                            )) }
                        </select>
                    }
                    {selectedButton===false &&
                        <input list="listNewItems" type="string" className="form-control" placeholder="Entrer le nom du produit" value={nameItems} onChange={(e)=> setNameItems(e.target.value)}></input>
                    }   
                </div>
                <div>
                    <label className="p-2">Protéine (g)</label>
                    <input id="inputPro" type="number" className="form-control" placeholder="Entrer la quantité de protéine" value={protItems} onChange={(e)=> setProtItems(e.target.value === "" ? "" : Number(e.target.value))}></input>
                </div>
                <div>
                    <label className="p-2">Glucide (g)</label>
                    <input id="inputGlo" type="number" className="form-control" placeholder="Entrer la quantité de glucide" value={gluItems} onChange={(e)=> setGluItems(e.target.value === "" ? "" : Number(e.target.value))}></input>
                </div>
                <div>
                    <label className="p-2">Quantité</label>
                    <input type="number" className="form-control" placeholder="Entrer le nombre de produit" value={quantityItems} onChange={(e)=> setQuantityItems(e.target.value === "" ? "" : Number(e.target.value))}></input>
                </div>
                <button type="submit" className="btn btn-primary mt-3">Ajouter</button>
            </form>
         </div>}
    </div>
    </>
  );
}

export default EditGpx