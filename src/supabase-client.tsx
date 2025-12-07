import {createClient} from "@supabase/supabase-js";
import type { 
    SavedProject, 
    Ravitaillment, 
    Items,
    ListItems,
    DBProject,
    DBRavitaillement,
    DBRavitaillementItem,
    DBItemMaster
} from './types';


// DEBUG - Afficher les variables
console.log('=== DEBUG SUPABASE ===');
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log('Toutes les env:', import.meta.env);
console.log('=====================');

// Vérifier si les variables existent
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  console.error('❌ VITE_SUPABASE_URL est manquante !');
}
if (!supabaseKey) {
  console.error('❌ VITE_SUPABASE_ANON_KEY est manquante !');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || ''
);



export interface ProjectData {
    id?: number;
    name: string | undefined;
    name_run: string | null;
    distance_total: number;
    denivele_positif: number;
    denivele_negatif: number;
    xml_doc: string;
}

// ==================== PROJETS ====================

export const fetchProjects = async (): Promise<SavedProject[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            console.log("Aucun utilisateur connecté");
            return [];
        }

        const { data: projects, error: projectsError } = await supabase
            .from('projects')
            .select('*')
            .eq('user_id',user.id)
            .order('updated_at', { ascending: false });

        if (projectsError) throw projectsError;

        const projectsWithRavitos = await Promise.all(
            projects.map(async (project: DBProject) => {
                const { data: ravitos, error: ravitosError } = await supabase
                    .from('ravitaillements')
                    .select('*')
                    .eq('project_id', project.id)
                    .order('distance', { ascending: true });

                if (ravitosError) throw ravitosError;

                // Récupérer les items pour chaque ravitaillement
                const ravitosWithItems = await Promise.all(
                    (ravitos || []).map(async (ravito: DBRavitaillement) => {
                        const { data: items, error: itemsError } = await supabase
                            .from('ravitaillement_items')
                            .select('*')
                            .eq('ravitaillement_id', ravito.id);

                        if (itemsError) throw itemsError;

                        return {
                            id: ravito.id,
                            name: ravito.name,
                            distance: ravito.distance,
                            temps: ravito.temps,
                            items: items.map((item: DBRavitaillementItem) => ({
                                id: item.id,
                                name: item.name,
                                proteine: item.proteine,
                                glucide: item.glucide,
                                quantity: item.quantity,
                                status: item.status
                            }))
                        };
                    })
                );

                return {
                    id: project.id,
                    name: project.name,
                    nameRun: project.name_run,
                    distanceTotal: project.distance_total,
                    denivelePositif: project.denivele_positif,
                    deniveleNegatif: project.denivele_negatif,
                    ravitos: ravitosWithItems,
                    xmlDoc: project.xml_doc,
                    createdAt: new Date(project.created_at),
                    updatedAt: new Date(project.updated_at)
                };
            })
        );

        return projectsWithRavitos;
    } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        throw error;
    }
};

export const createProject = async (
    projectData: ProjectData, 
    ravitos: Ravitaillment[]
): Promise<SavedProject> => {
    try {
        // Insérer le projet
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .insert({
                name: projectData.name,
                name_run: projectData.name_run,
                distance_total: projectData.distance_total,
                denivele_positif: projectData.denivele_positif,
                denivele_negatif: projectData.denivele_negatif,
                xml_doc: projectData.xml_doc
            })
            .select()
            .single();

        if (projectError) throw projectError;

        // Insérer les ravitaillements avec leurs items
        const savedRavitos = await insertRavitaillementsWithItems(project.id, ravitos);

        return {
            id: project.id,
            name: project.name,
            nameRun: project.name_run,
            distanceTotal: project.distance_total,
            denivelePositif: project.denivele_positif,
            deniveleNegatif: project.denivele_negatif,
            ravitos: savedRavitos,
            xmlDoc: project.xml_doc,
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at)
        };
    } catch (error) {
        console.error('Erreur lors de la création du projet:', error);
        throw error;
    }
};

