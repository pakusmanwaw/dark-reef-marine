import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import { supabase } from "../services/supabase";


function OwnerSales() {

  const navigate = useNavigate();


  // =========================================================
  // STATE
  // =========================================================

  const [sales, setSales] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [dateFilter, setDateFilter] =
    useState("");

  const [channelFilter, setChannelFilter] =
    useState("all");

  // =========================================================
  // DETAIL NOTA
  // =========================================================

  const [selectedSale, setSelectedSale] =
    useState(null);

  const [selectedSaleItems, setSelectedSaleItems] =
    useState([]);

  const [detailLoading, setDetailLoading] =
    useState(false);

  const [detailError, setDetailError] =
    useState("");


  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  function formatRupiah(value) {

    return Number(
      value || 0
    ).toLocaleString(
      "id-ID"
    );

  }


  // =========================================================
  // FORMAT TANGGAL
  // =========================================================

  function formatDate(value) {

    if (!value) {
      return "-";
    }

    return new Date(
      value
    ).toLocaleString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  }


  // =========================================================
  // LOCAL DATE KEY
  //
  // Contoh:
  // 2026-08-13T04:02:33.000Z
  //
  // menjadi:
  // 2026-08-13
  // =========================================================

  function getLocalDateKey(value) {

    if (!value) {
      return "";
    }

    const date =
      new Date(value);

    const year =
      date.getFullYear();

    const month =
      String(
        date.getMonth() + 1
      ).padStart(
        2,
        "0"
      );

    const day =
      String(
        date.getDate()
      ).padStart(
        2,
        "0"
      );

    return `${year}-${month}-${day}`;

  }


  // =========================================================
  // LOAD SALES
  // =========================================================

  async function loadSales() {

    setLoading(true);

    setError("");


    const {
      data,
      error: salesError,
    } = await supabase

      .from("sales")

      .select(`
        id,
        sale_number,
        invoice_number,
        customer_name,
        sale_type,
        owner_sale_type,
        subtotal,
        total,
        total_amount,
        owner_total,
        created_by,
        status,
        created_at
      `)

      .order(
        "created_at",
        {
          ascending: false,
        }
      );


    if (salesError) {

      console.error(
        "Gagal mengambil laporan penjualan:",
        salesError
      );

      setError(
        `Gagal mengambil data penjualan: ${salesError.message}`
      );

      setSales([]);

    } else {

      setSales(
        data || []
      );

    }


    setLoading(false);

  }


  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {

    let cancelled = false;


    async function initialLoad() {

      const {
        data,
        error: salesError,
      } = await supabase

        .from("sales")

        .select(`
          id,
          sale_number,
          invoice_number,
          customer_name,
          sale_type,
          owner_sale_type,
          subtotal,
          total,
          total_amount,
          owner_total,
          created_by,
          status,
          created_at
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


      if (salesError) {

        console.error(
          "Gagal mengambil laporan penjualan:",
          salesError
        );

        setError(
          `Gagal mengambil data penjualan: ${salesError.message}`
        );

        setSales([]);

      } else {

        setSales(
          data || []
        );

      }


      setLoading(false);

    }


    initialLoad();


    return () => {

      cancelled = true;

    };

  }, []);


  // =========================================================
  // LABEL CHANNEL
  // =========================================================

  function getChannelLabel(
    saleType
  ) {

    if (
      saleType ===
      "retail"
    ) {

      return "Retail";

    }


    if (
      saleType ===
      "reseller"
    ) {

      return "Reseller";

    }


    if (
      saleType ===
      "online_shop"
    ) {

      return "Online Shop";

    }


    return saleType || "-";

  }


  // =========================================================
  // CHANNEL STYLE
  // =========================================================

  function getChannelClass(
    saleType
  ) {

    if (
      saleType ===
      "retail"
    ) {

      return "bg-cyan-100 text-cyan-700";

    }


    if (
      saleType ===
      "reseller"
    ) {

      return "bg-violet-100 text-violet-700";

    }


    if (
      saleType ===
      "online_shop"
    ) {

      return "bg-amber-100 text-amber-700";

    }


    return "bg-slate-100 text-slate-600";

  }


  // =========================================================
  // FILTER SALES
  // =========================================================

  const filteredSales =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();


      return sales.filter(
        (sale) => {

          // =================================================
          // SEARCH
          // =================================================

          const matchesSearch =
            !keyword ||

            sale.sale_number
              ?.toLowerCase()
              .includes(
                keyword
              ) ||

            sale.invoice_number
              ?.toLowerCase()
              .includes(
                keyword
              ) ||

            sale.customer_name
              ?.toLowerCase()
              .includes(
                keyword
              );


          // =================================================
          // DATE
          // =================================================

          const matchesDate =
            !dateFilter ||
            getLocalDateKey(
              sale.created_at
            ) === dateFilter;


          // =================================================
          // CHANNEL
          // =================================================

          const matchesChannel =
            channelFilter ===
              "all" ||

            sale.sale_type ===
              channelFilter;


          return (
            matchesSearch &&
            matchesDate &&
            matchesChannel
          );

        }
      );

    }, [
      sales,
      search,
      dateFilter,
      channelFilter,
    ]);


  // =========================================================
  // STATISTICS
  // =========================================================

  const statistics =
    useMemo(() => {

      const ownerTotal =
        filteredSales.reduce(
          (
            sum,
            sale
          ) => {

            return (
              sum +
              Number(
                sale.owner_total ||
                  0
              )
            );

          },
          0
        );


      const customerTotal =
        filteredSales.reduce(
          (
            sum,
            sale
          ) => {

            return (
              sum +
              Number(
                sale.total_amount ||
                  sale.total ||
                  0
              )
            );

          },
          0
        );


      const onlineShopTotal =
        filteredSales

          .filter(
            (sale) =>
              sale.sale_type ===
              "online_shop"
          )

          .reduce(
            (
              sum,
              sale
            ) => {

              return (
                sum +
                Number(
                  sale.owner_total ||
                    0
                )
              );

            },
            0
          );


      const retailTotal =
        filteredSales

          .filter(
            (sale) =>
              sale.sale_type ===
              "retail"
          )

          .reduce(
            (
              sum,
              sale
            ) => {

              return (
                sum +
                Number(
                  sale.owner_total ||
                    0
                )
              );

            },
            0
          );


      const resellerTotal =
        filteredSales

          .filter(
            (sale) =>
              sale.sale_type ===
              "reseller"
          )

          .reduce(
            (
              sum,
              sale
            ) => {

              return (
                sum +
                Number(
                  sale.owner_total ||
                    0
                )
              );

            },
            0
          );


      const marketplaceFee =
        filteredSales

          .filter(
            (sale) =>
              sale.sale_type ===
              "online_shop"
          )

          .reduce(
            (
              sum,
              sale
            ) => {

              const customer =
                Number(
                  sale.total_amount ||
                    sale.total ||
                    0
                );


              const owner =
                Number(
                  sale.owner_total ||
                    0
                );


              return (
                sum +
                Math.max(
                  customer -
                    owner,
                  0
                )
              );

            },
            0
          );


      return {

        transactionCount:
          filteredSales.length,

        ownerTotal,

        customerTotal,

        onlineShopTotal,

        retailTotal,

        resellerTotal,

        marketplaceFee,

      };

    }, [
      filteredSales,
    ]);


  // =========================================================
  // RESET FILTER
  // =========================================================

  function resetFilters() {

    setSearch("");

    setDateFilter("");

    setChannelFilter(
      "all"
    );

  }


  // =========================================================
  // OPEN DETAIL NOTA
  // =========================================================

  async function handleOpenSaleDetail(sale) {

    setSelectedSale(sale);

    setSelectedSaleItems([]);

    setDetailError("");

    setDetailLoading(true);

    try {

      const {
        data: itemData,
        error: itemError,
      } = await supabase
        .from("sale_items")
        .select(`
          id,
          sale_id,
          biota_id,
          quantity,
          unit_price,
          unit_cost,
          is_bonus,
          product_name,
          subtotal
        `)
        .eq("sale_id", sale.id)
        .order("id", {
          ascending: true,
        });

      if (itemError) {
        throw itemError;
      }

      setSelectedSaleItems(
        itemData || []
      );

    } catch (error) {

      console.error(
        "Gagal mengambil detail nota:",
        error
      );

      setDetailError(
        error?.message ||
          "Gagal mengambil detail produk nota."
      );

      setSelectedSaleItems([]);

    } finally {

      setDetailLoading(false);

    }

  }


  function handleCloseSaleDetail() {

    setSelectedSale(null);

    setSelectedSaleItems([]);

    setDetailError("");

    setDetailLoading(false);

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-7xl">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
              Dark Reef Marine
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Laporan Penjualan
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Monitoring transaksi dan nilai
              penjualan yang dihitung untuk Owner.
            </p>

          </div>


          <div className="flex flex-wrap gap-2">

            <button
              type="button"
              onClick={loadSales}
              disabled={loading}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading
                ? "Memuat..."
                : "↻ Refresh"}

            </button>


            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin"
                )
              }
              className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >

              ← Owner Dashboard

            </button>

          </div>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">

            {error}

          </div>

        )}


        {/* =================================================
            STAT CARDS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">


          {/* OWNER TOTAL */}

          <div className="rounded-2xl bg-slate-900 p-5 text-white shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">
              Nilai Penjualan Owner
            </p>

            <p className="mt-3 text-2xl font-bold">
              Rp{" "}
              {formatRupiah(
                statistics.ownerTotal
              )}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Nilai yang digunakan dalam
              laporan Owner.
            </p>

          </div>


          {/* TRANSACTIONS */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transaksi
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              {
                statistics.transactionCount
              }
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Transaksi sesuai filter.
            </p>

          </div>


          {/* CUSTOMER TOTAL */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Dibayar Customer
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              Rp{" "}
              {formatRupiah(
                statistics.customerTotal
              )}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Termasuk harga Online Shop.
            </p>

          </div>


          {/* MARKETPLACE FEE */}

          <div className="rounded-2xl bg-amber-50 p-5 shadow-sm">

            <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Selisih Online Shop
            </p>

            <p className="mt-3 text-2xl font-bold text-amber-700">
              Rp{" "}
              {formatRupiah(
                statistics.marketplaceFee
              )}
            </p>

            <p className="mt-2 text-xs text-amber-600">
              Selisih harga customer dengan
              nilai Owner.
            </p>

          </div>

        </div>


        {/* =================================================
            CHANNEL SUMMARY
        ================================================= */}

        <div className="mt-6 grid gap-4 md:grid-cols-3">


          {/* RETAIL */}

          <div className="rounded-2xl border border-cyan-100 bg-cyan-50 p-5">

            <p className="text-sm font-bold text-cyan-700">
              Retail
            </p>

            <p className="mt-2 text-xl font-bold text-cyan-900">
              Rp{" "}
              {formatRupiah(
                statistics.retailTotal
              )}
            </p>

          </div>


          {/* RESELLER */}

          <div className="rounded-2xl border border-violet-100 bg-violet-50 p-5">

            <p className="text-sm font-bold text-violet-700">
              Reseller
            </p>

            <p className="mt-2 text-xl font-bold text-violet-900">
              Rp{" "}
              {formatRupiah(
                statistics.resellerTotal
              )}
            </p>

          </div>


          {/* ONLINE SHOP */}

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5">

            <p className="text-sm font-bold text-amber-700">
              Online Shop
            </p>

            <p className="mt-2 text-xl font-bold text-amber-900">
              Rp{" "}
              {formatRupiah(
                statistics.onlineShopTotal
              )}
            </p>

            <p className="mt-1 text-xs text-amber-600">
              Berdasarkan nilai Owner.
            </p>

          </div>

        </div>


        {/* =================================================
            FILTER
        ================================================= */}

        <section className="mt-8 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px_auto]">


            {/* =================================================
                SEARCH
            ================================================= */}

            <div>

              <label
                htmlFor="sales-search"
                className="block text-sm font-bold text-slate-800"
              >
                Cari Transaksi
              </label>

              <div className="relative mt-2">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  id="sales-search"
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Cari nomor nota atau nama customer..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />

              </div>

            </div>


            {/* =================================================
                DATE
            ================================================= */}

            <div>

              <label
                htmlFor="sales-date"
                className="block text-sm font-bold text-slate-800"
              >
                Tanggal
              </label>

              <input
                id="sales-date"
                type="date"
                value={
                  dateFilter
                }
                onChange={(event) =>
                  setDateFilter(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />

            </div>


            {/* =================================================
                CHANNEL
            ================================================= */}

            <div>

              <label
                htmlFor="channel-filter"
                className="block text-sm font-bold text-slate-800"
              >
                Channel Penjualan
              </label>

              <select
                id="channel-filter"
                value={
                  channelFilter
                }
                onChange={(event) =>
                  setChannelFilter(
                    event.target.value
                  )
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500"
              >

                <option value="all">
                  Semua Channel
                </option>

                <option value="retail">
                  Retail
                </option>

                <option value="reseller">
                  Reseller
                </option>

                <option value="online_shop">
                  Online Shop
                </option>

              </select>

            </div>


            {/* =================================================
                RESET
            ================================================= */}

            <div className="flex items-end">

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 lg:w-auto"
              >
                Reset
              </button>

            </div>

          </div>

        </section>


        {/* =================================================
            SALES TABLE
        ================================================= */}

        <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-5">

            <h2 className="text-xl font-bold">
              Riwayat Penjualan
            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Menampilkan{" "}

              <span className="font-bold text-slate-700">

                {
                  filteredSales.length
                }

              </span>{" "}

              transaksi.

            </p>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="py-16 text-center">

              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

              <p className="mt-4 text-sm text-slate-500">
                Memuat riwayat penjualan...
              </p>

            </div>

          ) : filteredSales.length === 0 ? (

            /* =================================================
               EMPTY
            ================================================= */

            <div className="rounded-2xl bg-slate-50 px-6 py-16 text-center">

              <div className="text-5xl">
                🧾
              </div>

              <h3 className="mt-4 font-bold text-slate-900">
                Tidak ada transaksi
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Tidak ada transaksi yang sesuai
                dengan filter saat ini.
              </p>

              {(search ||
                dateFilter ||
                channelFilter !==
                  "all") && (

                <button
                  type="button"
                  onClick={
                    resetFilters
                  }
                  className="mt-5 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-cyan-700"
                >
                  Reset Filter
                </button>

              )}

            </div>

          ) : (

            /* =================================================
               TABLE
            ================================================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-250 text-left text-sm">

                <thead>

                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">

                    <th className="px-4 py-3">
                      Tanggal
                    </th>

                    <th className="px-4 py-3">
                      Nota
                    </th>

                    <th className="px-4 py-3">
                      Customer
                    </th>

                    <th className="px-4 py-3">
                      Channel
                    </th>

                    <th className="px-4 py-3">
                      Customer Bayar
                    </th>

                    <th className="px-4 py-3">
                      Nilai Owner
                    </th>

                    <th className="px-4 py-3">
                      Selisih
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredSales.map(
                    (sale) => {

                      const customerAmount =
                        Number(
                          sale.total_amount ||
                            sale.total ||
                            0
                        );


                      const ownerAmount =
                        Number(
                          sale.owner_total ||
                            0
                        );


                      const difference =
                        Math.max(
                          customerAmount -
                            ownerAmount,
                          0
                        );


                      const isOnlineShop =
                        sale.sale_type ===
                        "online_shop";


                      return (

                        <tr
                          key={
                            sale.id
                          }
                          className="border-b border-slate-100 transition hover:bg-slate-50"
                        >


                          {/* DATE */}

                          <td className="whitespace-nowrap px-4 py-4 text-slate-500">

                            {formatDate(
                              sale.created_at
                            )}

                          </td>


                          {/* NOTA */}

                          <td className="px-4 py-4">

                            <button
                              type="button"
                              onClick={() =>
                                handleOpenSaleDetail(
                                  sale
                                )
                              }
                              className="text-left font-bold text-cyan-700 underline decoration-cyan-300 underline-offset-2 transition hover:text-cyan-900"
                              title="Lihat isi nota"
                            >

                              {
                                sale.sale_number ||
                                "-"
                              }

                            </button>


                            {sale.invoice_number &&
                              sale.invoice_number !==
                                sale.sale_number && (

                                <p className="mt-1 text-xs text-slate-400">

                                  {
                                    sale.invoice_number
                                  }

                                </p>

                              )}

                          </td>


                          {/* CUSTOMER */}

                          <td className="px-4 py-4">

                            <p className="font-semibold text-slate-800">

                              {
                                sale.customer_name ||
                                "Tanpa nama"
                              }

                            </p>

                          </td>


                          {/* CHANNEL */}

                          <td className="px-4 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${getChannelClass(
                                sale.sale_type
                              )}`}
                            >

                              {getChannelLabel(
                                sale.sale_type
                              )}

                            </span>


                            {isOnlineShop && (

                              <p className="mt-2 text-xs text-slate-400">

                                Owner:{" "}

                                <span className="font-semibold text-slate-600">

                                  {
                                    sale.owner_sale_type ||
                                    "retail"
                                  }

                                </span>

                              </p>

                            )}

                          </td>


                          {/* CUSTOMER BAYAR */}

                          <td className="px-4 py-4 font-semibold text-slate-700">

                            Rp{" "}

                            {formatRupiah(
                              customerAmount
                            )}

                          </td>


                          {/* OWNER */}

                          <td className="px-4 py-4">

                            <p className="font-bold text-emerald-600">

                              Rp{" "}

                              {formatRupiah(
                                ownerAmount
                              )}

                            </p>


                            {isOnlineShop && (

                              <p className="mt-1 text-xs text-slate-400">
                                dihitung retail
                              </p>

                            )}

                          </td>


                          {/* SELISIH */}

                          <td className="px-4 py-4">

                            {difference >
                            0 ? (

                              <span className="font-semibold text-amber-600">

                                Rp{" "}

                                {formatRupiah(
                                  difference
                                )}

                              </span>

                            ) : (

                              <span className="text-slate-300">
                                —
                              </span>

                            )}

                          </td>


                          {/* STATUS */}

                          <td className="px-4 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                sale.status ===
                                "completed"

                                  ? "bg-emerald-100 text-emerald-700"

                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >

                              {sale.status ===
                              "completed"

                                ? "Completed"

                                : sale.status ||
                                  "-"}

                            </span>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

      </div>

      {/* =================================================
          MODAL DETAIL NOTA
      ================================================= */}

      {selectedSale && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseSaleDetail();
            }
          }}
        >

          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="owner-sale-detail-title"
          >

            {/* HEADER */}

            <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-5 py-5 sm:px-6">

              <div className="flex items-start justify-between gap-4">

                <div className="min-w-0">

                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-600">
                    Detail Nota
                  </p>

                  <h2
                    id="owner-sale-detail-title"
                    className="mt-1 break-all text-lg font-bold text-slate-900 sm:text-xl"
                  >
                    {selectedSale.sale_number ||
                      selectedSale.invoice_number ||
                      "-"}
                  </h2>

                  {selectedSale.invoice_number &&
                    selectedSale.invoice_number !==
                      selectedSale.sale_number && (
                      <p className="mt-1 break-all text-xs text-slate-400">
                        Invoice:{" "}
                        {selectedSale.invoice_number}
                      </p>
                    )}

                </div>

                <button
                  type="button"
                  onClick={handleCloseSaleDetail}
                  className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2 text-lg font-bold text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  aria-label="Tutup detail nota"
                >
                  ✕
                </button>

              </div>

            </div>


            {/* INFO NOTA */}

            <div className="grid gap-3 border-b border-slate-200 bg-slate-50 px-5 py-5 sm:grid-cols-2 sm:px-6">

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer
                </p>

                <p className="mt-1 font-bold text-slate-800">
                  {selectedSale.customer_name ||
                    "Tanpa nama"}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Tanggal
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {formatDate(
                    selectedSale.created_at
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Channel
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {getChannelLabel(
                    selectedSale.sale_type
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </p>

                <p className="mt-1 font-semibold text-slate-700">
                  {selectedSale.status ===
                  "completed"
                    ? "Completed"
                    : selectedSale.status ||
                      "-"}
                </p>
              </div>

            </div>


            {/* PRODUK */}

            <div className="px-5 py-5 sm:px-6">

              <div className="mb-4">

                <h3 className="text-base font-bold text-slate-900">
                  Produk yang Dipesan
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Isi pesanan yang tercatat pada nota ini.
                </p>

              </div>


              {detailLoading ? (

                <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center">

                  <div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

                  <p className="mt-3 text-sm text-slate-500">
                    Memuat isi nota...
                  </p>

                </div>

              ) : detailError ? (

                <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-600">
                  {detailError}
                </div>

              ) : selectedSaleItems.length === 0 ? (

                <div className="rounded-2xl bg-slate-50 px-5 py-8 text-center">

                  <p className="font-semibold text-slate-500">
                    Tidak ada detail produk pada nota ini.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto rounded-2xl border border-slate-200">

                  <table className="w-full min-w-140 text-sm">

                    <thead className="bg-slate-50">

                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">

                        <th className="px-4 py-3">
                          Produk
                        </th>

                        <th className="px-4 py-3 text-center">
                          Qty
                        </th>

                        <th className="px-4 py-3 text-right">
                          Harga
                        </th>

                        <th className="px-4 py-3 text-right">
                          Subtotal
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {selectedSaleItems.map(
                        (item) => {

                          const quantity =
                            Number(
                              item.quantity || 0
                            );

                          const unitPrice =
                            Number(
                              item.unit_price || 0
                            );

                          const subtotal =
                            Number(
                              item.subtotal ??
                                quantity *
                                  unitPrice
                            );

                          return (
                            <tr
                              key={item.id}
                              className="border-b border-slate-100 last:border-0"
                            >

                              <td className="px-4 py-4">

                                <p className="font-semibold text-slate-800">
                                  {item.product_name ||
                                    "Produk"}
                                </p>

                                {item.is_bonus && (
                                  <span className="mt-1 inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
                                    Bonus
                                  </span>
                                )}

                              </td>

                              <td className="px-4 py-4 text-center font-semibold text-slate-700">
                                {quantity}
                              </td>

                              <td className="whitespace-nowrap px-4 py-4 text-right text-slate-600">
                                Rp{" "}
                                {formatRupiah(
                                  unitPrice
                                )}
                              </td>

                              <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-800">
                                Rp{" "}
                                {formatRupiah(
                                  subtotal
                                )}
                              </td>

                            </tr>
                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>


            {/* TOTAL */}

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-6">

              <div className="space-y-2">

                <div className="flex items-center justify-between gap-4 text-sm">

                  <span className="text-slate-500">
                    Customer Bayar
                  </span>

                  <span className="font-bold text-slate-800">
                    Rp{" "}
                    {formatRupiah(
                      selectedSale.total_amount ??
                        selectedSale.total ??
                        0
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between gap-4 text-sm">

                  <span className="text-slate-500">
                    Nilai Owner
                  </span>

                  <span className="font-bold text-emerald-600">
                    Rp{" "}
                    {formatRupiah(
                      selectedSale.owner_total ||
                        0
                    )}
                  </span>

                </div>

                {selectedSale.sale_type ===
                  "online_shop" && (
                  <div className="flex items-center justify-between gap-4 text-sm">

                    <span className="text-slate-500">
                      Selisih Online Shop
                    </span>

                    <span className="font-bold text-amber-600">
                      Rp{" "}
                      {formatRupiah(
                        Math.max(
                          Number(
                            selectedSale.total_amount ??
                              selectedSale.total ??
                              0
                          ) -
                            Number(
                              selectedSale.owner_total ||
                                0
                            ),
                          0
                        )
                      )}
                    </span>

                  </div>
                )}

                <div className="flex items-center justify-between gap-4 border-t border-slate-200 pt-3">

                  <span className="text-lg font-bold text-slate-900">
                    TOTAL
                  </span>

                  <span className="text-xl font-bold text-cyan-600">
                    Rp{" "}
                    {formatRupiah(
                      selectedSale.total_amount ??
                        selectedSale.total ??
                        0
                    )}
                  </span>

                </div>

              </div>

            </div>


            {/* FOOTER */}

            <div className="px-5 pb-5 pt-3 sm:px-6">

              <button
                type="button"
                onClick={handleCloseSaleDetail}
                className="w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Tutup
              </button>

            </div>

          </div>

        </div>
      )}

    </main>

  );

}


export default OwnerSales;