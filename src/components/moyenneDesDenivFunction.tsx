 export function moyenneDesDenivFunction (elevation:number[]) {
    const denivPo = [];
    const denivNe = [];
    for (let i=0; i<elevation.length-1;i++) {
        const diff = elevation[i + 1] - elevation[i];
        if (diff>0) {
            denivPo.push(diff);
        } else if (diff<0) {
            denivNe.push(Math.abs(diff));
        }
    };
    const moyennePositif = denivPo.reduce((acc,denivPo)=>acc+denivPo,0)/denivPo.length
    const moyenneNegative = denivNe.reduce((acc,denivNe)=>acc+denivNe,0)/denivNe.length
    return { moyennePositif, moyenneNegative }
};