import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  supabase,
} from "../services/supabase";

function OwnerLoss() {
  const navigate = useNavigate();

  const [losses, setLosses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [lossTypeFilter, setLossTypeFilter] = useState("all");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, loss: null });
  const [deletingId, setDeletingId] = useState(null);

  function formatRupiah(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }

  function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    const dateText = date.toLocaleDateString("id-ID", {
      day: "2-digit", month: "long", year: "numeric",
    });
    const timeText = date.toLocaleTimeString("id-ID", {
      hour: "2-digit", minute: "2-digit",
    });
    return `${dateText} • ${timeText}`;
  }

  function getLossType(lossType) {
    if (lossType === "bonus") {
      return {
        label: "Dibonuskan",
        icon: "🎁",
        className: "bg-amber-50 text-amber-700",
      };
    }
    return {
      label: "Mati",
      icon: "☠️",
      className: "bg-red-50 text-red-600",
    };
  }

  async function loadLosses() {
    setLoading(true);
    setErrorMessage("");
    try {
      const { data: lossData, error: lossError } = await supabase
        .from("losses")
        .select(`
          id,
          biota_id,
          loss_type,
          quantity,
          unit_cost,
          total_loss,
          note,
          created_at
        `)
        .order("created_at", { ascending: false });

      if (lossError) throw lossError;

      if (!lossData || lossData.length === 0) {
        setLosses([]);
        return;
      }

      const biotaIds = [
        ...new Set(lossData.map((loss) => loss.biota_id).filter(Boolean)),
      ];

      let biotaData = [];

      if (biotaIds.length > 0) {
        const { data, error } = await supabase
          .from("biota")
          .select(`id, name, english_name`)
          .in("id", biotaIds);

        if (error) throw error;
        biotaData = data || [];
      }

      setLosses(
        lossData.map((loss) => ({
          ...loss,
          biota:
            biotaData.find(
              (item) => String(item.id) === String(loss.biota_id)
            ) || null,
        }))
      );
    } catch (error) {
      console.error("Gagal mengambil laporan kerugian:", error);
      setErrorMessage(
        error?.message || "Gagal mengambil laporan kerugian."
      );
      setLosses([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      setErrorMessage("");
      try {
        const { data: lossData, error: lossError } = await supabase
          .from("losses")
          .select(`
            id,
            biota_id,
            loss_type,
            quantity,
            unit_cost,
            total_loss,
            note,
            created_at
          `)
          .order("created_at", { ascending: false });

        if (lossError) throw lossError;
        if (cancelled) return;

        if (!lossData || lossData.length === 0) {
          setLosses([]);
          return;
        }

        const biotaIds = [
          ...new Set(lossData.map((loss) => loss.biota_id).filter(Boolean)),
        ];

        let biotaData = [];

        if (biotaIds.length > 0) {
          const { data, error } = await supabase
            .from("biota")
            .select(`id, name, english_name`)
            .in("id", biotaIds);
          if (error) throw error;
          biotaData = data || [];
        }

        if (cancelled) return;

        setLosses(
          lossData.map((loss) => ({
            ...loss,
            biota:
              biotaData.find(
                (item) => String(item.id) === String(loss.biota_id)
              ) || null,
          }))
        );
      } catch (error) {
        if (!cancelled) {
          console.error("Gagal mengambil laporan kerugian:", error);
          setErrorMessage(
            error?.message || "Gagal mengambil laporan kerugian."
          );
          setLosses([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => { cancelled = true; };
  }, []);

  const filteredLosses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return losses.filter((loss) => {
      const name = String(loss?.biota?.name || "").toLowerCase();
      const englishName = String(loss?.biota?.english_name || "").toLowerCase();
      const note = String(loss?.note || "").toLowerCase();

      const matchesSearch =
        !keyword ||
        name.includes(keyword) ||
        englishName.includes(keyword) ||
        note.includes(keyword);

      const createdDate = loss.created_at ? new Date(loss.created_at) : null;
      const createdDateText = createdDate
        ? [
            createdDate.getFullYear(),
            String(createdDate.getMonth() + 1).padStart(2, "0"),
            String(createdDate.getDate()).padStart(2, "0"),
          ].join("-")
        : "";

      const matchesStartDate = !startDate || createdDateText >= startDate;
      const matchesEndDate = !endDate || createdDateText <= endDate;
      const matchesType =
        lossTypeFilter === "all" || loss.loss_type === lossTypeFilter;

      return (
        matchesSearch &&
        matchesStartDate &&
        matchesEndDate &&
        matchesType
      );
    });
  }, [losses, search, startDate, endDate, lossTypeFilter]);

  const totalLoss = useMemo(
    () => filteredLosses.reduce(
      (total, loss) => total + Number(loss.total_loss || 0), 0
    ),
    [filteredLosses]
  );

  const totalLostQuantity = useMemo(
    () => filteredLosses.reduce(
      (total, loss) => total + Number(loss.quantity || 0), 0
    ),
    [filteredLosses]
  );

  // FIX: count quantity by loss_type, not by total record count.
  const totalDeadQuantity = useMemo(
    () => filteredLosses.reduce(
      (total, loss) =>
        loss.loss_type === "mati"
          ? total + Number(loss.quantity || 0)
          : total,
      0
    ),
    [filteredLosses]
  );

  const totalBonusQuantity = useMemo(
    () => filteredLosses.reduce(
      (total, loss) =>
        loss.loss_type === "bonus"
          ? total + Number(loss.quantity || 0)
          : total,
      0
    ),
    [filteredLosses]
  );

  function openDeleteModal(loss) {
    if (deletingId) return;
    setErrorMessage("");
    setSuccessMessage("");
    setDeleteModal({ open: true, loss });
  }

  function closeDeleteModal() {
    if (deletingId) return;
    setDeleteModal({ open: false, loss: null });
  }

  async function confirmDeleteLoss() {
    const loss = deleteModal.loss;
    if (!loss || deletingId) return;

    setErrorMessage("");
    setSuccessMessage("");
    setDeletingId(loss.id);

    try {
      const { data, error } = await supabase.rpc("delete_loss", {
        p_loss_id: Number(loss.id),
      });

      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.message || "Kerugian gagal dihapus.");
      }

      const biotaName = loss?.biota?.name || "Biota";

      setLosses((current) =>
        current.filter(
          (item) => String(item.id) !== String(loss.id)
        )
      );

      setDeleteModal({ open: false, loss: null });
      setSuccessMessage(
        `Catatan kerugian ${biotaName} berhasil dihapus dan stok telah dikembalikan.`
      );
    } catch (error) {
      console.error("Gagal menghapus kerugian:", error);
      setErrorMessage(
        error?.message || "Gagal menghapus kerugian."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function resetFilters() {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setLossTypeFilter("all");
  }

  function handleBack() {
    navigate("/admin");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10 text-slate-900 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />
            <p className="mt-4 text-sm font-medium text-slate-500">
              Memuat laporan kerugian...
            </p>
          </div>
        </div>
      </main>
    );
  }

  const modalLoss = deleteModal.loss;
  const modalBiotaName = modalLoss?.biota?.name || "Biota";
  const modalQuantity = Number(modalLoss?.quantity || 0);
  const modalType = getLossType(modalLoss?.loss_type);

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="text-left text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
          >
            ← Kembali ke Owner Dashboard
          </button>

          <button
            type="button"
            onClick={loadLosses}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            ↻ Refresh
          </button>
        </div>

        <div className="mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">
            Dark Reef Marine
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
            Laporan Kerugian
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pantau seluruh riwayat kerugian biota yang telah dicatat oleh tim.
          </p>
        </div>

        {successMessage && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-700">
              ✓ {successMessage}
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-700">
              ⚠️ {errorMessage}
            </p>
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Kerugian
            </p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              Rp {formatRupiah(totalLoss)}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Berdasarkan data yang ditampilkan
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Biota Hilang
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {totalLostQuantity}
            </p>
            <p className="mt-1 text-xs text-slate-400">Total quantity</p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Catatan Mati
            </p>
            <p className="mt-2 text-2xl font-bold text-red-600">
              {totalDeadQuantity}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Jumlah biota mati
            </p>
          </div>

          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dibonuskan
            </p>
            <p className="mt-2 text-2xl font-bold text-amber-600">
              {totalBonusQuantity}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Jumlah biota bonus
            </p>
          </div>
        </section>

        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_auto]">
            <div>
              <label className="text-xs font-bold text-slate-700">
                Cari Kerugian
              </label>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama biota atau keterangan..."
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                Jenis Kerugian
              </label>
              <select
                value={lossTypeFilter}
                onChange={(event) => setLossTypeFilter(event.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100"
              >
                <option value="all">Semua</option>
                <option value="mati">Mati</option>
                <option value="bonus">Dibonuskan</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </button>
            </div>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            Menampilkan {filteredLosses.length} laporan kerugian
          </p>
        </section>

        <section className="mt-5 space-y-4">
          {filteredLosses.length === 0 ? (
            <div className="rounded-3xl bg-white p-10 text-center shadow-sm">
              <div className="text-5xl">📋</div>
              <h2 className="mt-4 text-xl font-bold text-slate-800">
                Tidak Ada Data
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Tidak ada kerugian yang sesuai filter.
              </p>
            </div>
          ) : (
            filteredLosses.map((loss) => {
              const lossType = getLossType(loss.loss_type);
              const biotaName = loss?.biota?.name || "Biota";
              const englishName = loss?.biota?.english_name || "";
              const quantity = Number(loss.quantity || 0);
              const unitCost = Number(loss.unit_cost || 0);
              const lossValue = Number(loss.total_loss || 0);
              const isDeleting = deletingId === loss.id;

              return (
                <article
                  key={loss.id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-bold text-slate-900">
                        {biotaName} × {quantity}
                      </h2>
                      {englishName && (
                        <p className="mt-1 text-xs text-slate-400">
                          {englishName}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        {formatDateTime(loss.created_at)}
                      </p>
                    </div>

                    <span
                      className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${lossType.className}`}
                    >
                      {lossType.icon} {lossType.label}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">Jumlah</p>
                      <p className="mt-1 text-xl font-bold text-slate-800">
                        {quantity}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-4">
                      <p className="text-xs text-slate-400">Modal / Unit</p>
                      <p className="mt-1 text-xl font-bold text-slate-800">
                        Rp {formatRupiah(unitCost)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-red-50 p-4">
                      <p className="text-xs text-red-500">Total Kerugian</p>
                      <p className="mt-1 text-xl font-bold text-red-600">
                        Rp {formatRupiah(lossValue)}
                      </p>
                    </div>
                  </div>

                  {loss.note && (
                    <div className="mt-4 rounded-xl bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-400">
                        Keterangan
                      </p>
                      <p className="mt-1 text-sm leading-5 text-slate-700">
                        {loss.note}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 flex justify-end border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openDeleteModal(loss)}
                      disabled={deletingId !== null}
                      className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isDeleting ? "⏳ Menghapus..." : "🗑️ Hapus"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </section>

        <button
          type="button"
          onClick={handleBack}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          ← Kembali ke Owner Dashboard
        </button>
      </div>

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-loss-title"
          >
            <div className="px-6 pb-5 pt-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-2xl">
                  🗑️
                </div>
                <div className="min-w-0">
                  <h2
                    id="delete-loss-title"
                    className="text-lg font-bold text-slate-900"
                  >
                    Hapus Catatan Kerugian?
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Data ini akan dihapus dari riwayat kerugian dan stok akan dikembalikan.
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-400">Biota</p>
                    <p className="mt-1 truncate text-base font-bold text-slate-900">
                      {modalBiotaName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${modalType.className}`}
                  >
                    {modalType.icon} {modalType.label}
                  </span>
                </div>

                <div className="mt-4 rounded-xl bg-white p-3">
                  <p className="text-[11px] font-medium text-slate-400">Jumlah</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {modalQuantity}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                <p className="text-sm font-bold text-amber-800">
                  ⚠️ Stok akan dikembalikan
                </p>
                <p className="mt-1 text-xs leading-5 text-amber-700">
                  Stok <strong>{modalBiotaName}</strong> akan bertambah kembali sebanyak <strong>{modalQuantity}</strong> ekor.
                </p>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6 pt-5">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={confirmDeleteLoss}
                disabled={deletingId !== null}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId !== null ? "⏳ Menghapus..." : "🗑️ Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default OwnerLoss;
