import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { supabase } from "../services/supabase";

function Home() {
  const [biota, setBiota] = useState([]);
  const [loadingBiota, setLoadingBiota] = useState(true);

  // =========================================================
  // AMBIL 4 BIOTA TERBARU DARI SUPABASE
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchBiota() {
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
          created_at,
          updated_at
        `)
        .gt("stock", 0)
        .order("updated_at", { ascending: false })
        .limit(4);

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Gagal mengambil biota untuk Home:",
          error
        );

        setBiota([]);
      } else {
        setBiota(data || []);
      }

      setLoadingBiota(false);
    }

    fetchBiota();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  function formatRupiah(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <main>

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="overflow-hidden bg-slate-950">
          <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:py-20">

            <div className="grid items-center gap-12 lg:grid-cols-2">

              {/* HERO TEXT */}
              <div>

                <span className="inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-300">
                  Marine Aquarium Specialist
                </span>

                <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Dark Reef
                  <span className="block text-cyan-400">
                    Marine
                  </span>
                </h1>

                <p className="mt-6 text-xl font-medium text-white sm:text-2xl">
                  We Sell with Love,
                  <span className="block text-cyan-400">
                    Not Just for Money.
                  </span>
                </p>

                <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                  Menyediakan berbagai biota laut, coral,
                  macroalgae, equipment, kebutuhan aquarium,
                  serta layanan aquarium untuk membantu Anda
                  membangun reef aquarium yang indah dan sehat.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                  <a
                    href="#biota"
                    className="rounded-xl bg-cyan-600 px-6 py-3.5 text-center font-bold text-white transition hover:bg-cyan-700"
                  >
                    Lihat Koleksi
                  </a>

                  <a
                    href="/jasa-aquarium"
                    className="rounded-xl border border-cyan-400 px-6 py-3.5 text-center font-bold text-cyan-300 transition hover:bg-cyan-400/10"
                  >
                    Jasa Aquarium
                  </a>

                </div>
              </div>

              {/* BANNER */}
              <div className="flex justify-center lg:justify-end">

                <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">

                  <img
                    src="/banner.jpg"
                    alt="Dark Reef Marine"
                    className="block h-auto w-full object-contain"
                  />

                </div>

              </div>

            </div>
          </div>
        </section>


        {/* =====================================================
            KATEGORI
        ====================================================== */}

        <section
          id="biota"
          className="bg-white px-6 py-20 sm:px-8"
        >
          <div className="mx-auto max-w-7xl">

            <div className="max-w-2xl">

              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                Koleksi Dark Reef
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Jelajahi Koleksi Kami
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Temukan berbagai marine fish, coral, invertebrate,
                clean up crew, macroalgae, hingga equipment
                untuk aquarium laut Anda.
              </p>

            </div>


            {/* CATEGORY GRID */}

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {/* =================================================
                  MARINE FISH
              ================================================== */}

              <Link
                to="/biota?category=Marine%20Fish"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-32 items-center justify-center rounded-xl bg-cyan-50">
                  <span className="text-6xl">
                    🐠
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Marine Fish
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Berbagai pilihan ikan laut untuk reef aquarium.
                </p>

                <p className="mt-5 font-bold text-cyan-600">
                  Lihat Koleksi →
                </p>

              </Link>


              {/* =================================================
                  CORAL
              ================================================== */}

              <Link
                to="/biota?category=Coral"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-32 items-center justify-center rounded-xl bg-cyan-50">
                  <img
                    src="/scaping-coral.png"
                    alt="Coral"
                    className="h-20 w-20 object-contain"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Coral
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pilihan coral untuk mempercantik reef aquarium.
                </p>

                <p className="mt-5 font-bold text-cyan-600">
                  Lihat Koleksi →
                </p>

              </Link>


              {/* =================================================
                  INVERTEBRATE
              ================================================== */}

              <Link
                to="/biota?category=Invertebrate"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-32 items-center justify-center rounded-xl bg-cyan-50">
                  <span className="text-6xl">
                    🦐
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Invertebrate
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Berbagai invertebrate untuk melengkapi aquarium.
                </p>

                <p className="mt-5 font-bold text-cyan-600">
                  Lihat Koleksi →
                </p>

              </Link>


              {/* =================================================
                  CLEAN UP CREW
              ================================================== */}

              <Link
                to="/biota?category=Clean%20Up%20Crew"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-32 items-center justify-center rounded-xl bg-cyan-50">
                  <span className="text-6xl">
                    🐚
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Clean Up Crew
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Biota pendukung untuk membantu menjaga aquarium.
                </p>

                <p className="mt-5 font-bold text-cyan-600">
                  Lihat Koleksi →
                </p>

              </Link>


              {/* =================================================
                  MACROALGAE
              ================================================== */}

              <Link
                to="/biota?category=Macroalgae"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-32 items-center justify-center rounded-xl bg-cyan-50">
                  <span className="text-6xl">
                    🌿
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Macroalgae
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Pilihan macroalgae untuk refugium dan reef aquarium.
                </p>

                <p className="mt-5 font-bold text-cyan-600">
                  Lihat Koleksi →
                </p>

              </Link>


              {/* =================================================
                  EQUIPMENT
              ================================================== */}

              <Link
                to="/biota?category=Equipment"
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >

                <div className="flex h-32 items-center justify-center rounded-xl bg-cyan-50">
                  <span className="text-6xl">
                    ⚙️
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  Equipment
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Peralatan dan perlengkapan untuk kebutuhan aquarium laut.
                </p>

                <p className="mt-5 font-bold text-cyan-600">
                  Lihat Koleksi →
                </p>

              </Link>

            </div>
          </div>
        </section>


        {/* =====================================================
            BIOTA TERBARU
        ====================================================== */}

        <section className="bg-slate-50 px-6 py-20 sm:px-8">
          <div className="mx-auto max-w-7xl">

            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

              <div>

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                  Koleksi Terbaru
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                  Produk Terbaru
                </h2>

                <p className="mt-4 max-w-2xl leading-7 text-slate-600">
                  Lihat koleksi terbaru yang tersedia di Dark Reef Marine.
                </p>

              </div>

              <Link
                to="/biota"
                className="font-bold text-cyan-600 transition hover:text-cyan-700"
              >
                Lihat Semua →
              </Link>

            </div>


            {/* LOADING */}

            {loadingBiota ? (

              <div className="mt-10 rounded-3xl bg-white py-16 text-center shadow-sm">

                <div className="text-5xl">
                  🌊
                </div>

                <p className="mt-4 font-semibold text-slate-700">
                  Memuat koleksi terbaru...
                </p>

              </div>

            ) : biota.length > 0 ? (

              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

                {biota.map((item) => {

                  const stock = Number(item.stock || 0);

                  const price = Number(
                    item.retail_price ?? item.price ?? 0
                  );

                  return (

                    <article
                      key={item.id}
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                    >

                      {/* FOTO */}

                      <div className="relative aspect-square overflow-hidden bg-slate-200">

                        {item.image_url ? (

                          <img
                            src={item.image_url}
                            alt={item.name || "Produk"}
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center">

                            <div className="text-center">

                              <div className="text-6xl">
                                {item.category === "Coral"
                                  ? "🪸"
                                  : item.category === "Invertebrate"
                                  ? "🦐"
                                  : item.category === "Clean Up Crew"
                                  ? "🐚"
                                  : item.category === "Macroalgae"
                                  ? "🌿"
                                  : item.category === "Equipment"
                                  ? "⚙️"
                                  : "🐠"}
                              </div>

                              <p className="mt-2 text-xs text-slate-400">
                                Foto belum tersedia
                              </p>

                            </div>

                          </div>

                        )}


                        {/* STATUS */}

                        <div className="absolute right-3 top-3">

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

                      </div>


                      {/* INFO */}

                      <div className="p-5">

                        <p className="text-xs font-bold uppercase tracking-wider text-cyan-600">
                          {item.category || "Produk"}
                        </p>

                        <h3 className="mt-2 text-xl font-bold text-slate-950">
                          {item.name || "-"}
                        </h3>

                        <p className="mt-1 text-sm text-slate-400">
                          {item.english_name || "-"}
                        </p>


                        <div className="mt-4">

                          <p className="text-xs text-slate-400">
                            Harga
                          </p>

                          <p className="mt-1 text-lg font-bold text-cyan-600">
                            Rp {formatRupiah(price)}
                          </p>

                        </div>


                        <Link
                          to={`/biota/${item.id}`}
                          className="mt-5 block rounded-xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-cyan-600"
                        >
                          Lihat Detail
                        </Link>

                      </div>

                    </article>

                  );
                })}

              </div>

            ) : (

              <div className="mt-10 rounded-3xl bg-white py-16 text-center shadow-sm">

                <div className="text-5xl">
                  🌊
                </div>

                <h3 className="mt-4 text-xl font-bold text-slate-950">
                  Belum ada produk
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Koleksi akan muncul di sini setelah ditambahkan.
                </p>

              </div>

            )}

          </div>
        </section>


        {/* =====================================================
            JASA
        ====================================================== */}

        <section
          id="jasa"
          className="bg-cyan-50 px-6 py-20 sm:px-8"
        >
          <div className="mx-auto max-w-7xl">

            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">

              <div>

                <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                  Layanan
                </p>

                <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                  Aquarium Laut Tanpa Ribet
                </h2>

                <p className="mt-5 max-w-xl leading-7 text-slate-600">
                  Kami membantu kebutuhan aquarium laut Anda,
                  mulai dari konsultasi hingga perawatan aquarium.
                </p>

              </div>


              <div className="grid gap-4 sm:grid-cols-2">

                {/* SETTING AQUARIUM */}

                <div className="rounded-2xl bg-white p-6 shadow-sm">

                  <div className="text-3xl">
                    🌊
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Setting Aquarium
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Membantu menyiapkan aquarium laut sesuai kebutuhan.
                  </p>

                </div>


                {/* MAINTENANCE */}

                <div className="rounded-2xl bg-white p-6 shadow-sm">

                  <div className="text-3xl">
                    🧽
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Maintenance
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Perawatan aquarium agar tetap bersih dan terjaga.
                  </p>

                </div>


                {/* KONSULTASI */}

                <div className="rounded-2xl bg-white p-6 shadow-sm">

                  <div className="text-3xl">
                    💬
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Konsultasi
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Diskusikan kebutuhan biota dan aquarium Anda.
                  </p>

                </div>


                {/* MARINE LIVESTOCK */}

                <div className="rounded-2xl bg-white p-6 shadow-sm">

                  <div className="h-10 w-10">
                    <img
                      src="/scaping-coral.png"
                      alt="Marine Livestock"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-950">
                    Marine Livestock
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Berbagai pilihan livestock untuk reef aquarium.
                  </p>

                </div>

              </div>

            </div>
          </div>
        </section>


        {/* =====================================================
            TENTANG
        ====================================================== */}

        <section
          id="tentang"
          className="bg-white px-6 py-20 sm:px-8"
        >
          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
              Tentang Kami
            </p>

            <h2 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">
              Lebih dari Sekadar Menjual Biota
            </h2>

            <p className="mt-6 leading-8 text-slate-600">
              Dark Reef Marine hadir untuk membantu penghobi aquarium
              laut menemukan biota dan kebutuhan aquarium yang sesuai.
            </p>

            <p className="mt-4 leading-8 text-slate-600">
              Karena bagi kami, aquarium laut bukan hanya tentang memiliki
              biota yang indah, tetapi juga tentang menciptakan ekosistem
              yang sehat dan bisa dinikmati.
            </p>

          </div>
        </section>


        {/* =====================================================
            CONTACT
        ====================================================== */}

        <section
          id="contact"
          className="bg-slate-950 px-6 py-20 sm:px-8"
        >
          <div className="mx-auto max-w-3xl text-center">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Dark Reef Marine
            </p>

            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              Punya pertanyaan tentang aquarium laut?
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Hubungi kami untuk informasi biota, coral,
              equipment, kebutuhan aquarium, atau layanan kami.
            </p>

            <a
              href="https://wa.me/62895352446570?text=Halo%20Dark%20Reef%20Marine%2C%20saya%20ingin%20bertanya%20tentang%20biota%20dan%20layanan%20aquarium."
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex rounded-xl bg-cyan-600 px-7 py-3.5 font-bold text-white transition hover:bg-cyan-700"
            >
              Hubungi Dark Reef Marine
            </a>

          </div>
        </section>

      </main>


      {/* =====================================================
          FOOTER
      ====================================================== */}

      <footer className="bg-slate-950 px-6 py-8">

        <div className="mx-auto max-w-7xl border-t border-white/10 pt-8 text-center">

          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Dark Reef Marine.
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

export default Home;