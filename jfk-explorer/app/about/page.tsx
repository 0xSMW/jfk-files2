import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-semibold tracking-tight">About JFK Files Explorer</h1>

      <section>
        <h2 className="text-xl font-semibold mt-10 mb-3">Project Description</h2>
        <p className="text-muted-foreground leading-relaxed">
          The JFK Files Explorer is a web application designed to help researchers and enthusiasts explore the declassified documents related to the assassination of President John F. Kennedy.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-10 mb-3">Background on JFK Documents</h2>
        <p className="text-muted-foreground leading-relaxed">
          The JFK assassination documents were declassified in accordance with the President John F. Kennedy Assassination Records Collection Act of 1992. These documents provide valuable insights into the investigation and related events.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-10 mb-3">Usage Instructions</h2>
        <p className="text-muted-foreground leading-relaxed">
          To use the JFK Files Explorer, navigate to the Documents page to browse and search for documents. Use the filters and search bar to find specific documents. Click on a document to view its details and relationships.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-10 mb-3">Getting Started</h2>
        <ol className="list-decimal pl-5 space-y-1 text-muted-foreground">
          <li>Visit the Documents page.</li>
          <li>Use the search bar to find documents by keyword.</li>
          <li>Apply filters to narrow down the results.</li>
          <li>Click on a document to view its content and relationships.</li>
        </ol>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-10 mb-3">FAQ</h2>
        <Accordion type="single" collapsible>
          <AccordionItem value="source">
            <AccordionTrigger>What is the source of these documents?</AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              The documents are sourced from the National Archives and Records Administration (NARA).
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      <section>
        <h2 className="text-xl font-semibold mt-10 mb-3">Contact</h2>
        <p className="text-muted-foreground leading-relaxed">
          For questions or support, please contact us at{' '}
          <a href="mailto:support@jfkexplorer.com" className="text-primary hover:underline">
            support@jfkexplorer.com
          </a>.
        </p>
      </section>

      <div className="mt-10">
        <Link href="/documents" className="text-primary hover:underline">
          &larr; Back to Documents
        </Link>
      </div>
    </div>
  );
}
