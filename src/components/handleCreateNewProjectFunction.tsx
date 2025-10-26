import { useMyContext } from "../context/Context";

export const handleCreateNewProjetcFunction = (navigate:Function) => {

    const {savedProjects,setCurrentProject} = useMyContext();

    return () => {
        if (savedProjects.length <= 2) {
            setCurrentProject(null);    
            navigate("/EditPage");
        } else {
            window.confirm("Vous n'avez le droit qu'à 3 projets ravitaillment maximum")
        }
    }
}