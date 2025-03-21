export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-background">
      <div className="container mx-auto p-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} JFK Files Explorer
          </p>
        </div>
        <div className="flex space-x-6">
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            GitHub
          </a>
          <a 
            href="/about" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            About
          </a>
          <a 
            href="/privacy" 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
} 