import { useMyContext } from "../../context/Context";
import type { Profil } from "../../types";

export function handleSubmitProfilFunction (e:React.FormEvent,setEditedProfil:Function) {
    const {setMyProfil,profilName,consGluH,consProtH} = useMyContext();
    e.preventDefault();
    const newProfil: Profil = {
        id: Date.now(),
        name: profilName,
        consGlu: consGluH,
        consProt: consProtH
    };
    return (
        setMyProfil(newProfil),
        setEditedProfil(true)
    )
    

}