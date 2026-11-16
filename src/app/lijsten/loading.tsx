export default function LoadingLists() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6" aria-busy="true">
      <p className="sr-only">Lijstjes laden…</p>
      <div className="skeleton h-16" />
      <div className="skeleton h-28" />
      <div className="skeleton h-28" />
    </div>
  );
}
