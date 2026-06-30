export default function Loading() {
  return (
    <div className="animate-pulse">
      <header className="mb-6">
        <div className="h-9 w-3/4 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full mb-2" />
        <div className="h-4 w-1/2 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </header>

      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <section key={i} className="card">
            <header className="flex items-center gap-4 mb-4">
              <div className="w-20 h-20 rounded-full bg-cream-200 dark:bg-[rgb(58,50,62)] shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-1/2 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
                <div className="h-3 w-2/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
              </div>
            </header>
            <div className="space-y-2 mb-4">
              <div className="h-3 w-full bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
              <div className="h-3 w-5/6 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
              <div className="h-3 w-4/5 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
            </div>
            <div className="h-12 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
          </section>
        ))}
      </div>
    </div>
  );
}
