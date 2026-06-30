export default function Loading() {
  return (
    <div className="animate-pulse">
      <header className="mb-6">
        <div className="h-9 w-2/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full mb-2" />
        <div className="h-4 w-1/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
      </header>

      <div className="space-y-6">
        <section className="card">
          <div className="h-5 w-1/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl bg-cream-200 dark:bg-[rgb(58,50,62)]"
              />
            ))}
          </div>
        </section>

        <section className="card opacity-50">
          <div className="h-5 w-1/3 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full mb-4" />
          <div className="h-3 w-full bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full" />
        </section>

        <section className="card opacity-50">
          <div className="h-5 w-1/2 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-full mb-4" />
          <div className="h-24 bg-cream-200 dark:bg-[rgb(58,50,62)] rounded-2xl" />
        </section>
      </div>
    </div>
  );
}
