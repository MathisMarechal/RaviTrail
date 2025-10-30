import type { ListItems } from "../../types";

export function addNewItemsFunction(nameNewItems:string, proNewItems:number, gluNewItems:number,setListNewItems:Function,listNewItems:ListItems[]) {
    const newItems: ListItems = {
        id: Date.now(),
        name: nameNewItems,
        proteine: proNewItems,
        glucide: gluNewItems,
    };

    return(setListNewItems([...listNewItems,newItems]))
}