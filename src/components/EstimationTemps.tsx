import { useEffect, useState } from "react";
import { useMyContext } from "../context/Context";




function EstimationTemps() {

    const {selectedIndex,ravitos,tempsEstime,setTempsEstime,editMode,setEditMode} = useMyContext();

    const [selectedNameNextRavito, setSlectedNameNextRavito] = useState<string>("");

    useEffect(()=>{
        if (selectedIndex === -1) return;
        const selectedNext = ravitos[selectedIndex+1];
        if (selectedNext) {
            setSlectedNameNextRavito(selectedNext.name);
        } else {
            setSlectedNameNextRavito("");
        }
    })

    useEffect(()=> {
        if (selectedIndex===-1) return;
        if (ravitos[selectedIndex].temps === 0) {
            setEditMode(true)
        } else {
            setEditMode(false)
        }
    },[selectedIndex]);


    function handleSubmitTemps (e: React.FormEvent) {
        e.preventDefault();
        if (selectedIndex === -1) return;
        addTemps(Number(tempsEstime));
        setTempsEstime("");
        setEditMode(false);
    }

    function addTemps (tempsEstime:number) {
        const selectedRavito = ravitos[selectedIndex];
        selectedRavito.temps = tempsEstime;
    }


    return (
        <>
        {selectedIndex !== -1 && selectedIndex < ravitos.length - 1 && editMode && (
            <div className="card p-3 m-2 border">
            <form onSubmit={handleSubmitTemps}>
                <p>Temps estimé (h) pour aller à {selectedNameNextRavito}</p>
                <div>
                    <label className="p-2">Temps Estime</label>
                    <input type="number" className="form-control" placeholder="Entrer le temps (en heure) estimé pour aller au prochain ravitaillment" value={tempsEstime} onChange={(e)=> setTempsEstime(e.target.value === "" ? "" : Number(e.target.value))}></input>
                </div>
                <button type="submit" className="btn btn-primary mt-3">Ajouter</button>
            </form>
        </div>
        )
        }
        </>
    )
}

export default EstimationTemps;