export const updateProject = async (
    projectId: number, 
    projectData: ProjectData, 
    ravitos: Ravitaillment[]
): Promise<SavedProject> => {
    try {
        // Mettre à jour le projet
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .update({
                name: projectData.name,
                name_run: projectData.name_run,
                distance_total: projectData.distance_total,
                denivele_positif: projectData.denivele_positif,
                denivele_negatif: projectData.denivele_negatif,
                xml_doc: projectData.xml_doc,
                updated_at: new Date().toISOString()
            })
            .eq('id', projectId)
            .select()
            .single();

        if (projectError) throw projectError;

        // Supprimer les anciens ravitaillements (cascade supprimera les items)
        const { error: deleteError } = await supabase
            .from('ravitaillements')
            .delete()
            .eq('project_id', projectId);

        if (deleteError) throw deleteError;

        // Insérer les nouveaux ravitaillements avec leurs items
        const savedRavitos = await insertRavitaillementsWithItems(projectId, ravitos);

        return {
            id: project.id,
            name: project.name,
            nameRun: project.name_run,
            distanceTotal: project.distance_total,
            denivelePositif: project.denivele_positif,
            deniveleNegatif: project.denivele_negatif,
            ravitos: savedRavitos,
            xmlDoc: project.xml_doc,
            createdAt: new Date(project.created_at),
            updatedAt: new Date(project.updated_at)
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour du projet:', error);
        throw error;
    }
};

export const deleteProject = async (projectId: number): Promise<void> => {
    try {
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', projectId);

        if (error) throw error;
    } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error);
        throw error;
    }
};

// ==================== RAVITAILLEMENTS ====================

const insertRavitaillementsWithItems = async (
    projectId: number, 
    ravitos: Ravitaillment[]
): Promise<Ravitaillment[]> => {
    if (ravitos.length === 0) return [];

    const ravitosData = ravitos.map(r => ({
        project_id: projectId,
        name: r.name,
        distance: r.distance,
        temps: r.temps
    }));

    const { data: insertedRavitos, error: ravitosError } = await supabase
        .from('ravitaillements')
        .insert(ravitosData)
        .select();

    if (ravitosError) throw ravitosError;

    // Insérer les items pour chaque ravitaillement
    const savedRavitos = await Promise.all(
        insertedRavitos.map(async (dbRavito: DBRavitaillement, index: number) => {
            const originalRavito = ravitos[index];
            
            if (originalRavito.items && originalRavito.items.length > 0) {
                const itemsData = originalRavito.items.map(item => ({
                    ravitaillement_id: dbRavito.id,
                    name: item.name,
                    proteine: item.proteine,
                    glucide: item.glucide,
                    quantity: item.quantity,
                    status: item.status
                }));

                const { data: insertedItems, error: itemsError } = await supabase
                    .from('ravitaillement_items')
                    .insert(itemsData)
                    .select();

                if (itemsError) throw itemsError;

                return {
                    id: dbRavito.id,
                    name: dbRavito.name,
                    distance: dbRavito.distance,
                    temps: dbRavito.temps,
                    items: insertedItems.map((item: DBRavitaillementItem) => ({
                        id: item.id,
                        name: item.name,
                        proteine: item.proteine,
                        glucide: item.glucide,
                        quantity: item.quantity,
                        status: item.status
                    }))
                };
            }

            return {
                id: dbRavito.id,
                name: dbRavito.name,
                distance: dbRavito.distance,
                temps: dbRavito.temps,
                items: []
            };
        })
    );

    return savedRavitos;
};

// ==================== ITEMS MASTER (CATALOGUE) ====================

export const fetchItemsMaster = async (): Promise<ListItems[]> => {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.log("Aucun utilisateur connecté");
            return [];
        }

        const { data, error } = await supabase
            .from('items_master')
            .select('*')
            .eq('user_id',user.id)
            .order('name', { ascending: true });

        if (error) throw error;

        return data.map((item: DBItemMaster) => ({
            id: item.id,
            name: item.name,
            proteine: item.proteine,
            glucide: item.glucide
        }));
    } catch (error) {
        console.error('Erreur lors du chargement des items master:', error);
        throw error;
    }
};

