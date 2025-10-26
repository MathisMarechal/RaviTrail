import { FileUploader } from "react-drag-drop-files";
import { useMyContext } from "../context/Context";



const fileType = ["GPX","gpx"];



function DragAndDrop () {

  const { setXmlDoc, xmlDoc, nameRun, setNameRun } = useMyContext();

  const handleChange = (file: any) => {
    const reader = new FileReader();

    reader.onload = (e) => {
        const text = e.target?.result as string;

        const parser = new DOMParser();
        const xml = parser.parseFromString(text,"application/xml");

        if (xml.getElementsByTagName("parsererror").length>0){
            console.error("Erreur du parser");
            return;
        }
        setXmlDoc(xml);
        console.log("Fichier chargé:",xml);

        const nameOfTrack = xml.getElementsByTagName("metadata")[0]?.getElementsByTagName("name")[0];
        if (nameOfTrack && nameOfTrack.textContent) {
          setNameRun(nameOfTrack.textContent);
        } else {
          const trkName = xml.getElementsByTagName("trkpt")[0]?.getElementsByTagName("name")[0];
          if (trkName && trkName.textContent) {
            setNameRun(trkName.textContent);
          }
        }
    };
    reader.readAsText(file);


 };
 return (
  <>
  { !xmlDoc && 
  <div className="card p-4 m-2 border">
      <FileUploader
        handleChange={handleChange}
        name="file"
        types={fileType}
        classes=" container border border-primary p-10 rounded bg-light text-center w-100"
      /> 
    </div>
    }

  {xmlDoc && nameRun && 
    <div className="card p-4 m-2 border">
      <h1 className="text-center p-3 m-0">{nameRun}</h1>
    </div> 
  }
  </>
  );
}

export default DragAndDrop;