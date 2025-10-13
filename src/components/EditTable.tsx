import type {Ravitaillment, Items} from "../types";
import { createColumnHelper } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import type { CellContext } from "@tanstack/react-table";
import type { Profil } from "../types";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";



const columnHelper = createColumnHelper<Items>();

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

const TableCell = ({getValue, row, column, table}: CellContext<Items, unknown>) => {
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

const EditCell = ({ row, table }: CellContext<Items, unknown>) => {
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
    columnHelper.accessor("quantity",{
        header: "Nombre de produit",
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

type Props = {
    ravitos: Ravitaillment[],
    selectedIndex: number;
    setRavitos: React.Dispatch<React.SetStateAction<Ravitaillment[]>>;
    myProfil:Profil | null;
};

const EditTable=({ ravitos, selectedIndex, setRavitos,myProfil }: Props) => {

    if (selectedIndex === -1 || selectedIndex >= ravitos.length || !ravitos[selectedIndex]) {
        return <div></div>;
    }

    const selectedItems =
    selectedIndex !== -1 ? ravitos[selectedIndex]?.items ?? [] : [];
    const [originalData, setOriginalData] = useState(() => [...selectedItems]);
    const [data, setData] = useState<Items[]>(selectedItems);
    const [editedRows,setEditedRows] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setData(selectedItems);
        setOriginalData([...selectedItems]);
    }, [ravitos, selectedIndex]); 

    const table = useReactTable<Items>({
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
            if (selectedIndex !== -1) {
              setRavitos((prev) =>
                prev.map((r, i) =>
                 i === selectedIndex
                   ? {
                      ...r,
                      items: r.items.map((item, idx) =>
                        idx === rowIndex ? { ...item, [columnId]: value } : item
                    ),
                  }
                : r
            )
          );
        }
          },
          deleteRow: (rowIndex: number) => {
            setData((old) => old.filter((_, index) => index !== rowIndex));
            setOriginalData((old) => old.filter((_, index) => index !== rowIndex));
            
            if (selectedIndex !== -1) {
              setRavitos((prev) =>
                prev.map((r, i) =>
                  i === selectedIndex
                    ? {
                        ...r,
                        items: r.items.filter((_, idx) => idx !== rowIndex)
                      }
                    : r
                )
              );
            }
            
            setEditedRows((old) => {
              const newEditedRows = { ...old };
              delete newEditedRows[rowIndex.toString()];
              return newEditedRows;
            });
          },
        },
    });


    return data.length > 0 ? (
      <div className="card p-3 m-2 border">
        <h5 className="mb-3">
          Items de: {ravitos[selectedIndex]?.name} ({ravitos[selectedIndex]?.distance} km)
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
            <tfoot className="table-group-divider">
              <tr className="table-success fw-bold">
                <td className="px-4 py-2">Total</td>
                <td>{data.reduce((sum, item) => sum + (item.proteine*item.quantity || 0), 0)}</td>
                <td>{data.reduce((sum, item) => sum + (item.glucide*item.quantity || 0), 0)}</td>
                <td>{data.reduce((sum, item) => sum + (Number(item.quantity )|| 0), 0)}</td>
                <td></td>
              </tr>
              <tr className="table-info fw-bold">
                <td className="px-4 py-2">Prévision besoin</td>
                <td>{(myProfil?.consGlu || 40)*(ravitos[selectedIndex].temps)}</td>
                <td>{(myProfil?.consProt || 5)*(ravitos[selectedIndex].temps)}</td>
                <td></td>
                <td></td>
              </tr>
            </tfoot>
        </table>
        
    </div> ) : (
      <div></div>
    )
}

export default EditTable;