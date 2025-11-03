import { useMyContext } from "../../context/Context";

export function useAddItems() {
    const {setRavitos,ravitos} = useMyContext();

    function addItemsFunction(ravitosId:number, nameItems:string,protItems:number, gluItems:number, quantityItems:number) {
        const statusInitial = "En cours";
        setRavitos(
            ravitos.map((r) =>
                r.id === ravitosId ? { ...r, items: [...r.items, { id: Date.now(), name: nameItems, proteine: protItems, glucide: gluItems, quantity: quantityItems,status: statusInitial }]} : r
            )
        );
    }
    return {addItemsFunction}
}