import Navbar from "../components/Navbar";

function JasaAquarium() {
  const whatsappBase = "https://wa.me/62895352446570";

  const services = [
    {
      icon: "🐠",
      title: "Setting Aquarium dari 0",
      description:
        "Mulai dari aquarium kosong sampai siap digunakan. Kami membantu menentukan konsep, ukuran, layout, dan kebutuhan setup sesuai kebutuhan Anda.",
      points: [
        "Konsep dan layout aquarium",
        "Berbagai pilihan ukuran",
        "Penyesuaian kebutuhan setup",
      ],
      message:
        "Halo Dark Reef Marine, saya tertarik dengan jasa setting aquarium dari 0. Saya ingin konsultasi mengenai ukuran dan konsep aquarium.",
    },
    {
      icon: "🔧",
      title: "Maintenance Aquarium",
      description:
        "Perawatan aquarium untuk membantu menjaga kondisi aquarium tetap bersih, rapi, dan nyaman untuk biota di dalamnya.",
      points: [
        "Perawatan rutin",
        "Pembersihan aquarium",
        "Pengecekan kondisi aquarium",
      ],
      message:
        "Halo Dark Reef Marine, saya tertarik dengan jasa maintenance aquarium dan ingin konsultasi mengenai perawatan aquarium saya.",
    },
    {
      icon: "🧪",
      title: "Jasa Test Kit",
      description:
        "Pengecekan parameter air menggunakan test kit untuk membantu mengetahui kondisi air aquarium Anda.",
      points: [
        "Pengecekan parameter air",
        "Informasi hasil test",
        "Konsultasi setelah hasil test",
      ],
      message:
        "Halo Dark Reef Marine, saya tertarik dengan jasa test kit aquarium dan ingin konsultasi mengenai parameter air saya.",
    },
    {
      icon: "/scaping-coral.png",
      iconIsImage: true,
      title: "Pembuatan Batu Scaping",
      description:
        "Pembuatan dan penyesuaian batu scaping untuk membantu membentuk layout aquarium sesuai ukuran dan konsep yang diinginkan.",
      points: [
        "Penyesuaian ukuran",
        "Layout sesuai konsep",
        "Konsultasi bentuk dan susunan",
      ],
      message:
        "Halo Dark Reef Marine, saya tertarik dengan jasa pembuatan batu scaping dan ingin konsultasi mengenai konsep serta ukurannya.",
    },
  ];

  const makeWhatsappUrl = (message) =>
    `${whatsappBase}?text=${encodeURIComponent(message)}`;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Navbar />

      {/* HERO */}
      <section className="bg-slate-950 px-6 py-20 sm:px-8 lg:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
              Dark Reef Marine
            </p>

            <h1 className="mt-4 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
              Jasa Aquarium untuk Kebutuhan Anda
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Mulai dari setting aquarium dari 0, perawatan rutin, pengecekan
              parameter air, sampai pembuatan batu scaping.
            </p>

            <a
              href={makeWhatsappUrl(
                "Halo Dark Reef Marine, saya ingin konsultasi mengenai jasa aquarium."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-6 py-3.5 font-bold text-white transition hover:bg-cyan-500"
            >
              💬 Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <main className="px-6 py-14 sm:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-600">
              Layanan Kami
            </p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">
              Pilih jasa yang Anda butuhkan
            </h2>
            <p className="mt-4 leading-7 text-slate-500">
              Konsultasikan kebutuhan aquarium Anda dengan Dark Reef Marine.
            </p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.title}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-cyan-50 p-2">
                    {service.iconIsImage ? (
                      <img
                        src={service.icon}
                        alt={service.title}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-3xl">
                        {service.icon}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-slate-950">
                      {service.title}
                    </h3>
                    <p className="mt-3 leading-7 text-slate-600">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">
                    Yang kami bantu
                  </p>

                  <div className="mt-3 space-y-2">
                    {service.points.map((point) => (
                      <div
                        key={point}
                        className="flex items-start gap-2 text-sm text-slate-600"
                      >
                        <span className="mt-0.5 font-bold text-cyan-600">✓</span>
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={makeWhatsappUrl(service.message)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 block w-full rounded-xl bg-cyan-600 px-5 py-3.5 text-center font-bold text-white transition hover:bg-cyan-500"
                >
                  💬 Konsultasi Jasa Ini
                </a>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* FINAL CTA */}
      <section className="bg-slate-950 px-6 py-20 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Dark Reef Marine
          </p>

          <h2 className="mt-4 text-3xl font-bold text-white sm:text-4xl">
            Bingung mulai dari mana?
          </h2>

          <p className="mt-4 leading-7 text-slate-400">
            Ceritakan ukuran aquarium, kebutuhan, atau kondisi aquarium Anda.
            Kami bantu arahkan ke jasa yang paling sesuai.
          </p>

          <a
            href={makeWhatsappUrl(
              "Halo Dark Reef Marine, saya ingin konsultasi mengenai jasa aquarium dan belum tahu layanan yang paling sesuai untuk kebutuhan saya."
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-cyan-600 px-7 py-3.5 font-bold text-white transition hover:bg-cyan-500"
          >
            💬 Hubungi Dark Reef Marine
          </a>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 px-6 py-8">
        <div className="mx-auto max-w-7xl border-t border-white/10 pt-8 text-center">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} Dark Reef Marine. All rights reserved.
          </p>

          <p className="mt-2 text-sm text-slate-500">
            We Sell with Love.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default JasaAquarium;
