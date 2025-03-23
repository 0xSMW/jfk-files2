import JFKDataViewer from "./components/debug/JFKDataViewer";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto space-y-12">
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            JFK Files Explorer
          </h1>
          <p className="mt-6 text-lg opacity-70">
            Explore declassified documents from the JFK assassination investigation.
            Discover connections, analyze evidence, and dive deep into this pivotal moment in history.
          </p>
          <div className="mt-8">
            <Link 
              href="/documents" 
              className="rounded-md bg-blue-600 px-5 py-2.5 text-white shadow-sm hover:bg-blue-700 transition"
            >
              Explore Documents
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Link href="/documents" className="rounded-lg border p-4 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Document Browser</h2>
          <p className="mt-2 opacity-70">
            Browse through thousands of declassified documents with advanced search and filtering options.
          </p>
        </Link>
        <Link href="/entities" className="rounded-lg border p-4 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Entity Analysis</h2>
          <p className="mt-2 opacity-70">
            Explore key people, organizations, and locations mentioned across the documents.
          </p>
        </Link>
        <Link href="/visualization" className="rounded-lg border p-4 shadow-sm hover:shadow-md transition">
          <h2 className="text-xl font-semibold">Relationship Visualization</h2>
          <p className="mt-2 opacity-70">
            Discover connections between documents, entities, and events with interactive visualizations.
          </p>
        </Link>
      </section>

      <section className="border-t pt-8">
        <h2 className="text-2xl font-semibold mb-6">JFK Files Data</h2>
        <JFKDataViewer />
      </section>
    </div>
  );
} 