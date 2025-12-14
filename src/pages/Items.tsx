import type { ListItems } from "../types";
import React, { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CellContext } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
import Header from "../components/Header";
import { 
    fetchItemsMaster, 
    createItemMaster, 
    updateItemMaster, 
    deleteItemMaster 
} from "../supabase-client";

const columnHelper = createColumnHelper<ListItems>();

declare module '@tanstack/react-table' {
  interface TableMeta<TData> {
    updateData: (rowIndex: number, columnId: string, value: string | number) => Promise<void>;
    deleteRow: (rowIndex: number) => Promise<void>;
  }
}

interface ColumnMetaType {
  type?: string;
}

const EditableCell = ({ getValue, row, column, table }: CellContext<ListItems, unknown>) => {
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
      glucide: "Quantité de glucide (g)"
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
                      <span className="spinner-border spinner-border-sm me-2"></span>
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

const DeleteCell = ({ row, table }: CellContext<ListItems, unknown>) => {
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
  columnHelper.display({
    id: "delete",
    header: "Actions",
    cell: DeleteCell,
  }),
];

function Items() {
  const { listNewItems, setListNewItems } = useMyContext();
  const [nameNewItems, setNameNewItems] = useState<string>("");
  const [proNewItems, setProNewItems] = useState<number | "">("");
  const [gluNewItems, setGluNewItems] = useState<number | "">("");

  const [data, setData] = useState<ListItems[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        const items = await fetchItemsMaster();
        setListNewItems(items);
        setData(items);
      } catch (error) {
        console.error('Erreur lors du chargement des items:', error);
        alert('Erreur lors du chargement des items');
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [setListNewItems]);

  useEffect(() => {
    setData(listNewItems);
  }, [listNewItems]);

  const handleSubmitNewItems = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nameNewItems || proNewItems === "" || gluNewItems === "") {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      const newItem = await createItemMaster(
        nameNewItems,
        Number(proNewItems),
        Number(gluNewItems)
      );

      setListNewItems([...listNewItems, newItem]);
      setNameNewItems("");
      setProNewItems("");
      setGluNewItems("");
    } catch (error) {
      console.error('Erreur lors de la création de l\'item:', error);
      alert('Erreur lors de la création de l\'item');
    }
  };

  const table = useReactTable<ListItems>({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: async (rowIndex: number, columnId: string, value: string | number) => {
        const updatedItem = { ...data[rowIndex], [columnId]: value };

        try {
          const savedItem = await updateItemMaster(
            updatedItem.id,
            updatedItem.name,
            updatedItem.proteine,
            updatedItem.glucide
          );

          console.log('✓ Item mis à jour en base');

          setData((old) =>
            old.map((row, index) =>
              index === rowIndex ? savedItem : row
            )
          );

          setListNewItems((old) =>
            old.map((row) => (row.id === savedItem.id ? savedItem : row))
          );
        } catch (error) {
          console.error('Erreur lors de la mise à jour:', error);
          alert('Erreur lors de la mise à jour de l\'item');
          throw error;
        }
      },
      deleteRow: async (rowIndex: number) => {
        const itemToDelete = data[rowIndex];

        try {
          await deleteItemMaster(itemToDelete.id);
          console.log('✓ Item supprimé de la base');

          setData((old) => old.filter((_, index) => index !== rowIndex));
          setListNewItems((old) => old.filter((item) => item.id !== itemToDelete.id));
        } catch (error) {
          console.error('Erreur lors de la suppression:', error);
          alert('Erreur lors de la suppression de l\'item');
          throw error;
        }
      },
    },
  });

  return (
    <>
      <Header isAuthenticated={true} />
      
      <div className="bannerMyProfil" style={{ minHeight: "100vh", padding: "40px 20px" }}>
        <div className="container" style={{ maxWidth: "1000px" }}>
          <h1 className="text-center mb-5" style={{ color: "white", fontWeight: "bold" }}>
            📦 Mes items personnalisés
          </h1>
        
          <div className="card border-0 shadow-lg mb-4" style={{ backgroundColor: "rgba(255, 255, 255, 0.98)" }}>
            <div className="card-body p-4">
              <form onSubmit={handleSubmitNewItems}>
                <h5 className="mb-3">➕ Ajouter un nouvel item</h5>
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Nom du produit</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Ex: Gel énergétique" 
                      value={nameNewItems} 
                      onChange={(e) => setNameNewItems(e.target.value)}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Protéines (g)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="5" 
                      value={proNewItems} 
                      onChange={(e) => setProNewItems(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Glucides (g)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="25" 
                      value={gluNewItems} 
                      onChange={(e) => setGluNewItems(e.target.value === "" ? "" : Number(e.target.value))}
                    />
                  </div>
                  <div className="col-md-2 mb-3 d-flex align-items-end">
                    <button type="submit" className="btn btn-primary w-100">
                      Ajouter
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-light" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Chargement...</span>
              </div>
              <p className="mt-3 text-white fw-bold">Chargement des items...</p>
            </div>
          ) : data.length > 0 ? (
            <div className="card border-0 shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.98)" }}>
              <div className="card-body p-4">
                <h5 className="mb-3">
                  📋 Liste des items ({data.length})
                </h5>
                <p className="text-muted small mb-3">
                  Cliquez sur une cellule pour modifier
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
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-lg" style={{ backgroundColor: "rgba(255, 255, 255, 0.98)" }}>
              <div className="card-body p-5 text-center">
                <div className="mb-4" style={{ fontSize: "4rem" }}>📦</div>
                <h4 className="mb-3">Aucun item enregistré</h4>
                <p className="text-muted">Ajoutez vos premiers items alimentaires ci-dessus !</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .bannerMyProfil {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
      `}</style>
    </>
  );
}

export default Items;