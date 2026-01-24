import SymbolsList from "@/app/dashboard/_components/_symbols/SymbolsList";
import PrimaryContent from "@/app/dashboard/_components/_primaryContent/PrimaryContent";

export default function DashboardPage() {
    return(
        <div className="flex px-4 py-4 gap-4 h-[calc(100vh-73px)] overflow-hidden">
            <SymbolsList/>
            <PrimaryContent/>
        </div>
    )
}