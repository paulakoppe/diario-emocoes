export default function Loading() {
  return (
    <div className="animate-pulse">
      <header className="mb-6">
        <div className="h-9 w-2/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full mb-2" />
        <div className="h-4 w-1/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </header>

      <div className="card mb-4">
        <div className="h-5 w-1/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full mb-4" />
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-16 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-2xl"
            />
          ))}
        </div>
        <div className="h-3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </div>

      <div className="flex items-center justify-between mb-3 px-1">
        <div className="h-9 w-48 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <article key={i} className="card">
            <header className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-cream-200 dark:bg-[rgb(58,50,62)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
                <div className="h-3 w-1/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
              </div>
            </header>
            <div className="space-y-2">
              <div className="h-3 w-full bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
              <div className="h-3 w-4/5 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
