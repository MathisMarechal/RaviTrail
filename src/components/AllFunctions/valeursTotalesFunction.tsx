import { moyenneDesDenivFunction } from "./moyenneDesDenivFunction";

export function valeursTotalsFunction (distance: number[],elevation:number[]) {
    const distanceTotal = distance.reduce((acc,distance)=>acc+distance,0);

    const {moyennePositif,moyenneNegative} = moyenneDesDenivFunction(elevation)

    console.log(moyennePositif);
    console.log(moyenneNegative)

    let denivelePositif = 0;
    let deniveleNegatif = 0;
    for (let i=0; i<elevation.length;i++) {
        const diff = elevation[i + 1] - elevation[i];
        const test = elevation[i + 2] - elevation[i];
        if (test>moyennePositif) {
            denivelePositif += diff;
        } 
        if (test<-moyenneNegative) {
            deniveleNegatif += Math.abs(diff)
        };
    };
    return {distanceTotal, denivelePositif, deniveleNegatif}
};