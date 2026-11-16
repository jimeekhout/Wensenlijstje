export default function LoadingShare() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 py-6" aria-busy="true">
      <p className="sr-only">Lijstje laden…</p>
      <div className="skeleton h-28" />
      <div className="skeleton h-40" />
      <div className="skeleton h-40" />
    </div>
  );
}
