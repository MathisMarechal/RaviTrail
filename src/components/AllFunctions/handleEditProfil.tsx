import { useMyContext } from "../../context/Context";

export function useHandleEditProfil() {
    const {setProfilName,setConGluH,setConProtH,profilName,consGluH,consProtH} = useMyContext();

    function handleEditProfilFunction (e:React.MouseEvent,setEditedProfil:Function) {
        e.preventDefault();
        return (
            setProfilName(profilName),
            setConGluH(consGluH),
            setConProtH(consProtH),
            setEditedProfil(false)
        );
    }

    return {handleEditProfilFunction}
}
