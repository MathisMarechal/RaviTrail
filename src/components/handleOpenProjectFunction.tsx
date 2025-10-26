import { useMyContext } from "../context/Context";
import type { SavedProject } from "../types";

export const handleOpenProjectFunction = (navigate:Function) => {

    const {setCurrentProject} = useMyContext(); 

    return (project:SavedProject) => {
        setCurrentProject(project);
        navigate("/EditPage");
    }
}