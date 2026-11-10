import { ProductGridSkeleton, Skeleton } from "@/components/ui/Primitives";

export default function ShopLoading() {
  return (
    <>
      <div className="h-56 bg-primary-dark/90" />
      <div className="container-x grid gap-8 py-10 lg:grid-cols-[250px_1fr]">
        <div className="hidden space-y-4 lg:block">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </>
  );
}
