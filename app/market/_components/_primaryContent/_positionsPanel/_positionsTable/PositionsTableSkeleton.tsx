const ROWS = 3;
const COLS = 11;

export default function PositionsTableSkeleton() {
    return (
        <>
            {Array.from({ length: ROWS }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                    {Array.from({ length: COLS }).map((__, j) => (
                        <td key={j} className="px-4 py-3">
                            <div className="h-3 rounded bg-muted/20" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}
