import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto space-y-12">
      <section className="py-12 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            JFK Files Explorer
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Explore declassified documents from the JFK assassination investigation.
            Discover connections, analyze evidence, and dive deep into this pivotal moment in history.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/documents"
              className="btn btn-primary"
            >
              Browse Documents
            </Link>
            <Link
              href="/visualize"
              className="btn btn-secondary"
            >
              View Connections
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="card">
          <h2 className="text-xl font-semibold">Document Browser</h2>
          <p className="mt-2 text-muted-foreground">
            Browse through thousands of declassified documents with advanced search and filtering options.
          </p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">Entity Analysis</h2>
          <p className="mt-2 text-muted-foreground">
            Explore key people, organizations, and locations mentioned across the documents.
          </p>
        </div>
        <div className="card">
          <h2 className="text-xl font-semibold">Relationship Visualization</h2>
          <p className="mt-2 text-muted-foreground">
            Discover connections between documents, entities, and events with interactive visualizations.
          </p>
        </div>
      </section>

      <section className="border-t border-border pt-8">
        <h2 className="text-2xl font-semibold mb-4">About the Project</h2>
        <p>
          This application provides an interactive way to explore documents from the JFK assassination investigation
          that were released by the CIA. The documents have been analyzed using AI to extract key information,
          entities, and relationships, making them more accessible for research and exploration.
        </p>
        <div className="mt-4">
          <Link href="/about" className="text-secondary hover:underline">
            Learn more about this project
          </Link>
        </div>
      </section>
    </div>
  );
}
