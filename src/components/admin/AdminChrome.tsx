import Link from "next/link";
import AdminLogoutButton from "@/components/AdminLogoutButton";

type Crumb = { href?: string; label: string };

export default function AdminChrome({
  email,
  role,
  crumbs,
  children,
}: {
  email: string;
  role?: string;
  crumbs: Crumb[];
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                CerpaMedia Admin
              </Link>
              {crumbs.map((crumb) => (
                <span key={crumb.label} className="flex items-center gap-6">
                  <span className="text-gray-400">→</span>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-600">{crumb.label}</span>
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4">
              {role ? (
                <span className="text-xs uppercase tracking-wide text-gray-500">
                  {role}
                </span>
              ) : null}
              <span className="text-sm text-gray-600">{email}</span>
              <AdminLogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}
