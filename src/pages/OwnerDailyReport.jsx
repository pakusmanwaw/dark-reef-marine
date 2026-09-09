import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/useAuth";

// =========================================================
// OWNER DAILY REPORT
// =========================================================

function OwnerDailyReport() {
  const navigate = useNavigate();

  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();

  // =======================================================
  // STATE
  // =======================================================

  const [sales, setSales] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [losses, setLosses] = useState([]);
  const [biota, setBiota] = useState([]);
  const [inventoryMovements, setInventoryMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // =======================================================
  // TANGGAL
  // =======================================================

  const today = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState(today);

  // =======================================================
  // FORMAT RUPIAH
  // =======================================================

  function formatRupiah(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }

  // =======================================================
  // FORMAT TANGGAL
  // =======================================================

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    const date =
      typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? new Date(`${value}T00:00:00`)
        : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // =======================================================
  // FORMAT JAM
  // =======================================================

  function formatTime(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // =======================================================
  // MARK REPORT AS VIEWED
  // HANYA LAPORAN HARI INI
  // =======================================================

  const markReportViewed = useCallback(async () => {
    if (!user || selectedDate !== today) {
      return;
    }

    try {
      const { error } = await supabase
        .from("daily_owner_reports")
        .upsert(
          {
            report_date: today,
            owner_id: user.id,
            viewed_at: new Date().toISOString(),
          },
          {
            onConflict: "report_date,owner_id",
          }
        );

      if (error) {
        throw error;
      }

      localStorage.setItem(
        "drm-owner-daily-report-viewed",
        today
      );
    } catch (error) {
      console.error(
        "Gagal menandai laporan sebagai sudah dilihat:",
        error
      );
    }
  }, [user, selectedDate, today]);

  // =======================================================
  // LOAD DATA LAPORAN
  // =======================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate("/login", {
        replace: true,
      });

      return;
    }

    if (profile && profile.role !== "owner") {
      navigate("/", {
        replace: true,
      });

      return;
    }

    let cancelled = false;

    async function loadDailyReport() {
      try {
        setLoading(true);
        setErrorMessage("");

        // =================================================
        // RANGE TANGGAL YANG DIPILIH
        // =================================================

        const start = new Date(
          `${selectedDate}T00:00:00`
        );

        const end = new Date(
          `${selectedDate}T23:59:59.999`
        );

        const startIso = start.toISOString();
        const endIso = end.toISOString();

        // =================================================
        // MARK REPORT AS VIEWED
        // HANYA JIKA TANGGAL = HARI INI
        // =================================================

        if (selectedDate === today) {
          await markReportViewed();
        }

        // =================================================
        // SATU-SATUNYA SUMBER DATA LAPORAN:
        // RPC get_owner_report_data()
        //
        // JANGAN QUERY LANGSUNG:
        // - sales
        // - sale_items
        // - losses
        // - biota
        //
        // Karena data Owner harus lewat RPC SECURITY DEFINER.
        // =================================================

        const {
          data: reportData,
          error: reportError,
        } = await supabase.rpc(
          "get_owner_report_data",
          {
            p_start_at: startIso,
            p_end_at: endIso,
          }
        );

        if (reportError) {
          throw reportError;
        }

        // =================================================
        // INVENTORY MOVEMENTS
        // Sumber histori stok permanen:
        // - Tambah Produk
        // - Update Stok
        // - Penjualan
        // - Kerugian
        // - Hapus Produk
        //
        // Menggunakan RPC khusus Owner agar RLS
        // inventory_movements tidak perlu dibuka ke client.
        // =================================================

        const {
          data: movementData,
          error: movementError,
        } = await supabase.rpc(
          "get_owner_inventory_movements",
          {
            p_start_at: startIso,
            p_end_at: endIso,
          }
        );

        if (movementError) {
          throw movementError;
        }

        const safeInventoryMovements =
          Array.isArray(movementData)
            ? movementData
            : [];

        // =================================================
        // VALIDASI RESPONSE RPC
        // =================================================

        const safeReport =
          reportData &&
          typeof reportData === "object"
            ? reportData
            : {};

        const safeSales =
          Array.isArray(safeReport.sales)
            ? safeReport.sales
            : [];

        const safeSaleItems =
          Array.isArray(safeReport.sale_items)
            ? safeReport.sale_items
            : [];

        const safeLosses =
          Array.isArray(safeReport.losses)
            ? safeReport.losses
            : [];

        const safeBiota =
          Array.isArray(safeReport.biota)
            ? safeReport.biota
            : [];

        // =================================================
        // DEBUG
        // =================================================

        console.log(
          "OWNER DAILY REPORT RPC BERHASIL",
          {
            sales: safeSales.length,
            sale_items: safeSaleItems.length,
            losses: safeLosses.length,
            biota: safeBiota.length,
            inventory_movements:
              safeInventoryMovements.length,
          }
        );

        if (cancelled) {
          return;
        }

        // =================================================
        // SIMPAN DATA
        // =================================================

        setSales(safeSales);
        setSaleItems(safeSaleItems);
        setLosses(safeLosses);
        setBiota(safeBiota);
        setInventoryMovements(
          safeInventoryMovements
        );
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Daily report error:",
            error
          );

          setErrorMessage(
            error?.message ||
              "Gagal mengambil laporan harian."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDailyReport();

    return () => {
      cancelled = true;
    };
  }, [
    authLoading,
    user,
    profile,
    navigate,
    selectedDate,
    today,
    markReportViewed,
  ]);

  // =======================================================
  // OMZET OWNER
  // =======================================================

  const ownerRevenue = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total +
        Number(
          sale.owner_total ??
            sale.total_amount ??
            sale.total ??
            0
        ),
      0
    );
  }, [sales]);

  // =======================================================
  // CUSTOMER BAYAR
  // =======================================================

  const customerRevenue = useMemo(() => {
    return sales.reduce(
      (total, sale) =>
        total +
        Number(
          sale.total_amount ??
            sale.total ??
            0
        ),
      0
    );
  }, [sales]);

  // =======================================================
  // SELISIH ONLINE SHOP
  // =======================================================

  const onlineShopDifference = useMemo(() => {
    return Math.max(
      0,
      customerRevenue - ownerRevenue
    );
  }, [
    customerRevenue,
    ownerRevenue,
  ]);

  // =======================================================
  // TOTAL HPP
  // =======================================================

  const totalHpp = useMemo(() => {
    return saleItems.reduce(
      (total, item) => {
        const quantity = Number(
          item.quantity || 0
        );

        const unitCost = Number(
          item.unit_cost || 0
        );

        return (
          total +
          quantity * unitCost
        );
      },
      0
    );
  }, [saleItems]);

  // =======================================================
  // LABA KOTOR
  // =======================================================

  const grossProfit = useMemo(() => {
    return ownerRevenue - totalHpp;
  }, [
    ownerRevenue,
    totalHpp,
  ]);

  // =======================================================
  // TOTAL KERUGIAN
  // =======================================================

  const totalLoss = useMemo(() => {
    return losses.reduce(
      (total, loss) =>
        total +
        Number(
          loss.total_loss || 0
        ),
      0
    );
  }, [losses]);

  // =======================================================
  // LABA BERSIH
  // =======================================================

  const netProfit = useMemo(() => {
    return grossProfit - totalLoss;
  }, [
    grossProfit,
    totalLoss,
  ]);

  // =======================================================
  // TOTAL BIOTA TERJUAL
  // =======================================================

  const totalSoldQuantity = useMemo(() => {
    return saleItems.reduce(
      (total, item) =>
        total +
        Number(item.quantity || 0),
      0
    );
  }, [saleItems]);

  // =======================================================
  // TOTAL BIOTA HILANG
  // =======================================================

  const totalLossQuantity = useMemo(() => {
    return losses.reduce(
      (total, loss) =>
        total +
        Number(loss.quantity || 0),
      0
    );
  }, [losses]);

  // =======================================================
  // STOCK MOVEMENTS
  // SUMBER: inventory_movements
  // URUT DARI AKTIVITAS PALING AWAL
  // =======================================================

  const stockSummary = useMemo(() => {
    return inventoryMovements
      .map((movement, index) => {
        const product = biota.find(
          (item) =>
            String(item.id) ===
            String(movement.biota_id)
        );

        return {
          ...movement,
          originalIndex: index,
          product,
        };
      })
      .sort((a, b) => {
        const timeA = a.created_at
          ? new Date(a.created_at).getTime()
          : Number.POSITIVE_INFINITY;

        const timeB = b.created_at
          ? new Date(b.created_at).getTime()
          : Number.POSITIVE_INFINITY;

        if (timeA !== timeB) {
          return timeA - timeB;
        }

        return (
          Number(a.id || 0) -
          Number(b.id || 0)
        );
      });
  }, [
    inventoryMovements,
    biota,
  ]);

  // =======================================================
  // LOADING
  // =======================================================

  if (authLoading || loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
        <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-sm font-semibold text-slate-500">
            Menyiapkan laporan...
          </p>
        </div>
      </main>
    );
  }

  // =======================================================
  // MAIN
  // =======================================================

  const isToday = selectedDate === today;

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
            >
              ← Tutup Laporan
            </button>

            <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-600">
              Dark Reef Marine
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Laporan Harian Owner
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {formatDate(selectedDate)}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* =================================================
                DATE PICKER
            ================================================= */}

            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <label
                htmlFor="owner-report-date"
                className="block text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Pilih Tanggal
              </label>

              <input
                id="owner-report-date"
                type="date"
                value={selectedDate}
                max={today}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  if (!value) {
                    return;
                  }

                  if (value > today) {
                    setSelectedDate(today);
                    return;
                  }

                  setSelectedDate(value);
                }}
                className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {/* =================================================
                STATUS VIEWED
            ================================================= */}

            {isToday && (
              <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700">
                ✓ Laporan sudah dilihat
              </div>
            )}
          </div>
        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              ⚠️ {errorMessage}
            </p>
          </div>
        )}

        {/* =================================================
            FINANCIAL SUMMARY
        ================================================= */}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {/* OMZET */}

          <div className="rounded-2xl bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Omzet Owner
            </p>

            <p className="mt-3 text-2xl font-bold">
              Rp{" "}
              {formatRupiah(ownerRevenue)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Nilai yang dihitung sebagai omzet Owner
            </p>
          </div>

          {/* HPP */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              HPP
            </p>

            <p className="mt-3 text-2xl font-bold text-slate-900">
              Rp{" "}
              {formatRupiah(totalHpp)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Modal barang terjual
            </p>
          </div>

          {/* LABA KOTOR */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Laba Kotor
            </p>

            <p className="mt-3 text-2xl font-bold text-emerald-600">
              Rp{" "}
              {formatRupiah(grossProfit)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Omzet dikurangi HPP
            </p>
          </div>

          {/* KERUGIAN */}

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Kerugian
            </p>

            <p className="mt-3 text-2xl font-bold text-red-600">
              Rp{" "}
              {formatRupiah(totalLoss)}
            </p>

            <p className="mt-2 text-xs text-slate-400">
              Berdasarkan HPP kerugian
            </p>
          </div>

          {/* LABA BERSIH */}

          <div className="rounded-2xl bg-emerald-600 p-5 text-white shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-100">
              Laba Bersih
            </p>

            <p className="mt-3 text-2xl font-bold">
              Rp{" "}
              {formatRupiah(netProfit)}
            </p>

            <p className="mt-2 text-xs text-emerald-100">
              Laba kotor dikurangi kerugian
            </p>
          </div>
        </section>

        {/* =================================================
            QUICK STATS
        ================================================= */}

        <section className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Transaksi
            </p>

            <p className="mt-2 text-2xl font-bold">
              {sales.length}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Biota Terjual
            </p>

            <p className="mt-2 text-2xl font-bold">
              {totalSoldQuantity}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Biota Hilang
            </p>

            <p className="mt-2 text-2xl font-bold text-red-600">
              {totalLossQuantity}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Selisih Online Shop
            </p>

            <p className="mt-2 text-2xl font-bold text-orange-500">
              Rp{" "}
              {formatRupiah(
                onlineShopDifference
              )}
            </p>
          </div>
        </section>

        {/* =================================================
            PENJUALAN
        ================================================= */}

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Penjualan {formatDate(selectedDate)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Seluruh transaksi pada tanggal yang dipilih.
            </p>
          </div>

          {sales.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-500">
                Belum ada transaksi pada tanggal ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-3 py-3">
                      Jam
                    </th>
                    <th className="px-3 py-3">
                      Nota
                    </th>
                    <th className="px-3 py-3">
                      Customer
                    </th>
                    <th className="px-3 py-3">
                      Channel
                    </th>
                    <th className="px-3 py-3">
                      Customer Bayar
                    </th>
                    <th className="px-3 py-3">
                      Nilai Owner
                    </th>
                    <th className="px-3 py-3">
                      HPP
                    </th>
                    <th className="px-3 py-3">
                      Laba
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {sales.map((sale) => {
                    const customerTotal =
                      Number(
                        sale.total_amount ??
                          sale.total ??
                          0
                      );

                    const ownerTotal =
                      Number(
                        sale.owner_total ??
                          customerTotal
                      );

                    const items =
                      saleItems.filter(
                        (item) =>
                          String(
                            item.sale_id
                          ) ===
                          String(sale.id)
                      );

                    const saleHpp =
                      items.reduce(
                        (
                          total,
                          item
                        ) =>
                          total +
                          Number(
                            item.quantity ||
                              0
                          ) *
                          Number(
                            item.unit_cost ||
                              0
                          ),
                        0
                      );

                    const saleProfit =
                      ownerTotal -
                      saleHpp;

                    return (
                      <tr
                        key={sale.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-4 text-slate-500">
                          {formatTime(
                            sale.created_at
                          )}
                        </td>

                        <td className="px-3 py-4 font-semibold">
                          {sale.sale_number}
                        </td>

                        <td className="px-3 py-4">
                          {sale.customer_name ||
                            "Tanpa nama"}
                        </td>

                        <td className="px-3 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                            {sale.sale_type}
                          </span>
                        </td>

                        <td className="px-3 py-4 font-semibold">
                          Rp{" "}
                          {formatRupiah(
                            customerTotal
                          )}
                        </td>

                        <td className="px-3 py-4 font-bold text-emerald-600">
                          Rp{" "}
                          {formatRupiah(
                            ownerTotal
                          )}
                        </td>

                        <td className="px-3 py-4 font-semibold text-slate-700">
                          Rp{" "}
                          {formatRupiah(
                            saleHpp
                          )}
                        </td>

                        <td
                          className={`px-3 py-4 font-bold ${
                            saleProfit < 0
                              ? "text-red-600"
                              : "text-emerald-600"
                          }`}
                        >
                          Rp{" "}
                          {formatRupiah(
                            saleProfit
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =================================================
            KERUGIAN
        ================================================= */}

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Kerugian {formatDate(selectedDate)}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Kerugian dihitung berdasarkan modal / HPP.
            </p>
          </div>

          {losses.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-500">
                Tidak ada kerugian pada tanggal ini.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {losses.map((loss) => {
                const product =
                  biota.find(
                    (item) =>
                      String(item.id) ===
                      String(loss.biota_id)
                  );

                return (
                  <div
                    key={loss.id}
                    className="rounded-2xl bg-slate-50 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-bold">
                          {product?.name ||
                            "Biota"}{" "}
                          × {loss.quantity}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {formatTime(
                            loss.created_at
                          )}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                        {loss.loss_type}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-400">
                          Quantity
                        </p>

                        <p className="mt-1 font-bold">
                          {loss.quantity}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-400">
                          Modal / Unit
                        </p>

                        <p className="mt-1 font-bold">
                          Rp{" "}
                          {formatRupiah(
                            loss.unit_cost
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-red-50 p-3">
                        <p className="text-xs text-red-500">
                          Total Kerugian
                        </p>

                        <p className="mt-1 font-bold text-red-600">
                          Rp{" "}
                          {formatRupiah(
                            loss.total_loss
                          )}
                        </p>
                      </div>
                    </div>

                    {loss.note && (
                      <div className="mt-4 rounded-xl bg-white p-3">
                        <p className="text-xs text-slate-400">
                          Keterangan
                        </p>

                        <p className="mt-1 text-sm">
                          {loss.note}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* =================================================
            STOK
        ================================================= */}

        <section className="mt-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold">
              Stok Produk yang Bergerak
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Riwayat seluruh perubahan stok pada tanggal yang dipilih.
            </p>
          </div>

          {stockSummary.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-8 text-center">
              <p className="font-semibold text-slate-500">
                Belum ada pergerakan stok pada tanggal ini.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-3 py-3">
                      No
                    </th>

                    <th className="px-3 py-3">
                      Tanggal
                    </th>

                    <th className="px-3 py-3">
                      Jam
                    </th>

                    <th className="px-3 py-3">
                      Aktivitas
                    </th>

                    <th className="px-3 py-3">
                      Produk
                    </th>

                    <th className="px-3 py-3">
                      Perubahan
                    </th>

                    <th className="px-3 py-3">
                      Stok
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {stockSummary.map((item, index) => {
                    const quantityChange =
                      Number(
                        item.quantity_change || 0
                      );

                    const stockAfter =
                      item.stock_after == null
                        ? null
                        : Number(
                            item.stock_after
                          );

                    const activityClass =
                      item.activity === "Penjualan"
                        ? "bg-blue-50 text-blue-700"
                        : item.activity === "Kerugian"
                        ? "bg-red-50 text-red-700"
                        : item.activity === "Hapus Produk"
                        ? "bg-slate-100 text-slate-600"
                        : item.activity === "Tambah Produk"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700";

                    const changeClass =
                      quantityChange > 0
                        ? "text-emerald-600"
                        : quantityChange < 0
                        ? "text-red-600"
                        : "text-slate-500";

                    return (
                      <tr
                        key={`${item.id}-${item.created_at || "unknown"}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-3 py-4 font-semibold text-slate-400">
                          {index + 1}
                        </td>

                        <td className="px-3 py-4 text-slate-500">
                          {item.created_at
                            ? new Date(
                                item.created_at
                              ).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "-"}
                        </td>

                        <td className="px-3 py-4 font-semibold text-slate-500">
                          {formatTime(
                            item.created_at
                          )}
                        </td>

                        <td className="px-3 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold ${activityClass}`}
                          >
                            {item.activity ||
                              "-"}
                          </span>
                        </td>

                        <td className="px-3 py-4">
                          <p className="font-bold">
                            {item.product_name ||
                              item.product?.name ||
                              "Biota"}
                          </p>

                          {item.product
                            ?.english_name && (
                            <p className="mt-1 text-xs text-slate-400">
                              {
                                item.product
                                  .english_name
                              }
                            </p>
                          )}
                        </td>

                        <td
                          className={`px-3 py-4 font-bold ${changeClass}`}
                        >
                          {quantityChange > 0
                            ? `+${quantityChange}`
                            : quantityChange}
                        </td>

                        <td className="px-3 py-4">
                          {stockAfter == null ? (
                            <span className="font-semibold text-slate-400">
                              —
                            </span>
                          ) : (
                            <span
                              className={
                                stockAfter <= 0
                                  ? "rounded-full bg-red-50 px-3 py-1 font-bold text-red-600"
                                  : stockAfter <= 3
                                  ? "rounded-full bg-amber-50 px-3 py-1 font-bold text-amber-600"
                                  : "rounded-full bg-emerald-50 px-3 py-1 font-bold text-emerald-600"
                              }
                            >
                              {stockAfter}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* =================================================
            ONLINE SHOP
        ================================================= */}

        {onlineShopDifference > 0 && (
          <section className="mt-6 rounded-3xl border border-orange-200 bg-orange-50 p-5 sm:p-6">
            <h2 className="font-bold text-orange-800">
              Informasi Online Shop
            </h2>

            <p className="mt-2 text-sm leading-6 text-orange-700">
              Customer Online Shop membayar lebih besar
              daripada nilai yang dihitung sebagai omzet Owner.

              <span className="ml-1 font-bold">
                Selisih Rp{" "}
                {formatRupiah(
                  onlineShopDifference
                )}
              </span>{" "}
              tidak dihitung sebagai omzet Owner.
            </p>
          </section>
        )}

        {/* =================================================
            CLOSE
        ================================================= */}

        <button
          type="button"
          onClick={() => navigate("/admin")}
          className="mt-6 w-full rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
        >
          ← Tutup Laporan
        </button>
      </div>
    </main>
  );
}

export default OwnerDailyReport;
