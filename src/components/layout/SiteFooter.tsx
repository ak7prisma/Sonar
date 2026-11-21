import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { SonarLogo } from "@/components/shared/SonarLogo";

const FOOTER_GROUPS = [
  {
    heading: "Produk",
    links: [
      { label: "Dashboard Mahasiswa", href: "/dashboard" },
      { label: "Mata Kuliah & Materi Reusable", href: "/courses" },
      { label: "Unggah Dokumen PDF", href: "/upload" },
      { label: "Accessible Reader", href: "/reader" },
      { label: "Antrean Review Volunteer", href: "/review" },
    ],
  },
  {
    heading: "Pelajari",
    links: [
      { label: "Cara Kerja", href: "/how-it-works" },
      { label: "Tentang SONAR", href: "/about" },
      { label: "Pusat Bantuan", href: "/help" },
    ],
  },
  {
    heading: "Standar",
    links: [
      { label: "Pernyataan Aksesibilitas", href: "/accessibility" },
      { label: "Masuk", href: "/login" },
      { label: "Daftar Akun", href: "/register" },
    ],
  },
];

const linkClass =
  "inline-block rounded py-1 text-sm text-brand-paper/80 transition-colors hover:text-brand-aqua focus-visible:outline-2 focus-visible:outline-brand-aqua";

export function SiteFooter() {
  return (
    <footer className="bg-brand-ink text-brand-paper font-ui">
      <div className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <Link
              href="/"
              aria-label="SONAR — kembali ke beranda"
              className="inline-flex rounded-2xl bg-brand-paper px-4 py-3 focus-visible:outline-2 focus-visible:outline-brand-aqua"
            >
              <SonarLogo size="md" tone="light" />
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-brand-paper/80 font-sans">
              Platform aksesibilitas yang mengubah PDF perkuliahan menjadi materi terstruktur: siap dibaca
              screen reader, dinarasikan audio, dan diverifikasi volunteer.
            </p>
            <a
              href="mailto:support@sonar.ac.id"
              className="inline-flex items-center gap-2 rounded-xl border border-brand-paper/25 px-4 py-2.5 text-sm font-medium text-brand-paper transition-colors hover:border-brand-aqua hover:text-brand-aqua focus-visible:outline-2 focus-visible:outline-brand-aqua"
            >
              <Mail className="size-4" aria-hidden="true" />
              <span>support@sonar.ac.id</span>
            </a>
          </div>

          <nav
            aria-label="Tautan footer"
            className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7 lg:pl-8"
          >
            {FOOTER_GROUPS.map((group) => (
              <div key={group.heading} className="last:col-span-2 sm:last:col-span-1">
                <h2 className="mb-3 font-heading text-sm font-bold uppercase tracking-wider text-brand-gold">
                  {group.heading}
                </h2>
                <ul className="space-y-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className={linkClass}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-brand-paper/15 pt-6 text-xs text-brand-paper/75 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 SONAR. Materi kuliah yang dapat diakses semua mahasiswa.</p>
          <p className="inline-flex items-center gap-2 font-medium text-brand-paper">
            <ShieldCheck className="size-4 text-brand-aqua" aria-hidden="true" />
            <span>Dirancang untuk WCAG 2.2 Level AA</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
