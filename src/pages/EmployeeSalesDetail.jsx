import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  supabase,
} from "../services/supabase";

import {
  useAuth,
} from "../context/useAuth";

import {
  toJpeg,
} from "html-to-image";


function EmployeeSalesDetail() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [sale, setSale] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [exportError, setExportError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // LOAD DETAIL NOTA
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadSaleDetail() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: saleData,
          error: saleError,
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
          .eq("id", id)
          .maybeSingle();

        if (saleError) {
          throw saleError;
        }

        if (!saleData) {
          throw new Error("Nota tidak ditemukan.");
        }

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
          .eq("sale_id", saleData.id)
          .order("id", {
            ascending: true,
          });

        if (itemError) {
          throw itemError;
        }

        if (cancelled) {
          return;
        }

        setSale(saleData);
        setItems(itemData || []);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Gagal mengambil detail nota:",
            error
          );

          setErrorMessage(
            error?.message ||
            "Gagal mengambil detail nota."
          );

          setSale(null);
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadSaleDetail();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  // =====================================================
  // FORMAT
  // =====================================================

  function formatRupiah(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }

  function formatDate(value) {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  function formatTime(value) {
    if (!value) {
      return "";
    }

    return new Date(value).toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // ESCAPE HTML
  // =====================================================

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // =====================================================
  // EXPORT JPG
  // =====================================================

  async function handleExportJpg() {
    if (!sale || exporting || deleting) {
      return;
    }

    setExportError("");
    setExporting(true);

    let exportNode = null;

    try {
      const invoiceNumber =
        sale.invoice_number ||
        sale.sale_number ||
        `DRM-${sale.id}`;

      const saleType =
        sale.sale_type === "reseller"
          ? "RESELLER"
          : "RETAIL";

      const customerName =
        sale.customer_name ||
        "Customer";

      const total =
        Number(
          sale.total_amount ??
          sale.total ??
          0
        );

      const dateText = formatDate(
        sale.created_at
      );

      const itemRows = items
        .map((item) => {
          const quantity =
            Number(item.quantity || 0);

          const unitPrice =
            Number(item.unit_price || 0);

          const itemSubtotal =
            Number(
              item.subtotal ??
              quantity * unitPrice
            );

          return `
            <div style="
              border-top:1px solid #e2e8f0;
              padding:18px 0;
              display:flex;
              justify-content:space-between;
              gap:20px;
              font-family:Arial,Helvetica,sans-serif;
            ">
              <div style="flex:1;">
                <div style="
                  font-size:18px;
                  font-weight:700;
                  color:#0f172a;
                  margin-bottom:6px;
                ">
                  ${escapeHtml(
                    item.product_name || "Produk"
                  )}
                </div>

                <div style="
                  font-size:13px;
                  color:#64748b;
                ">
                  ${quantity} × Rp ${formatRupiah(unitPrice)}
                  ${
                    item.is_bonus
                      ? ' <span style="color:#d97706;font-weight:700;">BONUS</span>'
                      : ""
                  }
                </div>
              </div>

              <div style="
                font-size:18px;
                font-weight:700;
                color:#0f172a;
                white-space:nowrap;
              ">
                Rp ${formatRupiah(itemSubtotal)}
              </div>
            </div>
          `;
        })
        .join("");

      exportNode =
        document.createElement("div");

      exportNode.style.position = "fixed";
      exportNode.style.left = "0";
      exportNode.style.top = "0";
      exportNode.style.width = "700px";
      exportNode.style.background = "#ffffff";
      exportNode.style.padding = "40px";
      exportNode.style.boxSizing = "border-box";
      exportNode.style.fontFamily =
        "Arial, Helvetica, sans-serif";
      exportNode.style.color = "#0f172a";
      exportNode.style.zIndex = "2147483647";

      exportNode.innerHTML = `
        <div style="
          width:620px;
          background:#ffffff;
          color:#0f172a;
          font-family:Arial,Helvetica,sans-serif;
        ">

          <div style="
            text-align:center;
            padding-bottom:22px;
          ">
            <div style="
              font-size:13px;
              font-weight:700;
              letter-spacing:5px;
              color:#0891b2;
              margin-bottom:10px;
            ">
              DARK REEF MARINE
            </div>

            <div style="
              font-size:32px;
              line-height:1.1;
              font-weight:800;
              color:#0f172a;
              margin-bottom:10px;
            ">
              NOTA PENJUALAN
            </div>

            <div style="
              font-size:12px;
              color:#64748b;
            ">
              We Sell with Love, Not Just for Money.
            </div>
          </div>

          <div style="
            height:4px;
            background:#06b6d4;
            margin-bottom:26px;
          "></div>

          <div style="
            display:grid;
            grid-template-columns:1fr 1fr;
            gap:24px;
            margin-bottom:24px;
          ">

            <div>
              <div style="
                font-size:11px;
                color:#94a3b8;
                margin-bottom:6px;
                text-transform:uppercase;
              ">
                Nomor Nota
              </div>

              <div style="
                font-size:16px;
                font-weight:700;
                color:#0f172a;
                word-break:break-all;
              ">
                ${escapeHtml(invoiceNumber)}
              </div>
            </div>

            <div>
              <div style="
                font-size:11px;
                color:#94a3b8;
                margin-bottom:6px;
                text-transform:uppercase;
              ">
                Tanggal
              </div>

              <div style="
                font-size:16px;
                font-weight:700;
                color:#0f172a;
              ">
                ${escapeHtml(dateText)}
              </div>
            </div>

            <div>
              <div style="
                font-size:11px;
                color:#94a3b8;
                margin-bottom:6px;
                text-transform:uppercase;
              ">
                Customer
              </div>

              <div style="
                font-size:16px;
                font-weight:700;
                color:#0f172a;
              ">
                ${escapeHtml(customerName)}
              </div>
            </div>

            <div>
              <div style="
                font-size:11px;
                color:#94a3b8;
                margin-bottom:6px;
                text-transform:uppercase;
              ">
                Tipe Penjualan
              </div>

              <div style="
                font-size:16px;
                font-weight:700;
                color:#0891b2;
              ">
                ${saleType}
              </div>
            </div>

          </div>

          <div style="
            border-top:1px solid #cbd5e1;
            margin-top:4px;
          ">
            ${itemRows}
          </div>

          <div style="
            margin-top:12px;
            padding:22px 24px;
            border-radius:18px;
            background:#0f172a;
            color:#ffffff;
            display:flex;
            justify-content:space-between;
            align-items:center;
          ">
            <div style="
              font-size:20px;
              font-weight:800;
            ">
              TOTAL
            </div>

            <div style="
              font-size:24px;
              font-weight:800;
            ">
              Rp ${formatRupiah(total)}
            </div>
          </div>

          <div style="
            margin-top:28px;
            padding-top:20px;
            border-top:1px solid #cbd5e1;
            text-align:center;
          ">
            <div style="
              font-size:15px;
              font-weight:700;
              color:#0f172a;
              margin-bottom:10px;
            ">
              Terima kasih sudah berbelanja di Dark Reef Marine 🙏
            </div>

            <div style="
              font-size:12px;
              color:#64748b;
              margin-bottom:5px;
            ">
              Dark Reef Marine • Bandung
            </div>

            <div style="
              font-size:11px;
              color:#94a3b8;
            ">
              We Sell with Love, Not Just for Money.
            </div>
          </div>

        </div>
      `;

      document.body.appendChild(
        exportNode
      );

      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      const dataUrl =
        await toJpeg(
          exportNode,
          {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor: "#ffffff",
            cacheBust: true,
            width: 700,
            height: exportNode.scrollHeight,
          }
        );

      const safeFileName =
        invoiceNumber.replace(
          /[^a-zA-Z0-9-_]/g,
          "-"
        );

      const link =
        document.createElement("a");

      link.download =
        `${safeFileName}.jpg`;

      link.href = dataUrl;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error(
        "Export JPG gagal:",
        error
      );

      setExportError(
        error?.message ||
        "Export JPG gagal. Silakan coba lagi."
      );
    } finally {
      if (exportNode) {
        exportNode.remove();
      }

      setExporting(false);
    }
  }

  // =====================================================
  // BUKA MODAL HAPUS
  // =====================================================

  function handleDeleteSale() {
    if (!sale || deleting || exporting) {
      return;
    }

    setDeleteError("");
    setShowDeleteModal(true);
  }

  // =====================================================
  // KONFIRMASI HAPUS
  // =====================================================

  async function confirmDeleteSale() {
    if (!sale || deleting) {
      return;
    }

    setDeleteError("");
    setDeleting(true);

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "delete_sale",
        {
          p_sale_id: Number(id),
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
          "Nota gagal dihapus."
        );
      }

      setShowDeleteModal(false);
      setSuccessMessage(
        "Nota berhasil dihapus dan stok telah dikembalikan."
      );

      window.setTimeout(() => {
        navigate(
          "/employee/sales-history",
          {
            replace: true,
          }
        );
      }, 1200);

    } catch (error) {
      console.error(
        "Gagal menghapus nota:",
        error
      );

      setDeleteError(
        error?.message ||
        "Gagal menghapus nota."
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleBack() {
    navigate(
      "/employee/sales-history"
    );
  }

  function handleDashboard() {
    navigate("/employee");
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Memuat nota...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // NOTA TIDAK DITEMUKAN
  // =====================================================

  if (!sale) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="text-5xl">
              🧾
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Nota Tidak Ditemukan
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {errorMessage ||
                "Data nota tidak tersedia."}
            </p>

            <button
              type="button"
              onClick={handleBack}
              className="mt-6 rounded-xl bg-cyan-600 px-5 py-3 text-sm font-bold text-white hover:bg-cyan-700"
            >
              ← Kembali ke Riwayat
            </button>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // DATA NOTA
  // =====================================================

  const invoiceNumber =
    sale.invoice_number ||
    sale.sale_number ||
    `DRM-${sale.id}`;

  const saleType =
    sale.sale_type === "reseller"
      ? "Reseller"
      : "Retail";

  const subtotal =
    Number(sale.subtotal || 0);

  const discount =
    Number(sale.discount || 0);

  const total =
    Number(
      sale.total_amount ??
      sale.total ??
      0
    );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      {/* SUCCESS TOAST */}
      {successMessage && (
        <div className="fixed bottom-5 left-1/2 z-10000 w-[calc(100%-2rem)] max-w-md -translate-x-1/2">
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 shadow-2xl">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-lg font-bold text-emerald-700">
              ✓
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Berhasil
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-500">
                {successMessage}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* CUSTOM DELETE MODAL */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              if (!deleting) {
                setShowDeleteModal(false);
              }
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-sale-title"
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="p-6 sm:p-7">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">
                🗑️
              </div>

              <h2
                id="delete-sale-title"
                className="mt-5 text-center text-xl font-bold text-slate-900"
              >
                Hapus Nota Ini?
              </h2>

              <p className="mt-2 text-center text-sm leading-6 text-slate-500">
                Tindakan ini tidak dapat dibatalkan.
              </p>

              <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Nomor Nota
                </p>

                <p className="mt-1 break-all text-sm font-bold text-slate-900">
                  {invoiceNumber}
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Customer
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-800">
                      {sale.customer_name ||
                        "Customer"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-bold text-cyan-600">
                      Rp {formatRupiah(total)}
                    </p>
                  </div>

                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-semibold leading-6 text-amber-800">
                  ⚠️ Stok produk dalam nota akan dikembalikan ke inventory setelah nota dihapus.
                </p>
              </div>

              {deleteError && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold leading-6 text-red-700">
                    ⚠️ {deleteError}
                  </p>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">

                <button
                  type="button"
                  onClick={() => {
                    if (!deleting) {
                      setShowDeleteModal(false);
                      setDeleteError("");
                    }
                  }}
                  disabled={deleting}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="button"
                  onClick={confirmDeleteSale}
                  disabled={deleting}
                  className="rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deleting
                    ? "⏳ Menghapus..."
                    : "🗑️ Ya, Hapus"}
                </button>

              </div>

            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={handleBack}
            className="text-left text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
          >
            ← Kembali ke Riwayat Nota
          </button>

          <div className="rounded-xl bg-white px-4 py-3 shadow-sm">
            <p className="text-xs text-slate-400">
              Pegawai
            </p>

            <p className="mt-1 text-sm font-bold text-slate-800">
              {profile?.full_name ||
                "Employee"}
            </p>
          </div>

        </div>

        {/* EXPORT ERROR */}
        {exportError && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold leading-6 text-red-700">
              ⚠️ {exportError}
            </p>
          </div>
        )}

        {/* DETAIL */}
        <div className="rounded-3xl bg-white shadow-sm">

          <div className="border-b border-slate-200 px-6 py-8 text-center sm:px-10">

            <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">
              Dark Reef Marine
            </p>

            <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
              DETAIL NOTA PENJUALAN
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Riwayat transaksi Dark Reef Marine.
            </p>

          </div>

          <div className="px-6 py-6 sm:px-10">

            <div className="grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Nomor Nota
                </p>

                <p className="mt-1 break-all text-sm font-bold text-slate-900">
                  {invoiceNumber}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Jenis Penjualan
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {saleType}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Customer
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {sale.customer_name ||
                    "Customer"}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-medium text-slate-400">
                  Tanggal
                </p>

                <p className="mt-1 text-sm font-bold text-slate-900">
                  {formatDate(
                    sale.created_at
                  )}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatTime(
                    sale.created_at
                  )}
                </p>
              </div>

            </div>
          </div>

          {/* ITEMS */}
          <div className="border-t border-slate-200 px-6 py-6 sm:px-10">

            <h2 className="text-lg font-bold text-slate-900">
              Detail Pembelian
            </h2>

            <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">

              <div className="grid grid-cols-[1fr_auto_auto] gap-3 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-500 sm:grid-cols-[1fr_80px_120px]">
                <span>Produk</span>
                <span className="text-center">
                  Qty
                </span>
                <span className="text-right">
                  Subtotal
                </span>
              </div>

              {items.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-slate-500">
                  Detail produk tidak ditemukan.
                </div>
              ) : (
                items.map((item) => {
                  const quantity =
                    Number(
                      item.quantity || 0
                    );

                  const unitPrice =
                    Number(
                      item.unit_price || 0
                    );

                  const itemSubtotal =
                    Number(
                      item.subtotal ??
                      quantity *
                      unitPrice
                    );

                  return (
                    <div
                      key={item.id}
                      className="grid grid-cols-[1fr_auto_auto] gap-3 border-t border-slate-100 px-4 py-4 sm:grid-cols-[1fr_80px_120px]"
                    >

                      <div className="min-w-0">

                        <p className="wrap-break-word text-sm font-bold text-slate-800">
                          {item.product_name ||
                            "Produk"}
                        </p>

                        {item.is_bonus && (
                          <span className="mt-1 inline-flex rounded-full bg-amber-50 px-2 py-1 text-[10px] font-bold text-amber-700">
                            BONUS
                          </span>
                        )}

                        <p className="mt-1 text-xs text-slate-400">
                          Rp{" "}
                          {formatRupiah(
                            unitPrice
                          )}{" "}
                          / item
                        </p>

                      </div>

                      <div className="flex items-center justify-center text-sm font-semibold text-slate-700">
                        {quantity}
                      </div>

                      <div className="flex items-center justify-end text-sm font-bold text-slate-800">
                        Rp{" "}
                        {formatRupiah(
                          itemSubtotal
                        )}
                      </div>

                    </div>
                  );
                })
              )}

            </div>
          </div>

          {/* TOTAL */}
          <div className="border-t border-slate-200 px-6 py-6 sm:px-10">

            <div className="ml-auto max-w-sm space-y-3">

              <div className="flex justify-between gap-6 text-sm">
                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-semibold text-slate-800">
                  Rp{" "}
                  {formatRupiah(
                    subtotal
                  )}
                </span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between gap-6 text-sm">

                  <span className="text-slate-500">
                    Diskon
                  </span>

                  <span className="font-semibold text-red-500">
                    - Rp{" "}
                    {formatRupiah(
                      discount
                    )}
                  </span>

                </div>
              )}

              <div className="flex items-center justify-between gap-6 border-t border-slate-200 pt-4">

                <span className="text-lg font-bold text-slate-900">
                  TOTAL
                </span>

                <span className="text-2xl font-bold text-cyan-600">
                  Rp{" "}
                  {formatRupiah(
                    total
                  )}
                </span>

              </div>

            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-6 text-center sm:px-10">
            <p className="text-xs font-semibold text-slate-600">
              Nota ini tersimpan di sistem Dark Reef Marine.
            </p>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">

          <button
            type="button"
            onClick={handleExportJpg}
            disabled={
              exporting ||
              deleting
            }
            className="rounded-xl bg-cyan-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {exporting
              ? "⏳ Membuat JPG..."
              : "📷 Export JPG"}
          </button>

          <button
            type="button"
            onClick={handleDeleteSale}
            disabled={
              exporting ||
              deleting
            }
            className="rounded-xl bg-red-50 px-5 py-4 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            🗑️ Hapus Nota
          </button>

          <button
            type="button"
            onClick={handleBack}
            disabled={deleting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ← Riwayat Nota
          </button>

        </div>

        <button
          type="button"
          onClick={handleDashboard}
          disabled={deleting}
          className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          ← Kembali ke Dashboard Employee
        </button>

      </div>
    </main>
  );
}

export default EmployeeSalesDetail;
