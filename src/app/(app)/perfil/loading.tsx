export default function Loading() {
  return (
    <div className="animate-pulse">
      <header className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="h-9 w-40 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
          <div className="h-3 w-32 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
        </div>
        <div className="h-9 w-24 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </header>

      <div className="flex items-center justify-between mb-4 px-1">
        <div className="h-4 w-20 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
        <div className="h-8 w-16 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </div>

      <div className="card space-y-6">
        <div className="flex justify-center">
          <div className="w-28 h-28 rounded-full bg-cream-200 dark:bg-[rgb(58,50,62)]" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3 w-16 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
            <div className="h-12 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-2xl" />
          </div>
        ))}
        <div className="h-12 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </div>
    </div>
  );
}
