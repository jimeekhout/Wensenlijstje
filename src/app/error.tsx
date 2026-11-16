"use client";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="wrap">
      <section className="panel">
        <h1>Er ging iets mis</h1>
        <p>Probeer het nog eens. Blijft het gebeuren, vernieuw dan de pagina.</p>
        <button className="button primary" type="button" onClick={reset}>
          Opnieuw proberen
        </button>
      </section>
    </main>
  );
}
