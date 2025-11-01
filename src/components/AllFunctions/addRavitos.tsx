import type { Ravitaillment } from "../../types";
import { useMyContext } from "../../context/Context";

export function useAddRavito() {
    const {setRavitos,ravitos} = useMyContext();

    function addRavitoFunction(kilometre:number,name:string) {
        const newRavitos: Ravitaillment = {
            id: Date.now(),
            name,
            distance: kilometre,
            items: [],
            temps:0,
        };
        return(setRavitos([...ravitos,newRavitos].sort((firstRavitos,secondRavitos)=>firstRavitos.distance-secondRavitos.distance)));    
    }

    return {addRavitoFunction};
}