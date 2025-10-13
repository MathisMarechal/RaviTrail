import type {Ravitaillment,Items} from "../types";



function Total ({ravitos,selectedIndex}:{ravitos:Ravitaillment[];selectedIndex:number;items: Items[]}) {
    const ravitoSelection = ravitos[selectedIndex];
    const totalGlucide = ravitoSelection.items.reduce(
        (sum, items) => sum + (items.glucide || 0), 0
    );
    const totalProteine = ravitoSelection.items.reduce(
        (sum, items) => sum + (items.proteine || 0), 0
    );
    
    return ( {totalProteine,totalGlucide}
    )
};

export default Total;