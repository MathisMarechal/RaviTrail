import { Input, InputGroup } from "rsuite"
import SearchIcon from '@rsuite/icons/Search';
import type { ColumnFiltersState } from "@tanstack/react-table";

type FiltersProps = {
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
};

const Filters = ({columnFilters,setColumnFilters}:FiltersProps) => {
    const taskName = columnFilters.find(
        f => f.id === 'name'
    )?.value as string || "";

    const onFilterChange = (id:string,value:string) => setColumnFilters(prev => prev.filter(f => f.id !== id).concat({id,value}));

    return(<div style={{padding:"1em"}}>
        <InputGroup size='sm' style={{maxWidth:'12rem', display:"flex"}}>
            <InputGroup.Addon>
                <SearchIcon style={{marginRight:"8px"}}/>
            </InputGroup.Addon>
            <Input type="text" placeholder="Nom du ravitaillment" value={taskName} onChange={(val)=>onFilterChange('name',val)} style={{borderRadius:"5",backgroundColor: "#f5f5f5", border: "1px solid #ccc",}}/>
        </InputGroup>
    </div>);
}

export default Filters;