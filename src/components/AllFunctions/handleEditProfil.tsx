import { useMyContext } from "../../context/Context";

export function handleEditProfilFunction (e:React.MouseEvent,setEditedProfil:Function) {
    const {setProfilName,setConGluH,setConProtH,profilName,consGluH,consProtH} = useMyContext();
    e.preventDefault();
    return (
        setEditedProfil(false),
        setProfilName(profilName),
        setConGluH(consGluH),
        setConProtH(consProtH)
    );
}