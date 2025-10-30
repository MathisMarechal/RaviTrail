import type { ListItems } from "../../types";
import { addNewItemsFunction } from "./addNewItemsFunction";

export function handleSubmitNewItemsFunction(e: React.FormEvent,nameNewItems:string,proNewItems: number,gluNewItems:number,setListNewItems:Function,listNewItems:ListItems[],setNameNewItems:Function,setProNewItems:Function,setGluNewItems:Function) {
    e.preventDefault();
    console.log(nameNewItems,proNewItems,gluNewItems);
    addNewItemsFunction(nameNewItems,Number(proNewItems),Number(gluNewItems),setListNewItems,listNewItems);

    return(
        setNameNewItems(""),
        setProNewItems(""),
        setGluNewItems("")
    )
}