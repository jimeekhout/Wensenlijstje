"use client";

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto w-full max-w-lg px-4 py-16">
      <h1 className="text-4xl">Er ging iets mis</h1>
      <p className="mt-2 text-muted">Probeer het nog eens.</p>
      <button className="btn mt-6" type="button" onClick={() => reset()}>
        Opnieuw
      </button>
    </div>
  );
}
