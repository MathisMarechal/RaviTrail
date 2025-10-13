
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
    items: Items[],
    temps: number;
}

export interface TotalStat {
    id: number;
    totalProteine:[];
    totalGlucide:[];
}

export interface Profil {
    id: number;
    name: string;
    consGlu: number | "";
    consProt: number | "";
}

export interface SavedProject {
    id: number;
    name:string;
    nameRun: string | null;
    distanceTotal: number;
    denivelePositif: number;
    deniveleNegatif: number;
    ravitos:Ravitaillment[];
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