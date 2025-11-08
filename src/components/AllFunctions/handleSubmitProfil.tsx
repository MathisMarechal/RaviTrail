import { useMyContext } from "../../context/Context";
import { supabase } from "../../supabase-client";
import type { Profil } from "../../types";

export function useHandleSubmitProfil(){
    const {setMyProfil,profilName,consGluH,consProtH,myProfil,session} = useMyContext();

    async function handleSubmitProfilFunction (e:React.FormEvent,setEditedProfil:Function) {
        e.preventDefault();
        
        const newProfil: Profil = {
            id: Date.now(),
            name: profilName,
            consGlu: consGluH,
            consProt: consProtH
        };

        if (!myProfil) {
    
            const {error} = await supabase.from("myProfil").insert({...newProfil,email: session.user.email}).single()
        
            if (error) {
                console.error("Error adding my profil: ",error.message);
            }

            return (
                setMyProfil(newProfil),
                setEditedProfil(true)
            )
        } else {
            const {error} = await supabase.from("myProfil").update(newProfil).eq('id',myProfil.id)

            if (error) {
                console.error("Error adding my profil: ",error.message);
            }

            return (
                setMyProfil(newProfil),
                setEditedProfil(true)
            )
        }
        
    }

    return {handleSubmitProfilFunction}
}
