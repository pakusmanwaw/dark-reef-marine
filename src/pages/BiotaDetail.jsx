import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../services/supabase";

function BiotaDetail() {
  const { id } = useParams();

  const [biota, setBiota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================================================
  // AMBIL DATA DARI SUPABASE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchBiotaDetail() {
      setLoading(true);
      setError("");

      const numericId = Number(id);

      if (!Number.isFinite(numericId)) {
        setError("ID biota tidak valid.");
        setLoading(false);
        return;
      }

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
  difficulty,
  temperament,
  reef_safe,
  condition,
  description
`)
        .eq("id", numericId)
        .single();

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Gagal mengambil detail biota:",
          error
        );

        setBiota(null);
        setError(
          "Data biota yang Anda cari tidak tersedia."
        );
      } else {
        setBiota(data);
      }

      setLoading(false);
    }

    fetchBiotaDetail();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =========================================================
  // FORMAT HARGA
  // =========================================================

  function formatRupiah(value) {
    return Number(
      value || 0
    ).toLocaleString("id-ID");
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">

        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="text-center">

            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />

            <p className="mt-5 font-semibold text-slate-700">
              Memuat detail produk...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // DATA TIDAK DITEMUKAN
  // =========================================================

  if (!biota) {
    return (
      <div className="min-h-screen bg-slate-950">

        <Navbar />

        <main className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="text-center">

            <div className="text-6xl">
              🌊
            </div>

            <h1 className="mt-6 text-4xl font-bold text-white">
              Biota Tidak Ditemukan
            </h1>

            <p className="mt-4 text-slate-400">
              {error ||
                "Data biota yang Anda cari tidak tersedia."}
            </p>

            <Link
              to="/biota"
              className="mt-8 inline-block rounded-xl bg-cyan-600 px-6 py-3 font-bold text-white transition hover:bg-cyan-700"
            >
              Kembali ke Koleksi Biota
            </Link>

          </div>

        </main>

      </div>
    );
  }

  // =========================================================
  // DATA
  // =========================================================

  const isEquipment =
    biota.category === "Equipment";

  const stock =
    Number(biota.stock || 0);

  const price =
    Number(
      biota.retail_price ??
        biota.price ??
        0
    );

  // =========================================================
  // KONTAK & MARKETPLACE
  // =========================================================

  const whatsappNumber = "62895352446570";

  const whatsappMessage = encodeURIComponent(
    `Halo Dark Reef Marine, saya tertarik dengan ${biota.name || "biota ini"}. Apakah masih tersedia?`
  );

  const whatsappUrl =
    `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  const tokopediaUrl =
    "https://tokopedia.com/darkreef";

  const shopeeUrl =
    "https://id.shp.ee/HDD9nkve";

  const googleMapsUrl =
    "https://maps.app.goo.gl/7RsUxvYTfkvS2Aqb9";

  // =========================================================
  // RENDER DETAIL
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar />


      {/* =====================================================
          BACK
      ====================================================== */}

      <section className="bg-slate-950 px-6 py-6">

        <div className="mx-auto max-w-7xl">

          <Link
  to="/biota"
  style={{
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#06b6d4",
    color: "#ffffff",
    padding: "10px 18px",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: "700",
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  }}
>
  ← Kembali ke Koleksi Biota
</Link>

        </div>

      </section>


      {/* =====================================================
          DETAIL
      ====================================================== */}

      <main className="px-6 py-12 sm:px-8 lg:py-16">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-10 lg:grid-cols-2">


            {/* =================================================
                IMAGE
            ================================================= */}

            <div className="overflow-hidden rounded-3xl bg-slate-200">

              {biota.image_url ? (

                <img
                  src={biota.image_url}
                  alt={
                    biota.name ||
                    "Dark Reef Marine"
                  }
                  className="aspect-square h-full w-full object-cover"
                />

              ) : (

                <div className="flex aspect-square items-center justify-center">

                  <div className="text-center">

                    <div className="text-8xl">

                      {isEquipment
                        ? "⚙️"
                        : biota.category ===
                          "Coral"
                        ? "🪸"
                        : biota.category ===
                          "Macroalgae"
                        ? "🌿"
                        : biota.category ===
                          "Invertebrate"
                        ? "🦐"
                        : biota.category ===
                          "Clean Up Crew"
                        ? "🐚"
                        : "🐠"}

                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      Foto produk akan ditampilkan di sini
                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div>


              {/* CATEGORY */}

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                {biota.category}
              </p>


              {/* NAME */}

              <h1 className="mt-3 text-4xl font-bold text-slate-950 sm:text-5xl">
                {biota.name}
              </h1>


              {/* =================================================
                  ENGLISH NAME
                  TIDAK DITAMPILKAN UNTUK EQUIPMENT
              ================================================= */}

              {!isEquipment &&
                biota.english_name && (

                  <p className="mt-2 text-lg italic text-slate-400">
                    {biota.english_name}
                  </p>

                )}


              {/* =================================================
                  EQUIPMENT CONDITION
              ================================================= */}

              {isEquipment &&
                biota.condition && (

                  <div className="mt-3">

                    <span
                      className={
                        biota.condition ===
                        "Baru"
                          ? "inline-flex rounded-full bg-cyan-100 px-4 py-2 text-sm font-bold text-cyan-700"
                          : "inline-flex rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700"
                      }
                    >
                      Kondisi:{" "}
                      {biota.condition}
                    </span>

                  </div>

                )}


              {/* =================================================
                  PRICE
              ================================================= */}

              <div className="mt-8">

                <p className="text-sm text-slate-400">
                  Harga
                </p>

                <p className="mt-1 text-3xl font-bold text-cyan-600">
                  Rp{" "}
                  {formatRupiah(price)}
                </p>

              </div>


              {/* =================================================
                  STOCK STATUS
              ================================================= */}

              <div className="mt-4">

                {stock > 0 ? (

                  <span className="inline-flex rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700">
                    ✓ Tersedia —{" "}
                    {stock} stok
                  </span>

                ) : (

                  <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-bold text-red-700">
                    ✕ Tidak tersedia
                  </span>

                )}

              </div>


              {/* =================================================
                  INFORMATION GRID
                  KHUSUS BIOTA
              ================================================= */}

              {!isEquipment && (

                <div className="mt-8 grid grid-cols-2 gap-4">


                  {/* SIZE */}

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-400">
                      Ukuran
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {biota.size ||
                        "Belum tersedia"}
                    </p>

                  </div>


                  {/* DIFFICULTY */}

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-400">
                      Tingkat Kesulitan
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {biota.difficulty ||
                        "Belum tersedia"}
                    </p>

                  </div>


                  {/* TEMPERAMENT */}

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-400">
                      Sifat
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {biota.temperament ||
                        "Belum tersedia"}
                    </p>

                  </div>


                  {/* REEF SAFE */}

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-400">
                      Reef Safe
                    </p>

                    <p
                      className={`mt-1 font-bold ${
                        biota.reef_safe ===
                        "Tidak"
                          ? "text-red-500"
                          : "text-emerald-600"
                      }`}
                    >
                      {biota.reef_safe ||
                        "Belum tersedia"}
                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  EQUIPMENT INFO
              ================================================= */}

              {isEquipment && (

                <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">


                  {/* CONDITION */}

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-400">
                      Kondisi
                    </p>

                    <p className="mt-1 font-bold text-slate-900">
                      {biota.condition ||
                        "Belum tersedia"}
                    </p>

                  </div>


                  {/* STOCK */}

                  <div className="rounded-2xl bg-white p-5 shadow-sm">

                    <p className="text-sm text-slate-400">
                      Stok
                    </p>

                    <p
                      className={
                        stock > 0
                          ? "mt-1 font-bold text-emerald-600"
                          : "mt-1 font-bold text-red-500"
                      }
                    >
                      {stock > 0
                        ? `${stock} unit tersedia`
                        : "Tidak tersedia"}
                    </p>

                  </div>

                </div>

              )}


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <div className="mt-8">

                <h2 className="text-xl font-bold text-slate-950">
                  {isEquipment
                    ? "Tentang Produk"
                    : "Tentang Biota"}
                </h2>

                <p className="mt-3 leading-7 text-slate-600">

                  {biota.description ||
                    (isEquipment
                      ? "Informasi mengenai produk ini belum tersedia."
                      : "Informasi mengenai biota ini belum tersedia.")}

                </p>

              </div>


              {/* =================================================
                  BUTTON
              ================================================= */}

              <div className="mt-8">

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-xl bg-cyan-600 px-6 py-4 text-center font-bold text-white transition hover:bg-cyan-700"
                >
                  Tanya Ketersediaan via WhatsApp
                </a>

              </div>

            </div>

          </div>

        </div>

      </main>


      {/* =====================================================
          CONTACT
      ====================================================== */}

      <section
        id="contact"
        className="bg-slate-950 px-6 py-20"
      >

        <div className="mx-auto max-w-3xl text-center">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Dark Reef Marine
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white">
            Tertarik dengan{" "}
            {isEquipment
              ? "produk ini"
              : "biota ini"}
            ?
          </h2>

          <p className="mt-4 leading-7 text-slate-400">
            Hubungi Dark Reef Marine untuk
            mengetahui ketersediaan dan informasi
            terbaru.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">

            {/* WHATSAPP */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              💬 WhatsApp
            </a>

            {/* TOKOPEDIA */}
            <a
              href={tokopediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              🛒 Order di Tokopedia
            </a>

            {/* SHOPEE */}
            <a
              href={shopeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              🛍️ Order di Shopee
              
            </a>

            {/* GOOGLE MAPS */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-slate-100"
            >
              📍 Lokasi Dark Reef Marine
            </a>

          </div>

        </div>

      </section>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 px-6 py-8">

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

export default BiotaDetail;