export function PropertyCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-56 w-full bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded bg-gray-200" />
          <div className="h-5 w-12 rounded bg-gray-200" />
        </div>
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="flex gap-3">
          <div className="h-4 w-14 rounded bg-gray-200" />
          <div className="h-4 w-14 rounded bg-gray-200" />
          <div className="h-4 w-14 rounded bg-gray-200" />
        </div>
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="h-4 w-20 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

export function PropertyListSkeleton() {
  return (
    <div className="card flex animate-pulse overflow-hidden">
      <div className="h-64 w-full bg-gray-200 md:h-auto md:w-80" />
      <div className="flex-1 space-y-3 p-5">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded bg-gray-200" />
          <div className="h-5 w-12 rounded bg-gray-200" />
        </div>
        <div className="h-6 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-200" />
        <div className="flex gap-4">
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
        <div className="h-8 w-28 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function BannerSkeleton() {
  return (
    <div className="h-64 w-full animate-pulse bg-gray-200 md:h-80" />
  );
}

export function ProfileSkeleton() {
  return (
    <div className="card animate-pulse p-6">
      <div className="flex items-center gap-4">
        <div className="h-20 w-20 rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-5 w-32 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
