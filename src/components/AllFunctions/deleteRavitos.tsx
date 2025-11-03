import { useMyContext } from "../../context/Context";

export function useDeleteRavito () {
    const {setRavitos,selectedIndex,ravitos,setSelectedIndex,setNameItems,setProtItems,setGluItems}=useMyContext();

    function deleteRavitoFunction(e: React.MouseEvent<HTMLButtonElement>, indexToDelete: number,setSelectedName:Function ) {
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
    }
    return {deleteRavitoFunction}
};