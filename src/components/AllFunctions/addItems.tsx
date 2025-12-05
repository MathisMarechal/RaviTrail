import { useMyContext } from "../../context/Context";
import { addItemToRavitaillement } from "../../supabase-client";

export function useAddItems() {
    const { setRavitos, ravitos, currentProject } = useMyContext();

    async function addItemsFunction(
        ravitosId: number, 
        nameItems: string, 
        protItems: number, 
        gluItems: number, 
        quantityItems: number
    ) {
        const statusInitial = "En cours";

        try {
            // Trouver le ravitaillement
            const ravitoIndex = ravitos.findIndex(r => r.id === ravitosId);
            
            if (ravitoIndex === -1) {
                console.error('Ravitaillement non trouvé');
                return;
            }

            const ravito = ravitos[ravitoIndex];

            // Si le projet est sauvegardé ET que le ravito a un vrai ID de base de données
            // (les IDs de Supabase sont des nombres > 1000000000000, les IDs temporaires sont des timestamps)
            const isRavitoSaved = currentProject && ravito.id < 1000000000000;

            if (isRavitoSaved) {
                // Sauvegarde immédiate dans Supabase
                const savedItem = await addItemToRavitaillement(
                    ravito.id,
                    nameItems,
                    protItems,
                    gluItems,
                    quantityItems,
                    statusInitial
                );

                // Mettre à jour le state local avec l'item sauvegardé (qui a un vrai ID)
                setRavitos(
                    ravitos.map((r) =>
                        r.id === ravitosId 
                            ? { ...r, items: [...r.items, savedItem] } 
                            : r
                    )
                );

                console.log('✓ Item ajouté et sauvegardé:', savedItem);
                return savedItem;
            } else {
                // Pour les nouveaux projets ou ravitos non sauvegardés
                // Ajout au state local avec un ID temporaire
                const tempItem = {
                    id: Date.now(), // ID temporaire (timestamp)
                    name: nameItems,
                    proteine: protItems,
                    glucide: gluItems,
                    quantity: quantityItems,
                    status: statusInitial
                };

                setRavitos(
                    ravitos.map((r) =>
                        r.id === ravitosId 
                            ? { ...r, items: [...r.items, tempItem] } 
                            : r
                    )
                );

                console.log('Item ajouté localement (sera sauvegardé avec le projet)');
                return tempItem;
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de l\'item:', error);
            alert('Erreur lors de l\'ajout de l\'item');
            throw error;
        }
    }

    return { addItemsFunction };
}