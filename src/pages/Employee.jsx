import { useAuth } from "../context/useAuth";
import { useNavigate } from "react-router-dom";

function Employee() {
  const {
    profile,
    logout,
  } = useAuth();

  const navigate = useNavigate();

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleLogout() {
    const result = await logout();

    if (result?.success) {
      window.location.replace("/login");
    } else {
      console.error(
        "Logout gagal:",
        result?.error
      );
    }
  }

  // =====================================================
  // NAVIGATION
  // =====================================================

  function goToSales() {
    navigate("/employee/sales");
  }

  function goToLoss() {
    navigate("/employee/loss");
  }

  function goToSalesHistory() {
    navigate("/employee/sales-history");
  }

  function goToLossHistory() {
    navigate("/employee/loss-history");
  }

  // =====================================================
  // DASHBOARD
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-4xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 sm:text-sm">
              Dark Reef Marine
            </p>


            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Ehhh son!
            </h1>


            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Pusat aktivitas pegawai Dark Reef Marine.
            </p>

          </div>


          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            <span>
              ↪
            </span>

            Logout
          </button>

        </header>


        {/* =================================================
            WELCOME
        ================================================= */}

        <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm sm:p-8">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <p className="text-sm font-medium text-slate-400">
                Selamat bekerja,
              </p>


              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {profile?.full_name ||
                  "Pegawai Dark Reef"}
              </h2>


              <p className="mt-2 text-sm text-slate-500">
                Silakan pilih aktivitas yang ingin dilakukan.
              </p>

            </div>


            <div className="inline-flex w-fit rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              Role:{" "}
              {profile?.role ||
                "employee"}
            </div>

          </div>

        </section>


        {/* =================================================
            MENU UTAMA
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2">


          {/* =================================================
              BUAT NOTA
          ================================================= */}

          <button
            type="button"
            onClick={goToSales}
            className="group rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-3xl transition group-hover:bg-cyan-100">
                🧾
              </div>


              <span className="text-xl text-slate-300 transition group-hover:text-cyan-500">
                →
              </span>

            </div>


            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Buat Nota Penjualan
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Buat nota baru untuk transaksi
              Retail maupun Reseller.
            </p>

          </button>


          {/* =================================================
              CATAT KERUGIAN
          ================================================= */}

          <button
            type="button"
            onClick={goToLoss}
            className="group rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-3xl transition group-hover:bg-amber-100">
                ⚠️
              </div>


              <span className="text-xl text-slate-300 transition group-hover:text-amber-500">
                →
              </span>

            </div>


            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Catat Kerugian
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Catat biota yang mati atau diberikan
              sebagai bonus kepada customer.
            </p>

          </button>


          {/* =================================================
              RIWAYAT NOTA
          ================================================= */}

          <button
            type="button"
            onClick={
              goToSalesHistory
            }
            className="group rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-3xl transition group-hover:bg-slate-200">
                📋
              </div>


              <span className="text-xl text-slate-300 transition group-hover:text-slate-600">
                →
              </span>

            </div>


            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Riwayat Nota
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Lihat nota yang pernah dibuat dan
              export ulang nota dalam bentuk JPG.
            </p>

          </button>


          {/* =================================================
              RIWAYAT KERUGIAN
          ================================================= */}

          <button
            type="button"
            onClick={
              goToLossHistory
            }
            className="group rounded-2xl bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-3xl transition group-hover:bg-red-100">
                📦
              </div>


              <span className="text-xl text-slate-300 transition group-hover:text-red-500">
                →
              </span>

            </div>


            <h3 className="mt-5 text-xl font-bold text-slate-900">
              Riwayat Kerugian
            </h3>


            <p className="mt-2 text-sm leading-6 text-slate-500">
              Lihat catatan biota mati dan bonus
              yang pernah dicatat.
            </p>

          </button>

        </section>


        {/* =================================================
            INFORMASI
        ================================================= */}

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex gap-3">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-lg">
              ℹ️
            </div>


            <div>

              <h3 className="font-bold text-slate-800">
                Catatan
              </h3>


              <p className="mt-1 text-sm leading-6 text-slate-500">
                Setiap transaksi penjualan dan
                pencatatan kerugian akan tersimpan
                sebagai riwayat sehingga dapat
                diperiksa kembali.
              </p>

            </div>

          </div>

        </section>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="py-8 text-center">

          <p className="text-xs text-slate-400">
            Dark Reef Marine
          </p>

          <p className="mt-1 text-xs text-slate-400">
            We Sell with Love, Not Just for Money.
          </p>

        </footer>

      </div>

    </main>
  );
}

export default Employee;