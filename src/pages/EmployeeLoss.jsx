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

import {
  useAuth,
} from "../context/useAuth";

// =====================================================
// EMPLOYEE LOSS
// =====================================================

function EmployeeLoss() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [biotaList, setBiotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [biotaId, setBiotaId] = useState("");
  const [biotaSearch, setBiotaSearch] = useState("");
  const [showBiotaList, setShowBiotaList] = useState(false);

  const [lossType, setLossType] = useState("mati");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // LOAD BIOTA
  // =====================================================

  useEffect(() => {
    let cancelled = false;

    async function loadBiota() {
      setLoading(true);
      setErrorMessage("");

      try {
        const {
          data,
          error,
        } = await supabase
          .from("employee_biota")
          .select(`
            id,
            name,
            english_name,
            category,
            retail_price,
            stock
          `)
          .order("name", {
            ascending: true,
          });

        if (error) {
          throw error;
        }

        if (cancelled) {
          return;
        }

        setBiotaList(data || []);

      } catch (error) {
        if (!cancelled) {
          console.error(
            "Gagal mengambil data biota:",
            error
          );

          setErrorMessage(
            error?.message ||
              "Gagal mengambil data biota."
          );
        }

      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBiota();

    return () => {
      cancelled = true;
    };
  }, []);

  // =====================================================
  // SELECTED BIOTA
  // =====================================================

  const selectedBiota = useMemo(() => {
    return (
      biotaList.find(
        (item) =>
          String(item.id) ===
          String(biotaId)
      ) || null
    );
  }, [
    biotaList,
    biotaId,
  ]);

  // =====================================================
  // FILTER BIOTA
  // =====================================================

  const filteredBiota = useMemo(() => {
    const search =
      biotaSearch
        .trim()
        .toLowerCase();

    if (!search) {
      return biotaList;
    }

    return biotaList.filter((item) => {
      const name =
        String(
          item.name || ""
        ).toLowerCase();

      const englishName =
        String(
          item.english_name || ""
        ).toLowerCase();

      const category =
        String(
          item.category || ""
        ).toLowerCase();

      return (
        name.includes(search) ||
        englishName.includes(search) ||
        category.includes(search)
      );
    });
  }, [
    biotaList,
    biotaSearch,
  ]);

  // =====================================================
  // RETAIL PRICE
  // =====================================================

  const retailPrice =
    Number(
      selectedBiota?.retail_price || 0
    );

  // =====================================================
  // TOTAL RETAIL
  // =====================================================

  const totalRetail =
    retailPrice *
    Number(quantity || 0);

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  function formatRupiah(value) {
    return Number(
      value || 0
    ).toLocaleString("id-ID");
  }

  // =====================================================
  // SELECT BIOTA
  // =====================================================

  function handleSelectBiota(item) {
    if (
      Number(item.stock || 0) <= 0
    ) {
      setErrorMessage(
        `${item.name} sedang tidak memiliki stok.`
      );

      return;
    }

    setBiotaId(
      String(item.id)
    );

    setBiotaSearch(
      item.name || ""
    );

    setShowBiotaList(false);

    setQuantity(1);

    setErrorMessage("");
    setSuccessMessage("");
  }

  // =====================================================
  // CLEAR BIOTA
  // =====================================================

  function handleClearBiota() {
    setBiotaId("");
    setBiotaSearch("");
    setShowBiotaList(false);
    setQuantity(1);

    setErrorMessage("");
    setSuccessMessage("");
  }

  // =====================================================
  // SEARCH BIOTA
  // =====================================================

  function handleBiotaSearchChange(event) {
    const value =
      event.target.value;

    setBiotaSearch(value);
    setShowBiotaList(true);

    setErrorMessage("");
    setSuccessMessage("");

    if (biotaId) {
      setBiotaId("");
      setQuantity(1);
    }
  }

  // =====================================================
  // INCREASE QUANTITY
  // =====================================================

  function increaseQuantity() {
    if (!selectedBiota) {
      return;
    }

    const currentQuantity =
      Number(quantity || 0);

    const maxStock =
      Number(
        selectedBiota.stock || 0
      );

    if (
      currentQuantity >=
      maxStock
    ) {
      return;
    }

    setQuantity(
      currentQuantity + 1
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // =====================================================
  // DECREASE QUANTITY
  // =====================================================

  function decreaseQuantity() {
    const currentQuantity =
      Number(quantity || 0);

    if (currentQuantity <= 1) {
      return;
    }

    setQuantity(
      currentQuantity - 1
    );

    setErrorMessage("");
    setSuccessMessage("");
  }

  // =====================================================
  // SAVE LOSS
  // =====================================================

  async function handleSaveLoss(event) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedBiota) {
      setErrorMessage(
        "Silakan pilih biota terlebih dahulu."
      );

      return;
    }

    const finalQuantity =
      Number(quantity || 0);

    if (
      !finalQuantity ||
      finalQuantity <= 0
    ) {
      setErrorMessage(
        "Jumlah harus lebih dari 0."
      );

      return;
    }

    const currentStock =
      Number(
        selectedBiota.stock || 0
      );

    if (
      finalQuantity >
      currentStock
    ) {
      setErrorMessage(
        `Stok ${selectedBiota.name} hanya ${currentStock}.`
      );

      return;
    }

    setSaving(true);

    try {
      const {
        data,
        error,
      } = await supabase.rpc(
        "create_loss",
        {
          p_biota_id:
            Number(
              selectedBiota.id
            ),

          p_loss_type:
            lossType,

          p_quantity:
            finalQuantity,

          p_note:
            note.trim() ||
            null,
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.success) {
        throw new Error(
          data?.message ||
            "Kerugian gagal disimpan."
        );
      }

      // =================================================
      // INVENTORY MOVEMENT
      // create_loss sudah berhasil mengurangi stok.
      // Ambil stok terbaru lalu catat ke histori.
      // =================================================
      try {
        const { data: latestBiota, error: stockError } =
          await supabase
            .from("biota")
            .select("id, name, stock")
            .eq("id", Number(selectedBiota.id))
            .single();

        if (stockError) {
          console.error(
            "Gagal mengambil stok setelah kerugian:",
            stockError
          );
        } else {
          const { error: movementError } = await supabase
            .from("inventory_movements")
            .insert([
              {
                biota_id: Number(selectedBiota.id),
                product_name:
                  latestBiota?.name ||
                  selectedBiota?.name ||
                  "Produk",
                activity: "Kerugian",
                quantity_change: -Math.abs(finalQuantity),
                stock_after:
                  latestBiota?.stock == null
                    ? null
                    : Number(latestBiota.stock),
                created_at:
                  data?.created_at ||
                  new Date().toISOString(),
              },
            ]);

          if (movementError) {
            console.error(
              "Gagal mencatat histori kerugian:",
              movementError
            );
          }
        }
      } catch (movementError) {
        console.error(
          "Inventory movement loss log error:",
          movementError
        );
      }

      // =================================================
      // UPDATE STOK DI UI
      // =================================================

      setBiotaList(
        (currentList) =>
          currentList.map(
            (item) => {
              if (
                String(item.id) !==
                String(
                  selectedBiota.id
                )
              ) {
                return item;
              }

              return {
                ...item,
                stock:
                  Number(
                    item.stock || 0
                  ) -
                  finalQuantity,
              };
            }
          )
      );

      // =================================================
      // SUCCESS
      // =================================================

      setSuccessMessage(
        lossType === "bonus"
          ? `Bonus ${finalQuantity} ${selectedBiota.name} berhasil dicatat.`
          : `Kerugian ${finalQuantity} ${selectedBiota.name} berhasil dicatat.`
      );

      // =================================================
      // RESET FORM
      // =================================================

      setBiotaId("");
      setBiotaSearch("");
      setShowBiotaList(false);

      setLossType("mati");

      setQuantity(1);

      setNote("");

    } catch (error) {
      console.error(
        "Gagal menyimpan kerugian:",
        error
      );

      setErrorMessage(
        error?.message ||
          "Gagal menyimpan kerugian."
      );

    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // BACK
  // =====================================================

  function handleBack() {
    navigate("/employee");
  }

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-10">

        <div className="mx-auto max-w-2xl">

          <div className="rounded-3xl bg-white p-10 text-center shadow-sm">

            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

            <p className="mt-4 text-sm font-medium text-slate-500">
              Memuat data biota...
            </p>

          </div>

        </div>

      </main>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-2xl">

        {/* =================================================
            HEADER
        ================================================= */}

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

        {/* =================================================
            TITLE
        ================================================= */}

        <div className="mb-6">

          <p className="text-xs font-bold uppercase tracking-[0.3em] text-cyan-600">
            Dark Reef Marine
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            Catat Kerugian
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Catat biota yang mati atau diberikan sebagai bonus.
          </p>

        </div>

        {/* =================================================
            SUCCESS
        ================================================= */}

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

        {/* =================================================
            ERROR
        ================================================= */}

        {errorMessage && (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4">

            <p className="text-sm font-semibold leading-6 text-red-700">
              ⚠️ {errorMessage}
            </p>

          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSaveLoss}
          className="overflow-hidden rounded-3xl bg-white shadow-sm"
        >

          {/* =================================================
              BIOTA
          ================================================= */}

          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">

            <label
              htmlFor="biota-search"
              className="text-sm font-bold text-slate-800"
            >
              Biota
            </label>

            <p className="mt-1 text-xs text-slate-400">
              Cari lalu pilih biota yang mengalami kerugian.
            </p>

            <div className="relative mt-3">

              <div className="relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-slate-400">
                  🔍
                </span>

                <input
                  id="biota-search"
                  type="text"
                  value={biotaSearch}
                  onChange={
                    handleBiotaSearchChange
                  }
                  onFocus={() => {
                    setShowBiotaList(
                      true
                    );
                  }}
                  disabled={saving}
                  placeholder="Cari nama biota..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
                />

                {biotaSearch && (
                  <button
                    type="button"
                    onClick={
                      handleClearBiota
                    }
                    disabled={saving}
                    className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-sm font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ×
                  </button>
                )}

              </div>

              {/* BIOTA LIST */}

              {showBiotaList && (
                <div className="absolute left-0 right-0 z-30 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">

                  <div className="max-h-72 overflow-y-auto">

                    {filteredBiota.length ===
                    0 ? (

                      <div className="px-4 py-8 text-center">

                        <div className="text-3xl">
                          🔍
                        </div>

                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          Biota tidak ditemukan
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Coba gunakan nama lain.
                        </p>

                      </div>

                    ) : (

                      filteredBiota.map(
                        (item) => {

                          const isOutOfStock =
                            Number(
                              item.stock || 0
                            ) <= 0;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() =>
                                handleSelectBiota(
                                  item
                                )
                              }
                              disabled={
                                saving ||
                                isOutOfStock
                              }
                              className={`flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 ${
                                isOutOfStock
                                  ? "cursor-not-allowed bg-slate-50 opacity-50"
                                  : "hover:bg-cyan-50"
                              }`}
                            >

                              <div className="min-w-0">

                                <p className="truncate text-sm font-bold text-slate-800">
                                  {item.name}
                                </p>

                                {item.english_name && (
                                  <p className="mt-1 truncate text-xs text-slate-400">
                                    {
                                      item.english_name
                                    }
                                  </p>
                                )}

                              </div>

                              <div className="shrink-0 text-right">

                                <p className="text-xs text-slate-400">
                                  Stok
                                </p>

                                <p
                                  className={`text-sm font-bold ${
                                    isOutOfStock
                                      ? "text-red-500"
                                      : "text-cyan-600"
                                  }`}
                                >
                                  {item.stock}
                                </p>

                              </div>

                            </button>
                          );
                        }
                      )

                    )}

                  </div>

                </div>
              )}

            </div>

            {/* SELECTED BIOTA */}

            {selectedBiota && (
              <div className="mt-3 rounded-2xl border border-cyan-100 bg-cyan-50 p-4">

                <div className="flex items-center justify-between gap-4">

                  <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-600">
                      Biota Terpilih
                    </p>

                    <p className="mt-1 truncate text-lg font-bold text-slate-900">
                      {selectedBiota.name}
                    </p>

                    {selectedBiota.english_name && (
                      <p className="mt-1 text-xs text-slate-500">
                        {
                          selectedBiota.english_name
                        }
                      </p>
                    )}

                  </div>

                  <div className="shrink-0 text-right">

                    <p className="text-xs text-slate-400">
                      Stok tersedia
                    </p>

                    <p className="mt-1 text-lg font-bold text-cyan-600">
                      {selectedBiota.stock}
                    </p>

                  </div>

                </div>

              </div>
            )}

          </div>

          {/* =================================================
              LOSS TYPE
          ================================================= */}

          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">

            <label
              htmlFor="loss-type"
              className="text-sm font-bold text-slate-800"
            >
              Jenis Kerugian
            </label>

            <p className="mt-1 text-xs text-slate-400">
              Pilih apakah biota mati atau diberikan sebagai bonus.
            </p>

            <select
              id="loss-type"
              value={lossType}
              onChange={(event) => {
                setLossType(
                  event.target.value
                );
              }}
              disabled={saving}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
            >

              <option value="mati">
                ☠️ Mati
              </option>

              <option value="bonus">
                🎁 Dibonuskan
              </option>

            </select>

          </div>

          {/* =================================================
              QUANTITY
          ================================================= */}

          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">

            <label className="text-sm font-bold text-slate-800">
              Jumlah
            </label>

            <p className="mt-1 text-xs text-slate-400">
              Tentukan jumlah biota yang mengalami kerugian.
            </p>

            <div className="mt-4 flex items-center gap-4">

              <button
                type="button"
                onClick={
                  decreaseQuantity
                }
                disabled={
                  saving ||
                  quantity <= 1
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-xl font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                −
              </button>

              <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center">

                <p className="text-2xl font-bold text-slate-900">
                  {quantity}
                </p>

                <p className="mt-1 text-[11px] text-slate-400">
                  ekor / item
                </p>

              </div>

              <button
                type="button"
                onClick={
                  increaseQuantity
                }
                disabled={
                  saving ||
                  !selectedBiota ||
                  Number(quantity) >=
                    Number(
                      selectedBiota?.stock ||
                      0
                    )
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-white text-xl font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                +
              </button>

            </div>

            {selectedBiota && (
              <p className="mt-3 text-center text-xs text-slate-400">
                Maksimal{" "}
                {selectedBiota.stock}{" "}
                berdasarkan stok tersedia.
              </p>
            )}

          </div>

          {/* =================================================
              RETAIL PRICE
          ================================================= */}

          {selectedBiota && (
            <div className="border-b border-slate-200 px-6 py-6 sm:px-8">

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                      Harga Retail
                    </p>

                    <p className="mt-2 text-xl font-bold text-slate-900">
                      Rp{" "}
                      {formatRupiah(
                        retailPrice
                      )}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Harga yang digunakan pegawai.
                    </p>

                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                    🏷️
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* =================================================
              NOTE
          ================================================= */}

          <div className="border-b border-slate-200 px-6 py-6 sm:px-8">

            <label
              htmlFor="loss-note"
              className="text-sm font-bold text-slate-800"
            >
              Keterangan
            </label>

            <p className="mt-1 text-xs text-slate-400">
              Opsional. Tambahkan catatan jika diperlukan.
            </p>

            <textarea
              id="loss-note"
              value={note}
              onChange={(event) => {
                setNote(
                  event.target.value
                );
              }}
              disabled={saving}
              rows={4}
              placeholder={
                lossType === "bonus"
                  ? "Contoh: bonus untuk customer..."
                  : "Contoh: ikan mati setelah proses acclimation..."
              }
              className="mt-3 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100"
            />

          </div>

          {/* =================================================
              TOTAL RETAIL
          ================================================= */}

          <div className="px-6 py-6 sm:px-8">

            <div className="rounded-2xl bg-slate-900 p-6 text-white">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    Nilai Retail
                  </p>

                  <p className="mt-2 text-3xl font-bold">
                    Rp{" "}
                    {formatRupiah(
                      totalRetail
                    )}
                  </p>

                </div>

                <div className="rounded-xl bg-white/10 px-4 py-3 text-left sm:text-right">

                  <p className="text-xs text-slate-400">
                    Perhitungan
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {quantity} × Rp{" "}
                    {formatRupiah(
                      retailPrice
                    )}
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                SAVE
            ================================================= */}

            <button
              type="submit"
              disabled={
                saving ||
                !selectedBiota ||
                Number(quantity) <= 0
              }
              className="mt-4 w-full rounded-xl bg-cyan-600 px-5 py-4 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? "⏳ Menyimpan..."
                : "💾 Simpan Kerugian"}
            </button>

            {/* =================================================
                CANCEL
            ================================================= */}

            <button
              type="button"
              onClick={handleBack}
              disabled={saving}
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>

          </div>

        </form>

      </div>

    </main>
  );
}

export default EmployeeLoss;