export const createItemMaster = async (
    name: string, 
    proteine: number, 
    glucide: number
): Promise<ListItems> => {
    try {
        const { data, error } = await supabase
            .from('items_master')
            .insert({
                name,
                proteine,
                glucide
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            proteine: data.proteine,
            glucide: data.glucide
        };
    } catch (error) {
        console.error('Erreur lors de la création de l\'item master:', error);
        throw error;
    }
};

export const updateItemMaster = async (
    id: number,
    name: string, 
    proteine: number, 
    glucide: number
): Promise<ListItems> => {
    try {
        const { data, error } = await supabase
            .from('items_master')
            .update({
                name,
                proteine,
                glucide
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            proteine: data.proteine,
            glucide: data.glucide
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'item master:', error);
        throw error;
    }
};

export const deleteItemMaster = async (id: number): Promise<void> => {
    try {
        const { error } = await supabase
            .from('items_master')
            .delete()
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'item master:', error);
        throw error;
    }
};

// ==================== ITEMS DANS RAVITAILLEMENTS ====================

/**
 * Ajouter un item à un ravitaillement (sauvegarde immédiate)
 */
export const addItemToRavitaillement = async (
    ravitaillementId: number,
    name: string,
    proteine: number,
    glucide: number,
    quantity: number,
    status: string = "En cours"
): Promise<Items> => {
    try {
        const { data, error } = await supabase
            .from('ravitaillement_items')
            .insert({
                ravitaillement_id: ravitaillementId,
                name,
                proteine,
                glucide,
                quantity,
                status
            })
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            proteine: data.proteine,
            glucide: data.glucide,
            quantity: data.quantity,
            status: data.status
        };
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'item:', error);
        throw error;
    }
};

/**
 * Mettre à jour un item d'un ravitaillement
 */
export const updateRavitaillementItem = async (
    itemId: number,
    updates: Partial<{
        name: string;
        proteine: number;
        glucide: number;
        quantity: number;
        status: string;
    }>
): Promise<Items> => {
    try {
        const { data, error } = await supabase
            .from('ravitaillement_items')
            .update(updates)
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;

        return {
            id: data.id,
            name: data.name,
            proteine: data.proteine,
            glucide: data.glucide,
            quantity: data.quantity,
            status: data.status
        };
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'item:', error);
        throw error;
    }
};

/**
 * Supprimer un item d'un ravitaillement
 */
export const deleteRavitaillementItem = async (itemId: number): Promise<void> => {
    try {
        const { error } = await supabase
            .from('ravitaillement_items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'item:', error);
        throw error;
    }
};

// ==================== AUTO-SAVE ====================

let saveTimeout: NodeJS.Timeout | null = null;

export const autoSaveProject = (
    projectId: number | null,
    projectData: ProjectData,
    ravitos: Ravitaillment[],
    onSaveComplete?: (project: SavedProject) => void,
    delay: number = 2000
) => {
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(async () => {
        try {
            let savedProject;
            if (projectId) {
                savedProject = await updateProject(projectId, projectData, ravitos);
            } else {
                savedProject = await createProject(projectData, ravitos);
            }
            
            if (onSaveComplete) {
                onSaveComplete(savedProject);
            }
            
            console.log('✓ Sauvegarde automatique réussie');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde automatique:', error);
        }
    }, delay);
};

export const forceSaveProject = async (
    projectId: number | null,
    projectData: ProjectData,
    ravitos: Ravitaillment[],
    onSaveComplete?: (project: SavedProject) => void,
) => {
    try {
        let savedProject;
        if (projectId) {
            savedProject = await updateProject(projectId, projectData, ravitos);
        } else {
            savedProject = await createProject(projectData,ravitos);
        }

        if (onSaveComplete) {
            onSaveComplete(savedProject);
        }

        console.log('✓ Sauvegarde forcé réussie');
    } catch (error) {
        console.error('Erreur lors de la suavegarde forcé: ', error);
    }
}