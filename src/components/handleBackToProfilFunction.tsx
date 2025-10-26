export const handleBackToProfilFunction = (isUpdated:boolean,navigate:Function) => {
    return () => {
        if (!isUpdated) {
        if (window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous quitter sans sauvegarder ?")) {
            navigate("/MyProfil");
        }
        } else {
        navigate("/MyProfil")
        }
    }
};