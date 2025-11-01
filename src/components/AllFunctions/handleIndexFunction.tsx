import { useMyContext } from "../../context/Context";

export function useHandleIndex() {
    const {setSelectedIndex,ravitos} = useMyContext();

    function handleIndexFunction(index:number, name:string,setSelectedName:Function) {
        setSelectedIndex(index);
        setSelectedName(name);

        const selectedRavito = ravitos[index];
        console.log(`Ravitaillement sélectionné: ${selectedRavito.name}`);
        console.log(`Nombre d'items: ${selectedRavito.items.length}`);
        console.log(`Est vide: ${selectedRavito.items.length === 0}`);
        console.log(`Items:`, selectedRavito.items);
    }
    return {handleIndexFunction};
}