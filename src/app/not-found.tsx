import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-4xl">Deze pagina bestaat niet</h1>
      <p className="mt-2 text-muted">Het lijstje is er niet, of de link klopt niet meer.</p>
      <Link className="btn mt-6" href="/">
        Naar de startpagina
      </Link>
    </div>
  );
}
