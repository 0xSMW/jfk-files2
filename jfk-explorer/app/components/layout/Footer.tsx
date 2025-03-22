export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="container mx-auto p-6 flex justify-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} JFK Files Explorer
        </p>
      </div>
    </footer>
  );
} 