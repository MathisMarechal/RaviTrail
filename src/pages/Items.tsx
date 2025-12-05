import type { ListItems } from "../types"
import React, { useState, useEffect } from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { CellContext } from "@tanstack/react-table";
import { createColumnHelper } from "@tanstack/react-table";
import { useLocation, useNavigate } from "react-router-dom";
import { useMyContext } from "../context/Context";
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

// Composant de cellule éditable avec modal
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
  const location = useLocation();

  // Charger les items au montage
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

  // Mettre à jour les données locales quand listNewItems change
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
          // Mise à jour en base de données
          const savedItem = await updateItemMaster(
            updatedItem.id,
            updatedItem.name,
            updatedItem.proteine,
            updatedItem.glucide
          );

          console.log('✓ Item mis à jour en base');

          // Mise à jour locale
          setData((old) =>
            old.map((row, index) =>
              index === rowIndex ? savedItem : row
            )
          );

          // Mise à jour du state global
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

          // Suppression locale
          setData((old) => old.filter((_, index) => index !== rowIndex));

          // Mise à jour du state global
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
      <div className="d-flex justify-content-evenly" style={{ paddingBottom: "30px", paddingTop: "30px", backgroundColor: "#0D6EFD", position: "relative", zIndex: 1 }}>
        <div style={{ cursor: "pointer", textDecoration: location.pathname === "/" ? "underline" : "none", color: "white", fontWeight: "bold" }} onClick={() => navigate("/")}>Home</div>
        <div style={{ color: "white", fontWeight: "bold" }}>RaviTrail</div>
        <div style={{ cursor: "pointer", textDecoration: location.pathname === "/MyProfil" ? "underline" : "none", color: "white", fontWeight: "bold" }} onClick={() => navigate("/MyProfil")}>Profil</div>
      </div>
      
      <div className="bannerMyProfil">
        <h1 style={{ marginBottom: "50px", zIndex: 1, color: "white", fontWeight: "bold" }}>Mes items</h1>
        
        <div style={{ display: "flex", flexDirection: "column", alignContent: "center", alignItems: "center", justifyContent: "center" }}>
          <div className="card p-3 m-2 border shadow-sm" style={{ width: "70%" }}>
            <form onSubmit={handleSubmitNewItems}>
              <h5 className="mb-3">Nouvel item</h5>
              <div className="mb-3">
                <label className="form-label">Nom du produit</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Entrer le nom du produit" 
                  value={nameNewItems} 
                  onChange={(e) => setNameNewItems(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Quantité de protéine (g)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Entrer la quantité de protéine" 
                  value={proNewItems} 
                  onChange={(e) => setProNewItems(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Quantité de glucide (g)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Entrer la quantité de glucide" 
                  value={gluNewItems} 
                  onChange={(e) => setGluNewItems(e.target.value === "" ? "" : Number(e.target.value))}
                />
              </div>
              <button type="submit" className="btn btn-primary">
                Ajouter
              </button>
            </form>
          </div>
        </div>

        {isLoading ? (
          <div className="container mt-5 text-center">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-white">Chargement des items...</p>
          </div>
        ) : data.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignContent: "center", alignItems: "center", justifyContent: "center" }}>
            <div className="card p-3 m-2 border shadow-sm" style={{ width: "70%" }}>
              <h5 className="mb-3">
                Liste des items enregistrés
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
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="container mt-5 text-center">
            <div className="card p-4 shadow-sm" style={{ maxWidth: "500px", margin: "0 auto" }}>
              <p className="text-muted mb-0">Aucun item enregistré. Ajoutez-en un ci-dessus !</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Items;