export default function Footer() {
  return (
    <footer className="w-full border-t">
      <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} JFK Files Explorer
        </p>
      </div>
    </footer>
  );
}
