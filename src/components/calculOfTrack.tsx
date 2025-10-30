import { useEffect} from "react";
import { useMyContext } from "../context/Context";
import { distanceCalculFunction } from "./distanceCalculFunction";
import { valeursTotalsFunction } from "./valeursTotalesFunction";


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
            distance.push(distanceCalculFunction(lat1,lat2,lon1,lon2));
        }

        setAllDistance(distance);

        const { distanceTotal, denivelePositif, deniveleNegatif } = valeursTotalsFunction(distance,elevation);
        setDistanceTotal(distanceTotal);
        setDenivelePositif(denivelePositif);
        setDeniveleNegatif(deniveleNegatif);

    },[xmlDoc]);
    
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