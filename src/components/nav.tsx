import Link from "next/link";

export default function Nav() {
  return (
    <nav className="w-full border-b mb-6 py-3 bg-white">
      <div className="max-w-4xl mx-auto flex gap-4 px-4 text-sm font-medium">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <Link href="/log" className="hover:text-blue-600">Log</Link>
        <Link href="/sessions" className="hover:text-blue-600">Sessions</Link>
      </div>
    </nav>
  );
}
