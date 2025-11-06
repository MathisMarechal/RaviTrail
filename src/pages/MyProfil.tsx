import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { useHandleSubmitProfil } from "../components/AllFunctions/handleSubmitProfil";
import { useHandleEditProfil } from "../components/AllFunctions/handleEditProfil";
import { supabase } from "../supabase-client";


function MyProfil () {

    const {consGluH,
        setConGluH,
        consProtH,
        setConProtH,
        profilName,
        setProfilName,
        myProfil,
        setMyProfil
    } = useMyContext();

    const {handleSubmitProfilFunction} = useHandleSubmitProfil();
    const {handleEditProfilFunction} = useHandleEditProfil();

    const navigate = useNavigate();
    const location = useLocation();
    const [editedProfil,setEditedProfil] = useState(false)

    const fetchMyProfil = async () => {
        const {error,data} = await supabase.from("myProfil").select("*").limit(1).single();
        
        if (data) {
            setMyProfil(data)
            setEditedProfil(true)
        } else return

        if (error) {
            console.error("Error load task: ",error.message);
            return;
        }
        
    }

    useEffect(()=>{
        fetchMyProfil()
    },[])

    return(
        <>
        <div className="d-flex justify-content-evenly" style={{paddingBottom:"30px",paddingTop:"30px", backgroundColor:"#0D6EFD",position:"relative", zIndex:1}}>
            <div style={{ cursor: "pointer", textDecoration: location.pathname=== "/" ? "underline" : "none" , color:"white",fontWeight:"bold",textUnderlineOffset:"8px"}} onClick={()=>navigate("/")}>Home</div>
            <div style={{color:"white ",fontWeight:"bold"}}>RaviTrail</div>
            <div style={{cursor:"pointer",textDecoration: location.pathname=== "/MyProfil" ? "underline" : "none" ,color:"white",fontWeight:"bold",textUnderlineOffset:"8px"}} onClick={()=>navigate("/MyProfil")}>Profil</div>
         </div>
        <div className="bannerMyProfil" style={{display:"flex", flexDirection:"column",alignContent:"center",alignItems:"center",justifyContent:"center"}}>
            <h1 style={{marginBottom:"50px",zIndex:1,color:"white",fontStyle:"bold"}}>Mon profil</h1>
            {!editedProfil &&
            <div className="card p-3 m-2 border containerMyProfil">
                <form onSubmit={(e)=>handleSubmitProfilFunction(e,setEditedProfil)}>
                    <div>
                        <label className="p-2">Nom du profil</label>
                        <input type="string" className="form-control" placeholder="Entrer le nom de votre profil" value={profilName} onChange={(e)=>setProfilName(e.target.value)}></input>
                    </div>
                    <div>
                        <label className="p-2">Consommation de glucide par heure</label>
                        <input type="number" className="form-control" placeholder="Entrer la consommation de glucide par heure" value={consGluH} onChange={(e)=>setConGluH(e.target.value=== "" ? "" : Number(e.target.value))}></input>
                    </div>
                    <div>
                        <label className="p-2">Consommation de proteine par heure</label>
                        <input type="number" className="form-control" placeholder="Entrer la consommation de protéine par heure" value={consProtH} onChange={(e)=>setConProtH(e.target.value=== "" ? "" : Number(e.target.value))}></input>
                    </div>
                    <button type="submit" className="btn btn-primary mt-3">Sauvegarder</button>
                </form>
            </div>
            }
            {myProfil && editedProfil  &&
                <div className="card p-3 m-2 border containerMyProfil">
                    <p>{myProfil.name}</p>
                    <p>Consomtion de glucide par heure: {myProfil.consGlu} g/h</p>
                    <p>Consomtion de proteine par heure: {myProfil.consProt} g/h</p>
                    <div style={{display:"flex",justifyContent:"flex-end"}}>
                        <button className="btn btn-secondary" onClick={(e)=>handleEditProfilFunction(e,setEditedProfil)}>Modifier</button>
                    </div>
                </div>
            }
        </div>
        </>
    )
}

export default MyProfil;