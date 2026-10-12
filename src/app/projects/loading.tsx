export default function ProjectsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-16" aria-busy="true">
      <div className="h-24 w-2/3 animate-pulse rounded-2xl bg-(--surface-hover)" />
      <div className="mt-12 space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-28 animate-pulse rounded-2xl bg-(--surface)" />
        ))}
      </div>
    </main>
  );
}
