import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">About JFK Files Explorer</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Project Description</h2>
        <p className="text-gray-700">
          {/* TODO: Add project description */}
          The JFK Files Explorer is a web application designed to help researchers and enthusiasts explore the declassified documents related to the assassination of President John F. Kennedy.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Background on JFK Documents</h2>
        <p className="text-gray-700">
          {/* TODO: Add background information */}
          The JFK assassination documents were declassified in accordance with the President John F. Kennedy Assassination Records Collection Act of 1992. These documents provide valuable insights into the investigation and related events.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Usage Instructions</h2>
        <p className="text-gray-700">
          {/* TODO: Add usage instructions */}
          To use the JFK Files Explorer, navigate to the Documents page to browse and search for documents. Use the filters and search bar to find specific documents. Click on a document to view its details and relationships.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <p className="text-gray-700">
          {/* TODO: Add getting started guide */}
          1. Visit the Documents page.<br />
          2. Use the search bar to find documents by keyword.<br />
          3. Apply filters to narrow down the results.<br />
          4. Click on a document to view its content and relationships.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">FAQ</h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">What is the source of these documents?</h3>
            <p className="text-gray-700">
              {/* TODO: Add FAQ answer */}
              The documents are sourced from the National Archives and Records Administration (NARA).
            </p>
          </div>
          {/* Add more FAQ items */}
        </div>
      </section>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <p className="text-gray-700">
          {/* TODO: Add contact information */}
          For questions or support, please contact us at <a href="mailto:support@jfkexplorer.com" className="text-blue-600 hover:underline">support@jfkexplorer.com</a>.
        </p>
      </section>
      
      <div className="mt-8">
        <Link href="/documents" className="text-blue-600 hover:underline">
          ← Back to Documents
        </Link>
      </div>
    </div>
  );
} 