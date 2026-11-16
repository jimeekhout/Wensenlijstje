export default function LoadingFinder() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6" aria-busy="true">
      <p className="sr-only">Cadeauzoeker laden…</p>
      <div className="skeleton h-20 max-w-xl" />
      <div className="skeleton h-40" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="skeleton h-64" />
        <div className="skeleton h-64" />
      </div>
    </div>
  );
}
