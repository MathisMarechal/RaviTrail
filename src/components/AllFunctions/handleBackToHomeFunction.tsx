import { useMyContext } from "../../context/Context";


export const handleBackToHomeFunction = (isUpdated:boolean,navigate:Function) => {

    const {xmlDoc, ravitos} = useMyContext();

    return () => {
        if (!isUpdated && (xmlDoc || ravitos.length > 0)) {
            if (window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous quitter sans sauvegarder ?")) {
            navigate('/');
        }
        } else {
            navigate('/');
        }
    }

};