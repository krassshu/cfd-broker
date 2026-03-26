const ROWS = 18;

export default function SymbolsListSkeleton() {
    return (
        <>
            {Array.from({ length: ROWS }).map((_, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b border-border/20 animate-pulse">
                    <div className="h-3 rounded bg-muted/20 w-[26%]" />
                    <div className="h-3 rounded bg-muted/20 w-[38%]" />
                    <div className="h-3 rounded bg-muted/20 w-[20%]" />
                    <div className="h-3 rounded bg-muted/20 w-[8%]" />
                </div>
            ))}
        </>
    );
}
