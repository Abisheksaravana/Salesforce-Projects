export default function Footer() {
  return (
    <footer className="border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 flex items-center justify-between text-sm text-gray-400">
        <span>© {new Date().getFullYear()} Portfolio</span>
        <span>Powered by Salesforce</span>
      </div>
    </footer>
  );
}
