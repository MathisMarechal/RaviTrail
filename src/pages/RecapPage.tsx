import type {Ravitaillment,SavedProject} from "../types";
import { useState, useMemo, useEffect} from "react";
import type { CellContext, ColumnFiltersState} from "@tanstack/react-table";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { useLocation, useNavigate } from "react-router-dom";
import Filters from "../components/filters";
import EditableCellCheck from "../components/EditableCellCheck";



const columns = [
    {
        accessorKey:'name',
        header:"Nom",
        cell: (props: CellContext<any, string>) => <p>{props.getValue()}</p>
    },
    {
        accessorKey:'distance',
        header:"Distance",
        cell: (props: CellContext<any, string>) => <p>{props.getValue()}</p>
    },
    {
        accessorKey:'item.name',
        header:"Nom de l'item",
        cell: (props: CellContext<any, string>) => <p>{props.getValue()}</p>
    },
    {
        accessorKey:'item.proteine',
        header:"Proteine",
        cell: (props: CellContext<any, string>) => <p>{props.getValue()}</p>
    },
    {
        accessorKey:'item.glucide',
        header:"Glucide",
        cell: (props: CellContext<any, string>) => <p>{props.getValue()}</p>
    },
    {
        accessorKey:'item.status',
        header:"Status",
        cell: EditableCellCheck,
    },
]

type Props = {
    ravitos: Ravitaillment[],
};

function Recap ({ravitos}:Props) {
    const myData = useMemo(()=>
        ravitos.flatMap(ravito => 
            ravito.items.map(item => ({
                ...ravito,
                item
            }))
        ), [ravitos]
    );


    const[data,setData] = useState(myData);
    const [columnFilters,setColumnFilters] = useState<ColumnFiltersState>([]);
    const navigate = useNavigate();
    const location = useLocation();
    const table = useReactTable({
        data,
        columns,
        state :{
            columnFilters
        },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        columnResizeMode:"onChange",
        meta:{
            updateData:(rowIndex,columnId,value) => setData((prev)=>prev.map((row,index)=>index===rowIndex ? {...prev[rowIndex],[columnId]:value}:row)),
            revertData: () => {},
            deleteRow: ()=>{},
        }
    });
    console.log(data);



    return (
        <>

        <div className="d-flex justify-content-evenly" style={{paddingBottom:"30px",paddingTop:"30px", backgroundColor:"#0D6EFD",position:"relative", zIndex:1}}>
            <div style={{ cursor: "pointer", textDecoration: location.pathname=== "/" ? "underline" : "none" , color:"white",fontWeight:"bold"}} onClick={()=>navigate("/EditPage")}>Ravitaillement</div>
            <div style={{color:"white ",fontWeight:"bold"}}>RaviTrail</div>
            <div style={{cursor:"pointer",textDecoration: location.pathname=== "/MyProfil" ? "underline" : "none" ,color:"white",fontWeight:"bold"}} onClick={()=>navigate("/MyProfil")}>Profil</div>
        </div>

        <div style={{marginTop:"10px",marginLeft:"10px"}}>
            <Filters columnFilters={columnFilters} setColumnFilters={setColumnFilters}/>
            <div>
                <table className="table table-striped table-hover table-bordered align-middle text-center shadow-sm rounded" style={{width:table.getTotalSize()}}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => <tr key={headerGroup.id}>
                            {headerGroup.headers.map(
                                header => <th scope="col" style={{width: header.getSize(),position: 'relative'}} key={header.id}>
                                    {flexRender(header.column.columnDef.header,header.getContext())}
                                    <div onMouseDown={header.getResizeHandler()} onTouchStart={header.getResizeHandler()} className={`resizer ${header.column.getIsResizing()? "isResizing":""}`}></div>
                                </th>
                            )}
                        </tr>)}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row)=> <tr className="tr" key={row.id}>
                            {row.getVisibleCells().map(cell => <td scope="row" style={{width: cell.column.getSize()}} key={cell.id}>
                                {flexRender(cell.column.columnDef.cell,cell.getContext())}
                            </td>)}
                        </tr>)}
                    </tbody>
                </table>
            </div>
        </div>
        </>
    )
}

export default Recap