import { createContext, type ReactNode, useContext } from "react";
import { Declaration } from "../declaration/declaration";


type ContextType = ReturnType<typeof Declaration>;

const Context = createContext<ContextType | undefined>(undefined);

export function ContextProvider({children}:{children:ReactNode}) {
    const {
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
        projectName, setProjectName,
        distanceNextRavitos, setDistanceNextRavitos,
        denivelePositifNextRavitos, setDenivelePositifNextRavitos,
        deniveleNegatifNextRavitos, setDeniveleNegatifNextRavitos,
        tempsEstime, setTempsEstime,
        editMode, setEditMode,
        isMobile
    } = Declaration();

    return (
        <Context.Provider value={{
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
            projectName, setProjectName,
            distanceNextRavitos, setDistanceNextRavitos,
            denivelePositifNextRavitos, setDenivelePositifNextRavitos,
            deniveleNegatifNextRavitos, setDeniveleNegatifNextRavitos,
            tempsEstime, setTempsEstime,
            editMode, setEditMode,
            isMobile
            }}
        >
            {children}
        </Context.Provider>
    );
}

export function useMyContext() {
    const myContext = useContext(Context);
    if (!myContext) {
        throw new Error ("useMyContext doit être utilisé avec un ContextProvider")
    }
    console.log("Contexte :", myContext);
    return myContext
}