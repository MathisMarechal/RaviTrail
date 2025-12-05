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

export interface Profil {
    id: number;
    name: string;
    consGlu: number | "";
    consProt: number | "";
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
}

export interface ListItems {
    id: number;
    name: string;
    proteine: number;
    glucide: number;
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