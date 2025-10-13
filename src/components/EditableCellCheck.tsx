import { useEffect, useState} from "react";

type Props = {
    getValue: () => any;
    row: any;
    column: any;
    table: any;
}

const EditableCellCheck = ({getValue, row, column, table}:Props) => {
    const initialValue = getValue();
    const [value,setValue] = useState(initialValue);
    const [openedWindow,setOpenedWindow] = useState(false);

    const onBlur = () => {
        table.option.meta?.updateData(
            row.index,
            column.id,
            value
        )
    };

    const updateValueState = (updatedValue:string) => {
        setValue(updatedValue);
        setOpenedWindow(false);
    };

    useEffect(()=>{
        setValue(initialValue)
    },[initialValue])

  return (
    <>
    <div style={{ cursor: "pointer" }} onClick={()=> setOpenedWindow(true)}>{value}</div>
    {openedWindow &&
        <div className="modal d-flex align-items-center" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Statue de l'item</h5>
                    <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" onClick={()=> setOpenedWindow(false)}></button>
                </div>
                <div className="modal-body">
                    <p>Mettez à jour le statue de préparation de votre item</p>
                </div>
                <div className="modal-footer justify-content-center">
                    <button type="button" className="btn btn-danger" onBlur={onBlur} onClick={()=>updateValueState("En cours")}>En cours</button>
                    <button type="button" className="btn btn-warning" onBlur={onBlur} onClick={()=>updateValueState("Acheté")}>Acheté</button>
                    <button type="button" className="btn btn-success" onBlur={onBlur} onClick={()=>updateValueState("Préparé")}>Préparé</button>
                </div>
                </div>
            </div>
        </div>
    }
    </>
  )
}

export default EditableCellCheck
