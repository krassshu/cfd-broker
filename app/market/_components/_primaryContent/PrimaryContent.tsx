import Chart from "@/app/market/_components/_primaryContent/_chart/Chart";
import PositionsPanel from "@/app/market/_components/_primaryContent/_positionsPanel/PositionsPanel";

export default function PrimaryContent(){
    return(
        <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
            <div className="flex-1 min-h-0 min-w-0 rounded-sm border border-border bg-card overflow-hidden shadow-sm">
                <Chart/>
            </div>
            <div className="h-64 border border-border bg-card rounded-sm shrink-0 overflow-hidden shadow-sm">
                <PositionsPanel />
            </div>
        </div>
    )
}