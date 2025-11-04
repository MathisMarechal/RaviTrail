import { useMyContext } from "../../context/Context";

export function useAutoFillForm () {
    const {setNameItems,setGluItems,setProtItems,listNewItems} = useMyContext();

    function autoFillFormFunction (e: React.ChangeEvent<HTMLSelectElement>) {
        const selectedName = e.target.value;
        if (!selectedName) return;

        const selectedItems = listNewItems.find(item => item.name === selectedName)

        if (selectedItems) {
            setNameItems(selectedItems.name);
            setGluItems(selectedItems.glucide);
            setProtItems(selectedItems.proteine);
        }
    }
    return {autoFillFormFunction}
}