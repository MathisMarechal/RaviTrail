import { useMyContext } from "../context/Context";


function CalculBetweenRavitos () {

    const {ravitos,
        selectedIndex,
        allDistance,
        allEl,
        distanceNextRavitos,
        setDistanceNextRavitos,
        denivelePositifNextRavitos,
        setDenivelePositifNextRavitos,
        deniveleNegatifNextRavitos,
        setDeniveleNegatifNextRavitos,
        setEditMode,
        isMobile,
    } = useMyContext();

    const selectedRavito = ravitos[selectedIndex];
    const selectedNextRavito = ravitos[selectedIndex+1];
    if (!selectedRavito || !selectedNextRavito) return null;

    const kmStart = selectedRavito.distance;
    const kmTarget = selectedNextRavito.distance;

    let distanceCumuleeStart = 0;
    let denivelePositifStart = 0;
    let deniveleNegatifStart = 0;
    let distanceCumuleeTarget = 0;
    let denivelePositifTarget = 0;
    let deniveleNegatifTarget = 0;

    const {moyennePositif,moyenneNegative} = moyenneDesDeniv(allEl)

    function moyenneDesDeniv (elevation:number[]) {
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
    }

    for (let i = 0; i < allDistance.length; i++) {
            if (distanceCumuleeStart >= kmStart) break;

            distanceCumuleeStart += allDistance[i];

            const diff = allEl[i + 1] - allEl[i];
            const test = allEl[i + 2] - allEl[i];
            if (test > moyennePositif) {
                denivelePositifStart += diff;
            }
            if (test<-moyenneNegative) {
                deniveleNegatifStart += Math.abs(diff)
            }
            
        }

        for (let i = 0; i < allDistance.length; i++) {
            if (distanceCumuleeTarget >= kmTarget) break;

            distanceCumuleeTarget += allDistance[i];
            const test = allEl[i + 2] - allEl[i];

            const diff = allEl[i + 1] - allEl[i];
            if (test > moyennePositif) {
                denivelePositifTarget += diff;
            }
            if (test < -moyenneNegative) {
                deniveleNegatifTarget += Math.abs(diff);
            }
        }

        setDistanceNextRavitos(distanceCumuleeTarget - distanceCumuleeStart);
        setDenivelePositifNextRavitos(denivelePositifTarget - denivelePositifStart);
        setDeniveleNegatifNextRavitos(deniveleNegatifTarget - deniveleNegatifStart);


    return (<div>
            {ravitos.length !== 0 && ravitos[selectedIndex].temps === 0 &&
            <div className="card p-3 m-2 border">
                 <div className="d-flex justify-content-around mb-0">
                        <p className="mb-0">{isMobile? `Distance: ${distanceNextRavitos.toFixed(0)} km` : `Distance prochain ravitaillement: ${distanceNextRavitos.toFixed(0)} km` }</p>
                        <p className="mb-0">{isMobile? `D+ : ${denivelePositifNextRavitos.toFixed(0)} m` : `Dénivelé postif jusqu'au prochain ravitaillement: ${denivelePositifNextRavitos.toFixed(0)} m`}</p>
                        <p className="mb-0">{isMobile? `D- : ${deniveleNegatifNextRavitos.toFixed(0)} m ` : `Dénivelé négatif jusqu'au prochain ravitaillement: ${deniveleNegatifNextRavitos.toFixed(0)} m `}</p>
                 </div>
            </div>
            }
            {ravitos.length !==0 && ravitos[selectedIndex].temps !== 0 &&
            <div className="card p-3 m-2 border">
                <div className="d-flex justify-content-around mb-0">
                        <p className="mb-0">{isMobile? `Distance: ${distanceNextRavitos.toFixed(0)} km` : `Distance prochain ravitaillement: ${distanceNextRavitos.toFixed(0)} km` }</p>
                        <p className="mb-0">{isMobile? `D+ : ${denivelePositifNextRavitos.toFixed(0)} m` : `Dénivelé postif jusqu'au prochain ravitaillement: ${denivelePositifNextRavitos.toFixed(0)} m`}</p>
                        <p className="mb-0">{isMobile? `D- : ${deniveleNegatifNextRavitos.toFixed(0)} m ` : `Dénivelé négatif jusqu'au prochain ravitaillement: ${deniveleNegatifNextRavitos.toFixed(0)} m `}</p>
                        <p className="mb-0" style={{ cursor: "pointer" }} onClick={() => setEditMode(true)}>{isMobile? `Temps: ${ravitos[selectedIndex].temps}h`: `Temps estimé jusqu'au prochain ravitaillement: ${ravitos[selectedIndex].temps}h`}</p>
                 </div>
            </div>
            }
        </div>
    )
  }

export default CalculBetweenRavitos;

