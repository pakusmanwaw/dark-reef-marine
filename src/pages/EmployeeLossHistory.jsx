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


function EmployeeLossHistory() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [losses, setLosses] = useState([]);
  const [loading, setLoading] = useState(true);

  const [deletingId, setDeletingId] =
    useState(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");


  // =====================================================
  // CUSTOM DELETE MODAL
  // =====================================================

  const [deleteModal, setDeleteModal] =
    useState({
      open: false,
      loss: null,
    });


  // =====================================================
  // LOAD RIWAYAT KERUGIAN
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadLosses() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data: lossData,
          error: lossError,
        } = await supabase
          .from("losses")
          .select(`
            id,
            biota_id,
            loss_type,
            quantity,
            note,
            created_at
          `)
          .order("created_at", {
            ascending: false,
          });

        if (lossError) {
          throw lossError;
        }

        if (cancelled) {
          return;
        }

        if (
          !lossData ||
          lossData.length === 0
        ) {
          setLosses([]);
          return;
        }


        // =================================================
        // AMBIL BIOTA
        // =================================================

        const biotaIds = [
          ...new Set(
            lossData
              .map(
                (loss) =>
                  loss.biota_id
              )
              .filter(Boolean)
          ),
        ];

        let biotaData = [];

        if (
          biotaIds.length > 0
        ) {
          const {
            data,
            error,
          } = await supabase
            .from("biota")
            .select(`
              id,
              name,
              english_name,
              retail_price
            `)
            .in(
              "id",
              biotaIds
            );

          if (error) {
            throw error;
          }

          biotaData =
            data || [];
        }


        // =================================================
        // GABUNGKAN DATA
        // =================================================

        const combinedData =
          lossData.map(
            (loss) => {

              const biota =
                biotaData.find(
                  (item) =>
                    String(item.id) ===
                    String(
                      loss.biota_id
                    )
                ) || null;

              return {
                ...loss,
                biota,
              };
            }
          );


        if (cancelled) {
          return;
        }

        setLosses(
          combinedData
        );

      } catch (error) {
        if (!cancelled) {
          console.error(
            "Gagal mengambil riwayat kerugian:",
            error
          );

          setErrorMessage(
            error?.message ||
            "Gagal mengambil riwayat kerugian."
          );

          setLosses([]);
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadLosses();

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

  function formatDateTime(value) {
    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    const dateText =
      date.toLocaleDateString(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      );

    const timeText =
      date.toLocaleTimeString(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    return `${dateText} • ${timeText}`;
  }


  // =====================================================
  // JENIS KERUGIAN
  // =====================================================

  function getLossType(
    lossType
  ) {
    if (
      lossType === "bonus"
    ) {
      return {
        label: "Dibonuskan",
        icon: "🎁",
        className:
          "bg-amber-50 text-amber-700",
      };
    }

    return {
      label: "Mati",
      icon: "☠️",
      className:
        "bg-red-50 text-red-600",
    };
  }


  // =====================================================
  // BUKA MODAL HAPUS
  // =====================================================

  function openDeleteModal(
    loss
  ) {
    if (deletingId) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setDeleteModal({
      open: true,
      loss,
    });
  }


  // =====================================================
  // TUTUP MODAL
  // =====================================================

  function closeDeleteModal() {
    if (deletingId) {
      return;
    }

    setDeleteModal({
      open: false,
      loss: null,
    });
  }


  // =====================================================
  // KONFIRMASI HAPUS
  // =====================================================

  async function confirmDeleteLoss() {
    const loss =
      deleteModal.loss;

    if (!loss) {
      return;
    }

    if (deletingId) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    setDeletingId(
      loss.id
    );

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "delete_loss",
        {
          p_loss_id:
            Number(loss.id),
        }
      );

      if (error) {
        throw error;
      }

      if (
        !data?.success
      ) {
        throw new Error(
          data?.message ||
          "Kerugian gagal dihapus."
        );
      }

      const biotaName =
        loss?.biota?.name ||
        "Biota";


      // =================================================
      // HAPUS DARI LIST
      // =================================================

      setLosses(
        (currentLosses) =>
          currentLosses.filter(
            (item) =>
              item.id !==
              loss.id
          )
      );


      // =================================================
      // TUTUP MODAL
      // =================================================

      setDeleteModal({
        open: false,
        loss: null,
      });


      // =================================================
      // SUCCESS
      // =================================================

      setSuccessMessage(
        `Catatan kerugian ${biotaName} berhasil dihapus dan stok telah dikembalikan.`
      );

    } catch (error) {
      console.error(
        "Gagal menghapus kerugian:",
        error
      );

      setErrorMessage(
        error?.message ||
        "Gagal menghapus kerugian."
      );

    } finally {
      setDeletingId(
        null
      );
    }
  }


  // =====================================================
  // BACK
  // =====================================================

  function handleBack() {
    navigate(
      "/employee"
    );
  }


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">

        <div className="mx-auto max-w-3xl">

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Memuat riwayat kerugian...
            </p>

          </div>

        </div>

      </main>
    );
  }


  // =====================================================
  // DATA MODAL
  // =====================================================

  const modalLoss =
    deleteModal.loss;

  const modalBiotaName =
    modalLoss?.biota?.name ||
    "Biota";

  const modalQuantity =
    Number(
      modalLoss?.quantity || 0
    );

  const modalRetailPrice =
    Number(
      modalLoss?.biota?.retail_price ||
      0
    );

  const modalLossType =
    getLossType(
      modalLoss?.loss_type
    );


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <button
            type="button"
            onClick={handleBack}
            className="text-left text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
          >
            ← Kembali ke Dashboard
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


        {/* TITLE */}

        <div className="mb-6">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">
            Dark Reef Marine
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Riwayat Kerugian
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Catatan kerugian biota berdasarkan waktu penginputan.
          </p>

        </div>


        {/* SUCCESS */}

        {successMessage && (
          <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

            <div className="flex items-start gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                ✓
              </div>

              <div>

                <p className="text-sm font-bold text-emerald-800">
                  Berhasil
                </p>

                <p className="mt-1 text-xs leading-5 text-emerald-700">
                  {successMessage}
                </p>

              </div>

            </div>

          </div>
        )}


        {/* ERROR */}

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold leading-6 text-red-700">
              ⚠️ {errorMessage}
            </p>

          </div>
        )}


        {/* LIST */}

        {losses.length === 0 ? (

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <div className="text-5xl">
              📋
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-800">
              Belum Ada Riwayat Kerugian
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Catatan kerugian yang sudah diinput akan muncul di sini.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {losses.map(
              (loss) => {

                const lossType =
                  getLossType(
                    loss.loss_type
                  );

                const biotaName =
                  loss?.biota?.name ||
                  "Biota";

                const englishName =
                  loss?.biota?.english_name ||
                  "";

                const quantity =
                  Number(
                    loss.quantity || 0
                  );

                const retailPrice =
                  Number(
                    loss?.biota?.retail_price ||
                    0
                  );

                const isDeleting =
                  deletingId ===
                  loss.id;

                return (
                  <div
                    key={loss.id}
                    className="rounded-2xl bg-white p-5 shadow-sm transition"
                  >

                    {/* NAMA + JENIS */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="min-w-0">

                        <h2 className="text-lg font-bold text-slate-900">
                          {biotaName} ×{" "}
                          {quantity}
                        </h2>

                        {englishName && (
                          <p className="mt-1 text-xs text-slate-400">
                            {englishName}
                          </p>
                        )}

                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${lossType.className}`}
                      >
                        {lossType.icon}{" "}
                        {lossType.label}
                      </span>

                    </div>


                    {/* WAKTU */}

                    <p className="mt-3 text-xs text-slate-400">
                      {formatDateTime(
                        loss.created_at
                      )}
                    </p>


                    {/* KETERANGAN */}

                    {loss.note && (
                      <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">

                        <p className="text-xs font-medium text-slate-400">
                          Keterangan
                        </p>

                        <p className="mt-1 text-sm leading-5 text-slate-700">
                          {loss.note}
                        </p>

                      </div>
                    )}


                    {/* RETAIL + HAPUS */}

                    <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">

                      <div>

                        <p className="text-xs text-slate-400">
                          Nilai Retail
                        </p>

                        <p className="mt-1 text-lg font-bold text-cyan-600">
                          Rp{" "}
                          {formatRupiah(
                            retailPrice *
                            quantity
                          )}
                        </p>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          openDeleteModal(
                            loss
                          )
                        }
                        disabled={
                          deletingId !==
                          null
                        }
                        className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting
                          ? "⏳ Menghapus..."
                          : "🗑️ Hapus"}
                      </button>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}


        {/* BACK BUTTON */}

        <button
          type="button"
          onClick={handleBack}
          className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
        >
          ← Kembali ke Dashboard
        </button>

      </div>


      {/* DELETE MODAL */}

      {deleteModal.open && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
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

            {/* HEADER */}

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
                    Data ini akan dihapus dari riwayat kerugian.
                  </p>

                </div>

              </div>

            </div>


            {/* DETAIL */}

            <div className="px-6">

              <div className="rounded-2xl bg-slate-50 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-slate-400">
                      Biota
                    </p>

                    <p className="mt-1 truncate text-base font-bold text-slate-900">
                      {modalBiotaName}
                    </p>

                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold ${modalLossType.className}`}
                  >
                    {modalLossType.icon}{" "}
                    {modalLossType.label}
                  </span>

                </div>


                <div className="mt-4 grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-white p-3">

                    <p className="text-[11px] font-medium text-slate-400">
                      Jumlah
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {modalQuantity}
                    </p>

                  </div>


                  <div className="rounded-xl bg-white p-3">

                    <p className="text-[11px] font-medium text-slate-400">
                      Nilai Retail
                    </p>

                    <p className="mt-1 text-sm font-bold text-cyan-600">
                      Rp{" "}
                      {formatRupiah(
                        modalRetailPrice *
                        modalQuantity
                      )}
                    </p>

                  </div>

                </div>

              </div>


              {/* WARNING STOK */}

              <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="text-lg">
                    ⚠️
                  </div>

                  <div>

                    <p className="text-sm font-bold text-amber-800">
                      Stok akan dikembalikan
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      Stok{" "}
                      <strong>
                        {modalBiotaName}
                      </strong>{" "}
                      akan bertambah kembali sebanyak{" "}
                      <strong>
                        {modalQuantity}
                      </strong>{" "}
                      ekor.
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* BUTTONS */}

            <div className="flex gap-3 px-6 pb-6 pt-5">

              <button
                type="button"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deletingId !== null
                }
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={
                  confirmDeleteLoss
                }
                disabled={
                  deletingId !== null
                }
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingId !== null
                  ? "⏳ Menghapus..."
                  : "🗑️ Ya, Hapus"}
              </button>

            </div>

          </div>

        </div>
      )}

    </main>
  );
}


export default EmployeeLossHistory;