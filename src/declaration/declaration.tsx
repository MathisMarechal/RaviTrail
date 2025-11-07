import { useState,useEffect } from "react";
import type { Ravitaillment,Profil,SavedProject,ListItems } from "../types";

export function Declaration () {
    // États pour le profil utilisateur
    const [consGluH, setConGluH] = useState<number | "">("");
    const [consProtH, setConProtH] = useState<number | "">("");
    const [profilName, setProfilName] = useState<string>("");
    const [myProfil, setMyProfil] = useState<Profil | null>(null);
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [email,setEmail] = useState<string>("");
    const [password,setPassword] = useState<string>("");
    const [session,setSession] = useState<any>(null);

    // États pour le projet en cours d'édition
    const [nameRun, setNameRun] = useState<string | null>(null);
    const [xmlDoc, setXmlDoc] = useState<Document | null>(null);
    const [name, setName] = useState<string>("");
    const [kilometre, setKilometre] = useState<number | "">("");
    const [ravitos, setRavitos] = useState<Ravitaillment[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);

    // États pour les items
    const [nameItems, setNameItems] = useState<string>("");
    const [protItems, setProtItems] = useState<number | "">("");
    const [gluItems, setGluItems] = useState<number | "">("");
    const [quantityItems, setQuantityItems] = useState<number | "">("");
    const [nameNewItems,setNameNewItems] = useState<string>("")
    const [proNewItems, setProNewItems] = useState<number | "">("");
    const [gluNewItems, setGluNewItems] = useState<number | "">("");
    const [listNewItems, setListNewItems] = useState<ListItems[]>([]);

    // États pour les calculs GPX
    const [, setAllLat] = useState<number[]>([]);
    const [, setAllLon] = useState<number[]>([]);
    const [allEl, setAllEl] = useState<number[]>([]);
    const [allDistance, setAllDistance] = useState<number[]>([]);
    const [distanceTotal, setDistanceTotal] = useState<number>(0);
    const [denivelePositif, setDenivelePositif] = useState<number>(0);
    const [deniveleNegatif, setDeniveleNegatif] = useState<number>(0);

    // États pour les calculs entre ravitaillements
    const [distanceNextRavitos, setDistanceNextRavitos] = useState<number>(0);
    const [denivelePositifNextRavitos, setDenivelePositifNextRavitos] = useState<number>(0);
    const [deniveleNegatifNextRavitos, setDeniveleNegatifNextRavitos] = useState<number>(0);

    // États pour l'estimation de temps
    const [tempsEstime, setTempsEstime] = useState<number | "">("");
    const [editMode, setEditMode] = useState<boolean>(false);

    // États pour la gestion des projets sauvegardés
    const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
    const [currentProject, setCurrentProject] = useState<SavedProject | null>(null);

    // États pour la gestion d'affichage

    const [isMobile,setIsMobile] = useState(window.innerWidth <=500);

    useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 500);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
    
    return({
        consGluH, setConGluH,
        consProtH, setConProtH,
        profilName, setProfilName,
        myProfil, setMyProfil,
        isSignUp, setIsSignUp,
        email, setEmail,
        password, setPassword,
        session, setSession,
        nameRun, setNameRun,
        xmlDoc, setXmlDoc,
        name, setName,
        kilometre, setKilometre,
        ravitos, setRavitos,
        selectedIndex, setSelectedIndex,
        savedProjects, setSavedProjects,
        currentProject, setCurrentProject,
        nameItems, setNameItems,
        protItems, setProtItems,
        gluItems, setGluItems,
        quantityItems, setQuantityItems,
        nameNewItems, setNameNewItems,
        proNewItems, setProNewItems,
        gluNewItems, setGluNewItems,
        listNewItems, setListNewItems,
        setAllLat,
        setAllLon,
        allEl, setAllEl,
        allDistance, setAllDistance,
        distanceTotal, setDistanceTotal,
        denivelePositif, setDenivelePositif,
        deniveleNegatif, setDeniveleNegatif,
            distanceNextRavitos, setDistanceNextRavitos,
        denivelePositifNextRavitos, setDenivelePositifNextRavitos,
        deniveleNegatifNextRavitos, setDeniveleNegatifNextRavitos,
        tempsEstime, setTempsEstime,
        editMode, setEditMode,
        isMobile,
        }
    )
}
    