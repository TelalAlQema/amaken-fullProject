import Link from "next/link";
import Image from "next/image";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = "No results found",
  description = "Try adjusting your search criteria or filters.",
  actionLabel = "Browse Properties",
  actionHref = "/properties",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Image src="/images/house-floor-plan.png" alt="No results" width={120} height={120} className="mb-6 opacity-50" />
      <h3 className="mb-2 text-xl font-semibold text-navy">{title}</h3>
      <p className="mb-6 text-sm text-amaken-gray">{description}</p>
      <Link href={actionHref} className="btn-primary">
        {actionLabel}
      </Link>
    </div>
  );
}
