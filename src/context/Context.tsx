import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import { Declaration } from "../declaration/declaration";
import { supabase } from "../supabase-client";
import type { UserPlan } from "../types";

type ContextType = ReturnType<typeof Declaration> & {
    userPlan: UserPlan;
    refreshUserPlan: () => Promise<void>;
};

const Context = createContext<ContextType | undefined>(undefined);

export function ContextProvider({children}:{children:ReactNode}) {
    const declarationValues = Declaration();
    const { session, myProfil, setMyProfil } = declarationValues;
    
    const [userPlan, setUserPlan] = useState<UserPlan>('free');

    // Fonction pour rafraîchir le plan utilisateur
    const refreshUserPlan = async () => {
        if (!session?.user?.email) {
            setUserPlan('free');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('myProfil')
                .select('plan')
                .eq('email', session.user.email)
                .single();

            if (error) {
                console.error('Erreur lors de la récupération du plan:', error);
                setUserPlan('free');
                return;
            }

            const plan = (data?.plan as UserPlan) || 'free';
            setUserPlan(plan);

            // Mettre à jour myProfil si nécessaire
            if (myProfil && myProfil.plan !== plan) {
                setMyProfil({ ...myProfil, plan });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération du plan:', error);
            setUserPlan('free');
        }
    };

    // Charger le plan au montage et quand la session change
    useEffect(() => {
        refreshUserPlan();
    }, [session?.user?.email]);

    // Mettre à jour le plan quand myProfil change
    useEffect(() => {
        if (myProfil?.plan) {
            setUserPlan(myProfil.plan);
        }
    }, [myProfil?.plan]);

    return (
        <Context.Provider value={{
            ...declarationValues,
            userPlan,
            refreshUserPlan
        }}>
            {children}
        </Context.Provider>
    );
}

export function useMyContext() {
    const myContext = useContext(Context);
    if (!myContext) {
        throw new Error("useMyContext doit être utilisé avec un ContextProvider")
    }
    return myContext;
}