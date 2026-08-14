import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../services/supabase";

import {
  useAuth,
} from "../context/useAuth";


function EmployeeSalesHistory() {
  const { profile } = useAuth();

  const navigate = useNavigate();

  const [sales, setSales] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState("");


  // =====================================================
  // LOAD RIWAYAT NOTA
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadSalesHistory() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data,
          error,
        } = await supabase
          .from("sales")
          .select(`
            id,
            invoice_number,
            sale_number,
            customer_name,
            sale_type,
            subtotal,
            discount,
            total,
            total_amount,
            status,
            created_at,
            created_by
          `)
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

        if (cancelled) {
          return;
        }

        if (error) {
          console.error(
            "Gagal mengambil riwayat nota:",
            error
          );

          setErrorMessage(
            error.message ||
            "Gagal mengambil riwayat nota."
          );

          setSales([]);

          return;
        }

        setSales(data || []);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Sales history error:",
            error
          );

          setErrorMessage(
            error?.message ||
            "Terjadi kesalahan saat mengambil riwayat nota."
          );

          setSales([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadSalesHistory();

    return () => {
      cancelled = true;
    };
  }, []);


  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  function formatRupiah(value) {
    return Number(
      value || 0
    ).toLocaleString("id-ID");
  }


  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }


  // =====================================================
  // FORMAT JAM
  // =====================================================

  function formatTime(value) {
    if (!value) {
      return "";
    }

    return new Date(
      value
    ).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }


  // =====================================================
  // BUKA DETAIL NOTA
  // =====================================================

  function handleOpenSale(saleId) {
    navigate(
      `/employee/sales-history/${saleId}`
    );
  }


  // =====================================================
  // KEMBALI
  // =====================================================

  function handleBack() {
    navigate("/employee");
  }


  // =====================================================
  // BUAT NOTA BARU
  // =====================================================

  function handleNewSale() {
    navigate("/employee/sales");
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-5xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <button
              type="button"
              onClick={handleBack}
              className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
            >
              ← Kembali ke Dashboard
            </button>


            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 sm:text-sm">
              Dark Reef Marine
            </p>


            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Riwayat Nota
            </h1>


            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Lihat kembali nota yang pernah dibuat.
            </p>

          </div>


          {/* PEGAWAI */}

          <div className="rounded-xl bg-white px-4 py-3 shadow-sm">

            <p className="text-xs text-slate-400">
              Pegawai
            </p>


            <p className="mt-1 text-sm font-bold text-slate-800">
              {profile?.full_name ||
                "Employee"}
            </p>

          </div>

        </header>


        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold text-red-700">
              ⚠️{" "}
              {errorMessage}
            </p>

          </div>
        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (
          <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />


            <p className="mt-4 text-sm font-medium text-slate-500">
              Memuat riwayat nota...
            </p>

          </div>
        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          !errorMessage &&
          sales.length === 0 && (

            <div className="mt-6 rounded-2xl bg-white p-10 text-center shadow-sm">

              <div className="text-5xl">
                🧾
              </div>


              <h2 className="mt-5 text-xl font-bold">
                Belum Ada Nota
              </h2>


              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Belum ada transaksi penjualan
                yang tersimpan di sistem
                Dark Reef Marine.
              </p>


              <button
                type="button"
                onClick={handleNewSale}
                className="mt-6 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
              >
                🧾 Buat Nota
              </button>

            </div>
          )}


        {/* =================================================
            JUMLAH NOTA
        ================================================= */}

        {!loading &&
          sales.length > 0 && (

            <div className="mt-6 rounded-2xl bg-white px-5 py-4 shadow-sm">

              <p className="text-sm text-slate-500">

                Total nota:

                <span className="ml-1 font-bold text-slate-900">
                  {sales.length}
                </span>

              </p>

            </div>
          )}


        {/* =================================================
            LIST NOTA
        ================================================= */}

        {!loading &&
          sales.length > 0 && (

            <section className="mt-4 space-y-4">

              {sales.map(
                (sale) => {

                  const invoiceNumber =
                    sale.invoice_number ||
                    sale.sale_number ||
                    `Nota #${sale.id}`;


                  const saleTotal =
                    sale.total_amount ??
                    sale.total ??
                    0;


                  const saleType =
                    sale.sale_type ===
                    "reseller"
                      ? "Reseller"
                      : "Retail";


                  const saleTypeClass =
                    sale.sale_type ===
                    "reseller"
                      ? "bg-violet-50 text-violet-700"
                      : "bg-cyan-50 text-cyan-700";


                  return (
                    <button
                      key={sale.id}
                      type="button"
                      onClick={() =>
                        handleOpenSale(
                          sale.id
                        )
                      }
                      className="group w-full rounded-2xl bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
                    >

                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                        {/* =================================================
                            INFORMASI NOTA
                        ================================================= */}

                        <div className="min-w-0">

                          <div className="flex flex-wrap items-center gap-2">

                            <span
                              className={`rounded-lg px-3 py-1.5 text-xs font-bold ${saleTypeClass}`}
                            >
                              {saleType}
                            </span>


                            <span className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-600">
                              {sale.status ||
                                "completed"}
                            </span>

                          </div>


                          <h2 className="mt-3 truncate text-lg font-bold text-slate-900 sm:text-xl">
                            {invoiceNumber}
                          </h2>


                          <p className="mt-1 text-sm text-slate-500">

                            Customer:

                            <span className="ml-1 font-semibold text-slate-700">
                              {sale.customer_name ||
                                "Customer"}
                            </span>

                          </p>


                          <p className="mt-1 text-xs text-slate-400">

                            {formatDate(
                              sale.created_at
                            )}

                            {" • "}

                            {formatTime(
                              sale.created_at
                            )}

                          </p>

                        </div>


                        {/* =================================================
                            TOTAL
                        ================================================= */}

                        <div className="flex items-center justify-between gap-6 lg:justify-end">

                          <div>

                            <p className="text-xs font-medium text-slate-400">
                              Total
                            </p>


                            <p className="mt-1 text-xl font-bold text-cyan-600">
                              Rp{" "}
                              {formatRupiah(
                                saleTotal
                              )}
                            </p>

                          </div>


                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl text-slate-400 transition group-hover:bg-cyan-50 group-hover:text-cyan-600">
                            →
                          </div>

                        </div>

                      </div>

                    </button>
                  );
                }
              )}

            </section>
          )}


        {/* =================================================
            BOTTOM ACTION
        ================================================= */}

        {!loading &&
          sales.length > 0 && (

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">

              <button
                type="button"
                onClick={handleBack}
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                ← Dashboard
              </button>


              <button
                type="button"
                onClick={handleNewSale}
                className="rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
              >
                + Buat Nota Baru
              </button>

            </div>
          )}

      </div>

    </main>
  );
}


export default EmployeeSalesHistory;