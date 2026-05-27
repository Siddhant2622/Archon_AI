import { Skeleton } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <Skeleton variant="text" className="w-48 h-8 mb-2" />
          <Skeleton variant="text" className="w-64 h-4" />
        </div>
        <div className="flex gap-3">
          <Skeleton variant="text" className="w-32 h-10 rounded-xl" />
          <Skeleton variant="text" className="w-32 h-10 rounded-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
        <Skeleton variant="card" className="h-32" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton variant="text" className="w-32 h-6" />
          <Skeleton variant="card" className="h-[300px]" />
        </div>
        <div className="space-y-4">
          <Skeleton variant="text" className="w-32 h-6" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} variant="table" className="h-16" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
