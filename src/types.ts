export interface Items {
    id: number;
    name: string;
    proteine: number;
    glucide: number;
    quantity: number;
    status: string;
}

export interface Ravitaillment {
    id: number;
    name: string;
    distance: number;
    temps: number;
    items: Items[];
}

export interface TotalStat {
    id: number;
    totalProteine: [];
    totalGlucide: [];
}

export type UserPlan = 'free' | 'premium';

export interface Profil {
    id: number;
    name: string;
    consGlu: number | "";
    consProt: number | "";
    plan?: UserPlan; // Ajout du plan
}

export interface SavedProject {
    id: number;
    name: string;
    nameRun: string | null;
    distanceTotal: number;
    denivelePositif: number;
    deniveleNegatif: number;
    ravitos: Ravitaillment[];
    xmlDoc: string;
    createdAt: Date;
    updatedAt: Date;
    isShared?: boolean; // Pour les projets partagés
    sharedBy?: string; // Email du propriétaire si partagé
}

export interface ListItems {
    id: number;
    name: string;
    proteine: number;
    glucide: number;
}

export interface ProjectShare {
    id: number;
    project_id: number;
    owner_email: string;
    shared_with_email: string;
    access_level: 'view' | 'edit';
    created_at: string;
}

// Types pour la base de données
export interface DBProject {
    id: number;
    name: string;
    name_run: string | null;
    distance_total: number;
    denivele_positif: number;
    denivele_negatif: number;
    xml_doc: string;
    created_at: string;
    updated_at: string;
}

export interface DBRavitaillement {
    id: number;
    project_id: number;
    name: string;
    distance: number;
    temps: number;
    created_at: string;
    updated_at: string;
}

export interface DBRavitaillementItem {
    id: number;
    ravitaillement_id: number;
    name: string;
    proteine: number;
    glucide: number;
    quantity: number;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface DBItemMaster {
    id: number;
    name: string;
    proteine: number;
    glucide: number;
    created_at: string;
    updated_at: string;
}

// Limites des plans
export const PLAN_LIMITS = {
    free: {
        maxProjects: 1,
        features: {
            gpxImport: true,
            customItems: true,
            basicNutrition: true,
            advancedAnalytics: false,
            pdfExport: false,
            projectSharing: false
        }
    },
    premium: {
        maxProjects: Infinity,
        features: {
            gpxImport: true,
            customItems: true,
            basicNutrition: true,
            advancedAnalytics: true,
            pdfExport: true,
            projectSharing: true
        }
    }
} as const;