import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../services/supabase";

function Biota() {
  const [biotaData, setBiotaData] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Semua");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // KATEGORI
  // =========================================================

  const categories = [
    "Semua",
    "Marine Fish",
    "Coral",
    "Invertebrate",
    "Clean Up Crew",
    "Macroalgae",
    "Equipment",
  ];

  // =========================================================
  // AMBIL DATA DARI SUPABASE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchBiota() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("biota")
        .select(`
          id,
          name,
          english_name,
          category,
          size,
          price,
          retail_price,
          stock,
          image_url,
          created_at
        `)
        .order("created_at", { ascending: false })
        ;

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Gagal mengambil data biota:",
          error
        );

         setError(
    error?.message ||
    error?.details ||
    error?.hint ||
    "Data biota tidak dapat dimuat. Silakan coba lagi."
  );

        setBiotaData([]);
      } else {
        setBiotaData(data || []);
      }

      setLoading(false);
    }

    fetchBiota();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredBiota = useMemo(() => {
    const keyword =
      search.trim().toLowerCase();

    return biotaData.filter((item) => {
      const name =
        item.name?.toLowerCase() || "";

      const englishName =
        item.english_name?.toLowerCase() || "";

      const matchesSearch =
        name.includes(keyword) ||
        englishName.includes(keyword);

      const matchesCategory =
        category === "Semua" ||
        item.category === category;

      const isAvailable =
        Number(item.stock || 0) > 0;

      return (
        matchesSearch &&
        matchesCategory &&
        isAvailable
      );
    });
  }, [
    biotaData,
    search,
    category,
  ]);

  // =========================================================
  // FORMAT HARGA
  // =========================================================

  function formatRupiah(value) {
    return Number(
      value || 0
    ).toLocaleString("id-ID");
  }

  // =========================================================
  // ICON FALLBACK
  // =========================================================

  function getCategoryIcon(categoryName) {
    if (categoryName === "Coral") {
      return "🪸";
    }

    if (
      categoryName === "Invertebrate"
    ) {
      return "🦐";
    }

    if (
      categoryName === "Clean Up Crew"
    ) {
      return "🐚";
    }

    if (
      categoryName === "Macroalgae"
    ) {
      return "🌿";
    }

    if (
      categoryName === "Equipment"
    ) {
      return "⚙️";
    }

    return "🐠";
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />

      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="bg-slate-950 px-6 py-16 sm:px-8">

        <div className="mx-auto max-w-7xl">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Dark Reef Marine
          </p>

          <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">
            Koleksi Biota
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-400">
            Temukan berbagai pilihan biota laut
            untuk aquarium Anda, mulai dari marine
            fish, coral, macroalgae, hingga equipment.
          </p>

        </div>

      </section>


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="px-6 py-12 sm:px-8 lg:py-16">

        <div className="mx-auto max-w-7xl">

          {/* =================================================
              SEARCH
          ================================================= */}

          <div className="rounded-3xl bg-white p-6 shadow-sm">

            <label
              htmlFor="search"
              className="block text-sm font-bold text-slate-900"
            >
              Cari Produk / Biota
            </label>

            <div className="relative mt-3">

              <input
                id="search"
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Cari nama biota atau English Name..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />

            </div>

          </div>


          {/* =================================================
              CATEGORY FILTER
          ================================================= */}

          <div className="mt-8">

            <p className="text-sm font-bold text-slate-900">
              Kategori
            </p>

            <div className="mt-4 flex flex-wrap gap-3">

              {categories.map(
                (item) => {

                  const active =
                    category === item;

                  return (

                    <button
                      key={item}
                      type="button"
                      onClick={() =>
                        setCategory(item)
                      }
                      className={
                        active
                          ? "rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm"
                          : "rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-cyan-400 hover:text-cyan-600"
                      }
                    >
                      {item}
                    </button>

                  );
                }
              )}

            </div>

          </div>


          {/* =================================================
              RESULT INFO
          ================================================= */}

          <div className="mt-10 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div>

              <h2 className="text-2xl font-bold text-slate-950">

                {category === "Semua"
                  ? "Semua Produk"
                  : category}

              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Menampilkan{" "}
                {filteredBiota.length}{" "}
                produk
              </p>

            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (

            <div className="mt-8 rounded-3xl bg-white px-6 py-20 text-center shadow-sm">

              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />

              <p className="mt-5 font-semibold text-slate-700">
                Memuat koleksi Dark Reef Marine...
              </p>

            </div>

          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading && error && (

            <div className="mt-8 rounded-3xl bg-white px-6 py-20 text-center shadow-sm">

              <div className="text-6xl">
                ⚠️
              </div>

              <h2 className="mt-5 text-2xl font-bold text-slate-950">
                Gagal Memuat Data
              </h2>

              <p className="mx-auto mt-3 max-w-md text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-6 rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-700"
              >
                Coba Lagi
              </button>

            </div>

          )}


          {/* =================================================
              PRODUCT GRID
          ================================================= */}

          {!loading &&
            !error &&
            filteredBiota.length > 0 && (

              <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">

                {filteredBiota.map(
                  (item) => {

                    const stock =
                      Number(
                        item.stock || 0
                      );

                    const price =
                      Number(
                        item.retail_price ??
                          item.price ??
                          0
                      );

                    const isEquipment =
                      item.category ===
                      "Equipment";

                    return (

                      <article
                        key={item.id}
                        className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                      >

                        {/* =================================================
                            IMAGE
                        ================================================= */}

                        <div className="relative aspect-square overflow-hidden bg-slate-200">

                          {item.image_url ? (

                            <img
                              src={
                                item.image_url
                              }
                              alt={
                                item.name ||
                                "Dark Reef Marine"
                              }
                              className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            />

                          ) : (

                            <div className="flex h-full items-center justify-center">

                              <div className="text-center">

                                <div className="text-7xl">
                                  {getCategoryIcon(
                                    item.category
                                  )}
                                </div>

                                <p className="mt-3 text-xs text-slate-400">
                                  Foto segera tersedia
                                </p>

                              </div>

                            </div>

                          )}


                          {/* STOCK BADGE */}

                          <div className="absolute right-4 top-4">

                            {stock > 0 ? (

                              <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                                Tersedia
                              </span>

                            ) : (

                              <span className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm">
                                Habis
                              </span>

                            )}

                          </div>


                          {/* EQUIPMENT CONDITION */}

                          {isEquipment &&
                            item.condition && (

                              <div className="absolute left-4 top-4">

                                <span
                                  className={
                                    item.condition ===
                                    "Baru"
                                      ? "rounded-full bg-cyan-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                                      : "rounded-full bg-amber-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                                  }
                                >
                                  {item.condition}
                                </span>

                              </div>

                            )}

                        </div>


                        {/* =================================================
                            CARD CONTENT
                        ================================================= */}

                        <div className="p-3 sm:p-5">

                          {/* CATEGORY */}

                          <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                            {item.category}
                          </p>


                          {/* NAME */}

                          <h3 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-950 sm:text-xl sm:leading-normal">
                            {item.name}
                          </h3>


                          {/* ENGLISH NAME
                              EQUIPMENT TIDAK MENAMPILKAN
                          */}

                          {!isEquipment &&
                            item.english_name && (

                              <p className="mt-1 line-clamp-1 text-[11px] italic text-slate-400 sm:text-sm">
                                {
                                  item.english_name
                                }
                              </p>

                            )}


                          {/* EQUIPMENT CONDITION */}

                          {isEquipment &&
                            item.condition && (

                              <p className="mt-1 text-sm text-slate-400">
                                Kondisi:{" "}
                                <span className="font-semibold text-slate-600">
                                  {
                                    item.condition
                                  }
                                </span>
                              </p>

                            )}


                          {/* PRICE + STOCK */}

                          <div className="mt-4 flex items-end justify-between gap-2 sm:mt-5 sm:gap-4">

                            <div>

                              <p className="text-xs text-slate-400">
                                Harga
                              </p>

                              <p className="mt-1 text-sm font-bold text-cyan-600 sm:text-lg">
                                Rp{" "}
                                {formatRupiah(
                                  price
                                )}
                              </p>

                            </div>


                            <div className="text-right">

                              <p className="text-xs text-slate-400">
                                Stok
                              </p>

                              <p className="mt-1 text-xs font-bold text-slate-900 sm:text-sm">
                                {stock}
                              </p>

                            </div>

                          </div>


                          {/* DETAIL BUTTON */}

                          <Link
                            to={`/biota/${item.id}`}
                            className="mt-3 block w-full rounded-full bg-cyan-600 px-2 py-2.5 text-center text-xs font-bold text-slate-950 transition hover:bg-cyan-500 sm:mt-5 sm:px-5 sm:py-3.5 sm:text-base"
                          >
                            Lihat Detail
                          </Link>

                        </div>

                      </article>

                    );

                  }
                )}

              </div>

            )}


          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {!loading &&
            !error &&
            filteredBiota.length === 0 && (

              <div className="mt-10 rounded-3xl bg-white px-6 py-20 text-center shadow-sm">

                <div className="text-6xl">
                  🌊
                </div>

                <h2 className="mt-5 text-2xl font-bold text-slate-950">
                  Produk tidak ditemukan
                </h2>

                <p className="mx-auto mt-3 max-w-md text-slate-500">
                  Coba gunakan kata pencarian
                  lain atau pilih kategori
                  yang berbeda.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("Semua");
                  }}
                  className="mt-6 rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-700"
                >
                  Reset Filter
                </button>

              </div>

            )}

        </div>

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 px-6 py-10">

        <div className="mx-auto max-w-7xl border-t border-white/10 pt-8 text-center">

          <p className="text-sm text-slate-400">
            ©{" "}
            {new Date().getFullYear()}{" "}
            Dark Reef Marine.
            All rights reserved.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            We Sell with Love.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default Biota;