import Chart from "@/app/market/_components/_primaryContent/_chart/Chart";

export default function PrimaryContent(){
    return(
        <div className="flex-1 flex flex-col min-w-0 h-full">
            <div className="flex-1 p-4 min-h-0 min-w-0">
                <Chart/>
            </div>
            <div className="h-12 border-t border-border bg-card/30 shrink-0"></div>
        </div>
    )
}