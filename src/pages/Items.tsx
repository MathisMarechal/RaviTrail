import type { ListItems } from "../types"
import React, {useState,useEffect} from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CellContext } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import { handleSubmitNewItemsFunction } from "../components/AllFunctions/handleSubmitNewItemsFunction";


const columnHelper = createColumnHelper<ListItems>();

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    editedRows?: Record<string, boolean>;
    setEditedRows?: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
    updateData: (rowIndex: number, columnId: string, value: string | number) => void;
    revertData: (rowIndex: number, revert: boolean) => void;
    deleteRow: (rowIndex: number) => void;
  }
}


interface ColumnMetaType {
  type?: string;
  option?:Option[];
}

type Option = {
  label: string;
  value: string;
};

const TableCell = ({getValue, row, column, table}: CellContext<ListItems, unknown>) => {
  const initialValue = getValue() as string | number;
  const [value,setValue] = useState<string | number>(initialValue);
  const tableMeta = table.options.meta;
  const columnMeta = column.columnDef.meta as ColumnMetaType | undefined;

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const onBlur = () => {
    table.options.meta?.updateData(row.index,column.id,value)
  }

  const onSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue(e.target.value);
    tableMeta?.updateData(row.index, column.id, e.target.value);
  };

  const isEdited = tableMeta?.editedRows?.[row.id] ?? false;  

  if (isEdited) {
    return columnMeta?.type === "select" ? (
    <select onChange={onSelectChange} value={initialValue}>
      {columnMeta?.option?.map((option: Option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  ) : (
    <input className="form-control"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      type={columnMeta?.type || "text"}
    />
  )
  }

  return <span>{value}</span>;
}

const EditCell = ({ row, table }: CellContext<ListItems, unknown>) => {
  const meta = table.options.meta;

  const toggleEditedRow = (e: React.MouseEvent<HTMLButtonElement>) => {
    const elName = e.currentTarget.name
    meta?.setEditedRows?.((old) => ({
      ...old,
      [row.id]: !old[row.id],
    }));
    if (elName !== "edit") {
      meta?.revertData(row.index, e.currentTarget.name === "cancel")
    }
  };

  const toggleDeleteRow = (_:React.MouseEvent<HTMLButtonElement>) => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer cet item "${row.original.name}" ?`
    );
    
    if (confirmDelete) {
      meta?.deleteRow(row.index);
    }
  }

  const isEdited = meta?.editedRows?.[row.id] ?? false;

  return isEdited ? (
    <>
      <button className="btn btn-secondary me-2" onClick={toggleEditedRow} name="cancel">
        Annuler
      </button>
      <button className="btn btn-primary" onClick={toggleEditedRow}>
        Valider
      </button>
    </>
  ) : (
    <>
      <button className="btn btn-primary me-2" onClick={toggleEditedRow}>
        Editer
      </button>
      <button className="btn btn-danger" onClick={toggleDeleteRow}>
        Supprimer
      </button>
    </>
  );
};

const columns = [
    columnHelper.accessor("name",{
        header: "Nom du produit",
        cell: TableCell,
        meta: {
          type: "text",
        } as ColumnMetaType
    }),
    columnHelper.accessor("proteine",{
        header: "Quantité de proteine (g)",
        cell: TableCell,
        meta: {
          type: "number",
        } as ColumnMetaType
    }),
    columnHelper.accessor("glucide",{
        header: "Quantité de glucide (g)",
        cell: TableCell,
        meta: {
          type: "number",
        } as ColumnMetaType
    }),
    columnHelper.display({
    id: "edit",
    header: "Actions",
    cell: EditCell,
  }),
];



function Items () {
  const {nameNewItems,setNameNewItems,proNewItems,setProNewItems,gluNewItems,setGluNewItems,listNewItems,setListNewItems} = useMyContext();

    const [originalData, setOriginalData] = useState<ListItems[]>([]);
    const [data, setData] = useState<ListItems[]>([]);
    const [editedRows,setEditedRows] = useState<Record<string, boolean>>({});
    const navigate = useNavigate();
    const location = useLocation();
    
    useEffect(() => {
        setData(listNewItems);
        setOriginalData([...listNewItems]);
    }, [listNewItems]);

    const table = useReactTable<ListItems>({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
            meta: {
              editedRows,
              setEditedRows,
              revertData: (rowIndex: number, revert: boolean) => {
                if (revert) {
                  setData((old) =>
                    old.map((row, index) =>
                      index === rowIndex ? originalData[rowIndex] : row
                    )
                  );
                } else {
                  setOriginalData((old) =>
                    old.map((row, index) => (index === rowIndex ? data[rowIndex] : row))
                  );
                }
              },
              updateData: (rowIndex: number, columnId: string, value: string | number) => {
                setData((old)=> 
                  old.map((row,index)=>{
                    if (index===rowIndex) {
                      return {
                        ...old[rowIndex],
                        [columnId]: value,
                      };
                    }
                    return row;
                  })
                );
                setListNewItems((old) =>
                    old.map((row, index) =>
                        index === rowIndex ? { ...row, [columnId]: value } : row
                    )
                );
              },

              deleteRow: (rowIndex: number) => {
                setData((old) => old.filter((_, index) => index !== rowIndex));
                setOriginalData((old) => old.filter((_, index) => index !== rowIndex));
                setListNewItems((old) => old.filter((_, index) => index !== rowIndex));
                
                
                setEditedRows((old) => {
                  const newEditedRows = { ...old };
                  delete newEditedRows[rowIndex.toString()];
                  return newEditedRows;
                });
              },
            },
        });

    useEffect(()=>{
    const savedItems = localStorage.getItem("items");
        if (savedItems) {
            const parsed = JSON.parse(savedItems);
            setListNewItems(parsed);
            setData(parsed);
            setOriginalData(parsed);
        }
    },[])

    useEffect(() => {
        localStorage.setItem("items", JSON.stringify(listNewItems));
    }, [listNewItems]);

    return (
        <>
        <div className="d-flex justify-content-evenly" style={{paddingBottom:"30px",paddingTop:"30px", backgroundColor:"#0D6EFD",position:"relative", zIndex:1}}>
            <div style={{ cursor: "pointer", textDecoration: location.pathname=== "/" ? "underline" : "none" , color:"white",fontWeight:"bold"}} onClick={()=>navigate("/")}>Home</div>
            <div style={{color:"white ",fontWeight:"bold"}}>RaviTrail</div>
            <div style={{cursor:"pointer",textDecoration: location.pathname=== "/MyProfil" ? "underline" : "none" ,color:"white",fontWeight:"bold"}} onClick={()=>navigate("/MyProfil")}>Profil</div>
        </div>
        <div className="bannerMyProfil">
            <h1 style={{marginBottom:"50px",zIndex:1,color:"white",fontStyle:"bold"}}>Mes items</h1>
            <div style={{display:"flex", flexDirection:"column",alignContent:"center",alignItems:"center",justifyContent:"center"}}>
                <div className="card p-3 m-2 border" style={{width:"70%"}}>
                    <form onSubmit={(e)=>handleSubmitNewItemsFunction(e,nameNewItems,Number(proNewItems),Number(gluNewItems),setListNewItems,listNewItems,setNameNewItems,setProNewItems,setGluNewItems)}>
                        <p>Nouvelle item</p>
                        <div>
                            <label className="p-2">Nom du produit</label>
                            <input type="string" className="form-control" placeholder="Entrer le nom du produit" value={nameNewItems} onChange={(e)=>setNameNewItems(e.target.value)}></input>
                        </div>
                        <div>
                            <label className="p-2">Quantité de protéine</label>
                            <input type="string" className="form-control" placeholder="Entrer la quantité de protéine" value={proNewItems} onChange={(e)=>setProNewItems(e.target.value === "" ? "" : Number(e.target.value))}></input>
                        </div>
                        <div>
                            <label className="p-2">Quantité de glucide</label>
                            <input type="string" className="form-control" placeholder="Entrer la quantité de glucide" value={gluNewItems} onChange={(e)=>setGluNewItems(e.target.value === "" ? "" : Number(e.target.value))}></input>
                        </div>
                        <button type="submit" className="btn btn-primary mt-3">Ajouter</button>
                    </form>
                </div>
            </div>
            {data.length>0 &&
            <div style={{display:"flex", flexDirection:"column",alignContent:"center",alignItems:"center",justifyContent:"center"}}>
                <div className="card p-3 m-2 border" style={{width:"70%"}}>
                <h5 className="mb-3">
                Liste des items enregistré
                </h5>
                <p className="text-muted small mb-3">
                {data.length} produit(s)
                </p>
                <table className="table table-striped table-hover table-bordered align-middle text-center shadow-sm rounded">
                    <thead className="table">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th scope="col" key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="table-group-divider">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="px-4 py-2">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table> 
                </div>
            </div>}
        </div>
    </>
    )
}

export default Items