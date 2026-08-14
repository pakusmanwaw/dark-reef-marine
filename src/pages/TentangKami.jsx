import Navbar from "../components/Navbar";

function TentangKami() {
  const whatsappUrl =
    "https://wa.me/62895352446570?text=Halo%20Dark%20Reef%20Marine%2C%20saya%20ingin%20bertanya%20tentang%20produk%20dan%20layanan%20Dark%20Reef%20Marine.";

  const tokopediaUrl = "https://tokopedia.com/darkreef";
  const shopeeUrl = "https://id.shp.ee/HDD9nkve";
  const mapsUrl = "https://maps.app.goo.gl/7RsUxvYTfkvS2Aqb9";

  const offerings = [
    {
      icon: "🐠",
      title: "Marine Fish",
      text: "Berbagai pilihan ikan laut untuk melengkapi dan menghidupkan aquarium marine.",
    },
    {
      icon: "",
      title: "Coral",
      text: "Pilihan coral untuk membantu membangun tampilan reef aquarium yang menarik.",
    },
    {
      icon: "🦐",
      title: "Invertebrate",
      text: "Beragam invertebrate sebagai bagian dari ekosistem aquarium laut.",
    },
    {
      icon: "🐚",
      title: "Clean Up Crew",
      text: "Biota pendukung aquarium untuk membantu menjaga kebersihan dan keseimbangan.",
    },
    {
      icon: "🌿",
      title: "Macroalgae",
      text: "Macroalgae untuk kebutuhan refugium maupun tampilan reef aquarium.",
    },
    {
      icon: "⚙️",
      title: "Equipment",
      text: "Berbagai perlengkapan untuk membantu kebutuhan setup dan perawatan aquarium.",
    },
  ];

  const services = [
    {
      icon: "🌊",
      title: "Setting Aquarium dari 0",
      text: "Membantu menyiapkan aquarium dari awal, dengan ukuran dan kebutuhan yang dapat disesuaikan.",
    },
    {
      icon: "🔧",
      title: "Maintenance Aquarium",
      text: "Perawatan aquarium agar tetap bersih, nyaman dilihat, dan terjaga kondisinya.",
    },
    {
      icon: "🧪",
      title: "Jasa Test Kit",
      text: "Pengecekan parameter air untuk membantu mengetahui kondisi aquarium.",
    },
    {
      icon: "🪸",
      title: "Pembuatan Batu Scaping",
      text: "Pembuatan dan penyesuaian batu scaping untuk membantu membentuk layout aquarium sesuai konsep.",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-slate-950 px-6 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Tentang Dark Reef Marine
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Lebih dari Sekadar Menjual Biota
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              Dark Reef Marine hadir untuk membantu customer menikmati dunia
              aquarium laut, mulai dari memilih biota, memenuhi kebutuhan
              aquarium, sampai mendapatkan layanan yang dibutuhkan untuk
              setup dan perawatannya.
            </p>

            <p className="mt-5 max-w-3xl text-base font-semibold text-cyan-300">
              We Sell with Love, Not Just for Money.
            </p>
          </div>
        </div>
      </section>

      {/* STORY */}
      <main>
        <section className="px-6 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                Tentang Kami
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Dunia aquarium laut yang dibuat lebih mudah dipahami
              </h2>

              <p className="mt-6 leading-8 text-slate-600">
                Dark Reef Marine bergerak di dunia marine aquarium dengan
                menyediakan berbagai kebutuhan mulai dari biota laut sampai
                perlengkapan aquarium.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                Kami ingin customer tidak hanya menemukan produk, tetapi juga
                mendapatkan gambaran yang lebih jelas tentang biota,
                kebutuhan aquarium, dan layanan yang dapat membantu mereka.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                Karena bagi kami, aquarium laut bukan sekadar dekorasi.
                Ada ekosistem, perawatan, proses belajar, dan tentu saja
                kecintaan terhadap biota yang dipelihara.
              </p>
            </div>

            <div className="rounded-3xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                Prinsip Kami
              </p>

              <h3 className="mt-3 text-2xl font-bold text-slate-950">
                Love the hobby. Respect the livestock.
              </h3>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-bold text-slate-950">
                    Informasi yang mudah dipahami
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Kami berusaha menyajikan informasi yang lebih sederhana
                    agar customer, termasuk yang baru mulai, lebih mudah
                    memahami kebutuhan aquarium.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-bold text-slate-950">
                    Biota dan kebutuhan aquarium
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Dari marine fish dan coral sampai equipment dan kebutuhan
                    pendukung lainnya.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="font-bold text-slate-950">
                    Pendampingan lewat layanan
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Kami juga menyediakan layanan aquarium agar customer dapat
                    berkonsultasi sesuai kebutuhan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WHAT WE OFFER */}
        <section className="bg-white px-6 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                Apa yang Kami Sediakan
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Kebutuhan marine aquarium dalam satu tempat
              </h2>

              <p className="mt-4 leading-7 text-slate-500">
                Pilihan produk Dark Reef Marine mencakup berbagai kategori
                untuk membantu kebutuhan reef aquarium.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {offerings.map((item) => (
                <article
                  key={item.title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-3xl">
                    {item.icon}
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-950">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="bg-cyan-50 px-6 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-700">
                Jasa Aquarium
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Tidak hanya menjual, kami juga membantu setup dan perawatan
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Customer dapat berkonsultasi terlebih dahulu mengenai kebutuhan
                aquarium dan layanan yang paling sesuai.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {services.map((service) => (
                <article
                  key={service.title}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-cyan-100"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-3xl">
                    {service.icon}
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-slate-950">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.text}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-3xl bg-slate-950 p-7 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                Butuh Bantuan?
              </p>

              <h3 className="mt-3 text-2xl font-bold text-white">
                Ceritakan aquarium yang ingin Anda buat atau rawat.
              </h3>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-7 py-3.5 font-bold text-white transition hover:bg-cyan-500"
              >
                💬 Konsultasi via WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* SHOP + CONTACT */}
        <section className="px-6 py-16 sm:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
                Temukan Kami
              </p>

              <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
                Pilih cara yang paling nyaman untuk terhubung dengan DRM
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-500">
                Lihat produk di marketplace, konsultasi langsung melalui
                WhatsApp, atau kunjungi lokasi toko melalui Google Maps.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              <a
                href={tokopediaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  🛒
                </div>

                <h3 className="mt-4 font-bold text-slate-950">
                  Tokopedia
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Lihat dan order produk Dark Reef Marine melalui Tokopedia.
                </p>

                <span className="mt-4 inline-block font-bold text-cyan-700">
                  Buka Tokopedia →
                </span>
              </a>

              <a
                href={shopeeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                  🛍️
                </div>

                <h3 className="mt-4 font-bold text-slate-950">
                  Shopee
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Kunjungi toko Dark Reef Marine dan lihat produk yang tersedia.
                </p>

                <span className="mt-4 inline-block font-bold text-cyan-700">
                  Buka Shopee →
                </span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
                  💬
                </div>

                <h3 className="mt-4 font-bold text-slate-950">
                  WhatsApp
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Konsultasi produk, jasa aquarium, atau kebutuhan aquarium Anda.
                </p>

                <span className="mt-4 inline-block font-bold text-cyan-700">
                  Chat WhatsApp →
                </span>
              </a>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-3xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-2xl">
                  📍
                </div>

                <h3 className="mt-4 font-bold text-slate-950">
                  Lokasi Toko
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Buka titik lokasi toko Dark Reef Marine melalui Google Maps.
                </p>

                <span className="mt-4 inline-block font-bold text-cyan-700">
                  Buka Google Maps →
                </span>
              </a>
            </div>

            <div className="mt-8 rounded-3xl bg-slate-950 p-7 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
                Alamat & Lokasi
              </p>

              <h3 className="mt-3 text-2xl font-bold text-white">
                Lokasi toko Dark Reef Marine
              </h3>

              <p className="mx-auto mt-3 max-w-2xl leading-7 text-slate-400">
                Untuk alamat lengkap dan titik lokasi terbaru, gunakan tombol
                Google Maps di bawah. Link ini adalah titik lokasi toko DRM
                yang Anda berikan.
              </p>

              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 font-bold text-slate-950 transition hover:bg-slate-100"
              >
                📍 Lihat Alamat Lengkap di Google Maps
              </a>
            </div>
          </div>
        </section>

        {/* FINAL */}
        <section className="bg-slate-950 px-6 py-20 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Dark Reef Marine
            </p>

            <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
              We Sell with Love, Not Just for Money.
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              Terima kasih sudah mengenal Dark Reef Marine. Semoga kami bisa
              menjadi bagian dari perjalanan aquarium laut Anda.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-7 py-3.5 font-bold text-white transition hover:bg-cyan-500"
            >
              💬 Hubungi Dark Reef Marine
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-slate-950 px-6 py-8">
        <div className="mx-auto max-w-7xl border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Dark Reef Marine. All rights reserved.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            We Sell with Love, Not Just for Money.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default TentangKami;
