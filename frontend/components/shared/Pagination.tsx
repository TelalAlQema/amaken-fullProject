interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push("...");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="rounded px-3 py-2 text-sm text-amaken-gray hover:bg-gray-100 disabled:opacity-40"
      >
        ← Prev
      </button>
      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-2 text-sm text-amaken-gray">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
              p === page
                ? "bg-primary text-white"
                : "text-amaken-gray hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded px-3 py-2 text-sm text-amaken-gray hover:bg-gray-100 disabled:opacity-40"
      >
        Next →
      </button>
    </div>
  );
}
