import { supabase } from "../../supabase-client"

export const LogOut = async () => {
    await supabase.auth.signOut();
}