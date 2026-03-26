import SymbolsList from "@/app/market/_components/_symbols/SymbolsList";
import PrimaryContent from "@/app/market/_components/_primaryContent/PrimaryContent";
import { NAVBAR_HEIGHT_PX } from "@/lib/config";

/** Extra vertical padding (top + bottom py-4 = 16px + border 1px + buffer) */
const CONTENT_OFFSET_PX = NAVBAR_HEIGHT_PX + 9;

export default function DashboardPage() {
    return(
        <div className="flex px-2 py-2 gap-2 md:px-4 md:py-4 md:gap-4 overflow-hidden" style={{ height: `calc(100vh - ${CONTENT_OFFSET_PX}px)` }}>
            <div className="hidden lg:block">
                <SymbolsList/>
            </div>
            <PrimaryContent/>
        </div>
    )
}
