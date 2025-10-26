import { useEffect} from "react";
import { useMyContext } from "../context/Context";


function CalculOfTrack () {

    const {xmlDoc,
        setAllLat,
        setAllLon,
        setAllEl,
        setAllDistance,
        distanceTotal,
        setDistanceTotal,
        denivelePositif,
        setDenivelePositif,
        deniveleNegatif,
        setDeniveleNegatif,
        isMobile
    } = useMyContext();


    useEffect(()=>{
        if (!xmlDoc) return;

        const trkpts = xmlDoc.getElementsByTagName("trkpt");

        const latitude: number[] = [];
        const longetude: number[] = [];
        const elevation: number[] = [];
        const distance: number[] = [];

        for (var i=0; i<trkpts.length; i++) {
            const lat = Number(trkpts[i].getAttribute("lat") || 0);
            const lon = Number(trkpts[i].getAttribute("lon") || 0);
            const eleTag = trkpts[i].getElementsByTagName("ele")[0];
            const el = eleTag ? Number(eleTag.textContent) : 0;

            latitude.push(lat);
            longetude.push(lon);
            elevation.push(el);
        }


        setAllLat(latitude);
        setAllLon(longetude);
        setAllEl(elevation);

        for (var i=0; i<latitude.length-1;i++) {
            const lat1 = latitude[i];
            const lat2 = latitude[i+1];
            const lon1 = longetude[i];
            const lon2 = longetude[i+1];
            distance.push(distanceCalcul(lat1,lat2,lon1,lon2));
        }

        setAllDistance(distance);

        const { distanceTotal, denivelePositif, deniveleNegatif } = valeursTotals(distance,elevation);
        setDistanceTotal(distanceTotal);
        setDenivelePositif(denivelePositif);
        setDeniveleNegatif(deniveleNegatif);

    },[xmlDoc]);


    function distanceCalcul (lat1:number,lat2:number,lon1:number,lon2:number) {
        const r = 6371;
        const p = Math.PI/180;

        const a = 0.5 - Math.cos((lat1-lat2)*p) / 2 + Math.cos(lat1*p) * Math.cos(lat2*p)*(1-Math.cos((lon2-lon1)*p))/2;

        return 2*r*Math.asin(Math.sqrt(a));
    };


    function valeursTotals (distance: number[],elevation:number[]) {
        const distanceTotal = distance.reduce((acc,distance)=>acc+distance,0);

        const {moyennePositif,moyenneNegative} = moyenneDesDeniv(elevation)

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
    };
    
    
    return (
        <>
        <div>
            {xmlDoc && 
                <div className="card p-3 m-2 border flex-container">
                    <div className="d-flex justify-content-around mb-0">
                        <p className="mb-0">{isMobile? `Distance: ${distanceTotal.toFixed(0)} km` : `Distance du parcours: ${distanceTotal.toFixed(0)} km`}</p>
                        <p className="mb-0">{isMobile? `D+ : ${denivelePositif.toFixed(0)} m` : `Dénivelé postif: ${denivelePositif.toFixed(0)} m`}</p>
                        <p className="mb-0">{isMobile? `D- : ${deniveleNegatif.toFixed(0)} m` : `Dénivelé négatif: ${deniveleNegatif.toFixed(0)} m`}</p>
                    </div>
                </div>
            }
        </div>
        </>
    )
}
export default CalculOfTrack;