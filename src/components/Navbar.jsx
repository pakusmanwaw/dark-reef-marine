import { useState } from "react";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const whatsappUrl =
    "https://wa.me/62895352446570?text=Halo%20Dark%20Reef%20Marine%2C%20saya%20ingin%20bertanya%20tentang%20biota%20yang%20tersedia.";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">

        {/* Logo */}
        <a
          href="/"
          onClick={closeMenu}
          className="flex items-center gap-3"
        >
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Dark Reef Marine"
              className="h-full w-full object-contain"
            />
          </div>

          <div className="hidden sm:block">
            <p className="text-base font-extrabold tracking-tight text-slate-900">
              DARK REEF
            </p>

            <p className="-mt-1 text-[11px] font-bold tracking-[0.25em] text-cyan-600">
              MARINE
            </p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">

          <a
            href="/"
            className="text-sm font-semibold text-cyan-600"
          >
            Home
          </a>

          <a
            href="/biota"
            className="text-sm font-semibold text-slate-600 transition hover:text-cyan-600"
          >
            Biota
          </a>

          <a
            href="/jasa-aquarium"
            className="text-sm font-semibold text-slate-600 transition hover:text-cyan-600"
          >
            Jasa Aquarium
          </a>

          {/* Tentang Kami */}
          <a
            href="/tentang-kami"
            className="text-sm font-semibold text-slate-600 transition hover:text-cyan-600"
          >
            Tentang Kami
          </a>

        </div>

        {/* Contact Button - Desktop */}
        <div className="hidden md:flex">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 hover:shadow-md"
          >
            Hubungi Kami
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          aria-label={
            isMenuOpen
              ? "Tutup menu"
              : "Buka menu"
          }
          aria-expanded={isMenuOpen}
          onClick={() =>
            setIsMenuOpen(!isMenuOpen)
          }
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-900 transition hover:bg-slate-50 md:hidden"
        >
          {isMenuOpen ? "×" : "☰"}
        </button>

      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-t border-slate-200 bg-white md:hidden">

          <div className="mx-auto max-w-7xl px-5 py-4 sm:px-6">

            <div className="flex flex-col gap-1">

              <a
                href="/"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-cyan-600 hover:bg-slate-50"
              >
                Home
              </a>

              <a
                href="/biota"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Biota
              </a>

              <a
                href="/jasa-aquarium"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Jasa Aquarium
              </a>

              {/* Tentang Kami */}
              <a
                href="/tentang-kami"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Tentang Kami
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMenu}
                className="mt-2 rounded-xl bg-cyan-600 px-4 py-3 text-center text-sm font-bold text-white transition hover:bg-cyan-700"
              >
                Hubungi Kami
              </a>

            </div>

          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;