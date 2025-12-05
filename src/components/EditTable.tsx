import type { Items } from "../types";
import { createColumnHelper } from "@tanstack/react-table";
import { useState, useEffect } from "react";
import type { CellContext } from "@tanstack/react-table";
import { useMyContext } from "../context/Context";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { 
  updateRavitaillementItem, 
  deleteRavitaillementItem 
} from "../supabase-client";

const columnHelper = createColumnHelper<Items>();

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    updateData: (rowIndex: number, columnId: string, value: string | number) => Promise<void>;
    deleteRow: (rowIndex: number) => Promise<void>;
  }
}

interface ColumnMetaType {
  type?: string;
}

// Composant de cellule éditable avec modal
const EditableCell = ({ getValue, row, column, table }: CellContext<Items, unknown>) => {
  const initialValue = getValue() as string | number;
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState<string | number>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const columnMeta = column.columnDef.meta as ColumnMetaType | undefined;

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = async () => {
    if (value === initialValue) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      await table.options.meta?.updateData(row.index, column.id, value);
      setIsOpen(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setValue(initialValue);
    setIsOpen(false);
  };

  const getColumnLabel = () => {
    const labels: Record<string, string> = {
      name: "Nom du produit",
      proteine: "Quantité de protéine (g)",
      glucide: "Quantité de glucide (g)",
      quantity: "Nombre de produits"
    };
    return labels[column.id] || column.id;
  };

  return (
    <>
      <div 
        style={{ cursor: "pointer", padding: "8px" }} 
        onClick={() => setIsOpen(true)}
        className="hover-highlight"
      >
        {value || "-"}
      </div>

      {isOpen && (
        <div 
          className="modal d-flex align-items-center" 
          tabIndex={-1} 
          style={{ backgroundColor: "rgba(0,0,0,0.5)", display: "flex" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Modifier {getColumnLabel()}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCancel}
                  disabled={isSaving}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">{getColumnLabel()}</label>
                <input
                  type={columnMeta?.type || "text"}
                  className="form-control"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') handleCancel();
                  }}
                  autoFocus
                  disabled={isSaving}
                />
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sauvegarde...
                    </>
                  ) : (
                    'Valider'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .hover-highlight:hover {
          background-color: #f8f9fa;
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

// Composant pour la colonne de suppression
const DeleteCell = ({ row, table }: CellContext<Items, unknown>) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Êtes-vous sûr de vouloir supprimer cet item "${row.original.name}" ?`
    );

    if (confirmDelete) {
      setIsDeleting(true);
      try {
        await table.options.meta?.deleteRow(row.index);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      className="btn btn-danger btn-sm" 
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <span className="spinner-border spinner-border-sm" role="status"></span>
      ) : (
        'Supprimer'
      )}
    </button>
  );
};

const columns = [
  columnHelper.accessor("name", {
    header: "Nom du produit",
    cell: EditableCell,
    meta: {
      type: "text",
    } as ColumnMetaType
  }),
  columnHelper.accessor("proteine", {
    header: "Quantité de protéine (g)",
    cell: EditableCell,
    meta: {
      type: "number",
    } as ColumnMetaType
  }),
  columnHelper.accessor("glucide", {
    header: "Quantité de glucide (g)",
    cell: EditableCell,
    meta: {
      type: "number",
    } as ColumnMetaType
  }),
  columnHelper.accessor("quantity", {
    header: "Nombre de produits",
    cell: EditableCell,
    meta: {
      type: "number",
    } as ColumnMetaType
  }),
  columnHelper.display({
    id: "delete",
    header: "Actions",
    cell: DeleteCell,
  }),
];

const EditTable = () => {
  const { ravitos, selectedIndex, setRavitos, myProfil, currentProject } = useMyContext();

  if (selectedIndex === -1 || selectedIndex >= ravitos.length || !ravitos[selectedIndex]) {
    return <div></div>;
  }

  const selectedItems = selectedIndex !== -1 ? ravitos[selectedIndex]?.items ?? [] : [];
  const [data, setData] = useState<Items[]>(selectedItems);

  useEffect(() => {
    setData(selectedItems);
  }, [ravitos, selectedIndex]);

  const table = useReactTable<Items>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: async (rowIndex: number, columnId: string, value: string | number) => {
        const updatedItem = { ...data[rowIndex], [columnId]: value };
        const itemId = updatedItem.id;

        // Mise à jour en base de données si l'item existe
        if (currentProject && itemId < 1000000000000) {
          try {
            await updateRavitaillementItem(itemId, {
              name: updatedItem.name,
              proteine: updatedItem.proteine,
              glucide: updatedItem.glucide,
              quantity: updatedItem.quantity,
              status: updatedItem.status
            });
            console.log('✓ Item mis à jour en base');
          } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la sauvegarde des modifications');
            throw error;
          }
        }

        // Mise à jour locale
        setData((old) =>
          old.map((row, index) =>
            index === rowIndex ? { ...row, [columnId]: value } : row
          )
        );

        // Mise à jour du state global
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
      deleteRow: async (rowIndex: number) => {
        const itemToDelete = data[rowIndex];
        const itemId = itemToDelete.id;

        // Suppression en base de données
        if (currentProject && itemId < 1000000000000) {
          try {
            await deleteRavitaillementItem(itemId);
            console.log('✓ Item supprimé de la base');
          } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            alert('Erreur lors de la suppression de l\'item');
            throw error;
          }
        }

        // Suppression locale
        setData((old) => old.filter((_, index) => index !== rowIndex));

        // Mise à jour du state global
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
      },
    },
  });

  return data.length > 0 ? (
    <div className="card p-3 m-2 border shadow-sm">
      <h5 className="mb-3">
        Items de: {ravitos[selectedIndex]?.name} ({ravitos[selectedIndex]?.distance} km)
      </h5>
      <p className="text-muted small mb-3">
        {data.length} produit(s) - Cliquez sur une cellule pour modifier
      </p>
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle text-center">
          <thead className="table-light">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th scope="col" key={header.id} className="fw-bold">
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
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="table-group-divider">
            <tr className="table-success fw-bold">
              <td>Total</td>
              <td>{data.reduce((sum, item) => sum + (item.proteine * item.quantity || 0), 0)}</td>
              <td>{data.reduce((sum, item) => sum + (item.glucide * item.quantity || 0), 0)}</td>
              <td>{data.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}</td>
              <td></td>
            </tr>
            <tr className="table-info fw-bold">
              <td>Prévision besoin</td>
              <td>{(myProfil?.consProt || 5) * (ravitos[selectedIndex].temps)}</td>
              <td>{(myProfil?.consGlu || 40) * (ravitos[selectedIndex].temps)}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  ) : (
    <div></div>
  );
};

export default EditTable;