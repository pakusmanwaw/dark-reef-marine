import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../services/supabase";
import { useAuth } from "../context/useAuth";
import { setPageTitle } from "../utils/pageTitle";

function Admin() {
  useEffect(() => {
  setPageTitle("Dashboard Pangersa");
}, []);
  const navigate = useNavigate();
  const { logout } = useAuth();

  async function handleLogout() {
    const result = await logout();

    if (result?.success) {
      window.location.replace("/login");
    } else {
      console.error("Logout gagal:", result?.error);
    }
  }

  const [biota, setBiota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    english_name: "",
    category: "",
    condition: "",
    size: "",
    cost_price: "",
    retail_price: "",
    reseller_price: "",
    stock: "",
    difficulty: "",
    temperament: "",
    reef_safe: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  // =========================================================
  // SEARCH INVENTORY
  // =========================================================

  const [inventorySearch, setInventorySearch] =
    useState("");

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchBiota() {
      const { data, error } = await supabase.rpc(
        "get_owner_inventory"
      );

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Gagal mengambil inventory Owner:",
          error
        );
        setMessage(
          `Gagal mengambil inventory: ${error.message}`
        );
        setMessageType("error");
      } else {
        setBiota(Array.isArray(data) ? data : []);
      }

      setLoading(false);
    }

    fetchBiota();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // REFRESH DATA
  // =========================================================

  async function loadBiota() {
    setLoading(true);

    const { data, error } = await supabase.rpc(
      "get_owner_inventory"
    );

    if (error) {
      console.error(
        "Gagal mengambil inventory Owner:",
        error
      );
      setMessage(
        `Gagal mengambil inventory: ${error.message}`
      );
      setMessageType("error");
    } else {
      setBiota(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  }

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  // =========================================================
  // CEK EQUIPMENT
  // =========================================================

  const isEquipment = form.category === "Equipment";

  const hasCategory = Boolean(form.category);

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  function formatRupiah(value) {
    return Number(value || 0).toLocaleString("id-ID");
  }

  // =========================================================
  // HANDLE FOTO
  // =========================================================

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setMessage("File harus berupa gambar.");
      setMessageType("error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Ukuran foto maksimal 5 MB.");
      setMessageType("error");
      return;
    }

    setSelectedImage(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    setMessage("");
    setMessageType("");
  }

  // =========================================================
  // RESET FORM
  // =========================================================

  function resetForm() {
    setForm({
      name: "",
      english_name: "",
      category: "",
      condition: "",
      size: "",
      cost_price: "",
      retail_price: "",
      reseller_price: "",
      stock: "",
      difficulty: "",
      temperament: "",
      reef_safe: "",
      description: "",
    });

    setSelectedImage(null);
    setImagePreview("");
    setEditingId(null);
  }

  // =========================================================
  // EDIT DATA
  // =========================================================

  function handleEdit(item) {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      english_name: item.english_name || "",
      category: item.category || "",
      condition: item.condition || "",
      size: item.size || "",

      cost_price: item.cost_price ?? "",
      retail_price:
        item.retail_price ?? item.price ?? "",
      reseller_price: item.reseller_price ?? "",

      stock: item.stock ?? "",
      difficulty: item.difficulty || "",
      temperament: item.temperament || "",
      reef_safe: item.reef_safe || "",
      description: item.description || "",
    });

    setSelectedImage(null);
    setImagePreview(item.image_url || "");

    setMessage("");
    setMessageType("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================================================
  // DELETE MODAL
  // =========================================================

  function openDeleteModal(item) {
    setDeleteTarget(item);
    setMessage("");
    setMessageType("");
  }

  function closeDeleteModal() {
    if (deleting) {
      return;
    }

    setDeleteTarget(null);
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const { error } = await supabase
        .from("biota")
        .delete()
        .eq("id", deleteTarget.id);

      if (error) {
        throw new Error(
          `Gagal menghapus data: ${error.message}`
        );
      }

      if (editingId === deleteTarget.id) {
        resetForm();
      }

      const deletedName =
        deleteTarget.name || "Produk";

      setDeleteTarget(null);

      setMessage(
        `"${deletedName}" berhasil dihapus.`
      );

      setMessageType("success");

      await loadBiota();
    } catch (error) {
      console.error("ERROR HAPUS:", error);

      setMessage(
        error.message ||
          "Terjadi kesalahan saat menghapus data."
      );

      setMessageType("error");
    } finally {
      setDeleting(false);
      setSaving(false);
    }
  }

  // =========================================================
  // UPLOAD FOTO
  // =========================================================

  async function uploadImage() {
    if (!selectedImage) {
      return null;
    }

    const fileExtension =
      selectedImage.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const safeName =
      form.name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") ||
      "produk";

    const fileName =
      `${safeName}-${Date.now()}.${fileExtension}`;

    const filePath =
      `biota/${fileName}`;

    const { error: uploadError } =
      await supabase.storage
        .from("biota-images")
        .upload(
          filePath,
          selectedImage,
          {
            cacheControl: "3600",
            upsert: false,
          }
        );

    if (uploadError) {
      throw new Error(
        `Gagal upload foto: ${uploadError.message}`
      );
    }

    const { data: publicUrlData } =
      supabase.storage
        .from("biota-images")
        .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // =========================================================
  // VALIDASI HARGA
  // =========================================================

  function validatePrices() {
    const cost =
      Number(form.cost_price || 0);

    const retail =
      Number(form.retail_price || 0);

    const reseller =
      Number(form.reseller_price || 0);

    if (
      cost < 0 ||
      retail < 0 ||
      reseller < 0
    ) {
      return "Harga tidak boleh bernilai negatif.";
    }

    return null;
  }

  // =========================================================
  // SIMPAN / UPDATE
  // =========================================================

  async function handleSubmit(event) {
    event.preventDefault();

    if (!hasCategory) {
      setMessage("Pilih kategori terlebih dahulu.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      // -------------------------------------------------------
      // VALIDASI HARGA
      // -------------------------------------------------------

      const priceError =
        validatePrices();

      if (priceError) {
        throw new Error(priceError);
      }

      // -------------------------------------------------------
      // UPLOAD FOTO
      // -------------------------------------------------------

      let imageUrl =
        imagePreview || null;

      if (selectedImage) {
        imageUrl =
          await uploadImage();
      }

      // -------------------------------------------------------
      // NILAI UMUM
      // -------------------------------------------------------

      const retailPrice =
        Number(form.retail_price || 0);

      const stockValue =
        Number(form.stock || 0);

      // =======================================================
      // DATA EQUIPMENT
      // =======================================================

      let dataToSave;

      if (isEquipment) {
        dataToSave = {
          name: form.name,

          // Equipment tidak memakai English Name
          english_name: null,

          category: "Equipment",

          // Baru / Bekas
          condition: form.condition,

          size: null,

          // Equipment tidak memakai modal / reseller
          cost_price: 0,
          retail_price: retailPrice,
          reseller_price: 0,

          // Compatibility dengan sistem lama
          price: retailPrice,

          stock: stockValue,

          difficulty: null,
          temperament: null,
          reef_safe: null,

          description:
            form.description,

          image_url: imageUrl,
        };
      } else {
        // =====================================================
        // DATA BIOTA
        // =====================================================

        const costPrice =
          Number(form.cost_price || 0);

        const resellerPrice =
          Number(form.reseller_price || 0);

        dataToSave = {
          name: form.name,
          english_name:
            form.english_name,

          category:
            form.category,

          condition: null,

          size:
            form.size,

          cost_price:
            costPrice,

          retail_price:
            retailPrice,

          reseller_price:
            resellerPrice,

          // Compatibility dengan sistem lama
          price:
            retailPrice,

          stock:
            stockValue,

          difficulty:
            form.difficulty,

          temperament:
            form.temperament,

          reef_safe:
            form.reef_safe,

          description:
            form.description,

          image_url:
            imageUrl,
        };
      }

      // =======================================================
      // UPDATE
      // =======================================================

      if (editingId) {
        const {
          error: updateError,
        } = await supabase
          .from("biota")
          .update(dataToSave)
          .eq("id", editingId);

        if (updateError) {
          throw new Error(
            `Gagal mengupdate data: ${updateError.message}`
          );
        }

        // -----------------------------------------------------
        // REFRESH INVENTORY MELALUI RPC OWNER
        // -----------------------------------------------------
        // Kita tidak membaca ulang tabel biota secara langsung
        // karena SELECT tabel dibatasi untuk menjaga cost_price/HPP.

        setMessage(
          isEquipment
            ? "Equipment berhasil diperbarui."
            : "Biota berhasil diperbarui."
        );

        setMessageType("success");

        resetForm();

        await loadBiota();

        return;
      }

      // =======================================================
      // INSERT
      // =======================================================

      const {
        error: insertError,
      } = await supabase
        .from("biota")
        .insert([dataToSave]);

      if (insertError) {
        throw new Error(
          `Gagal menyimpan data: ${insertError.message}`
        );
      }

      setMessage(
        isEquipment
          ? "Equipment berhasil ditambahkan."
          : "Biota berhasil ditambahkan."
      );

      setMessageType("success");

      resetForm();

      await loadBiota();

    } catch (error) {
      console.error(
        "ERROR SIMPAN / UPDATE:",
        error
      );

      setMessage(
        error.message ||
          "Terjadi kesalahan saat menyimpan data."
      );

      setMessageType("error");
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // PREVIEW INVENTORY
  // KHUSUS BIOTA
  // =========================================================

  const currentStock =
    Number(form.stock || 0);

  const currentCost =
    Number(form.cost_price || 0);

  const currentRetail =
    Number(form.retail_price || 0);

  const currentReseller =
    Number(form.reseller_price || 0);

  const stockCostValue =
    currentStock * currentCost;

  const stockRetailValue =
    currentStock * currentRetail;

  const stockResellerValue =
    currentStock * currentReseller;

  const potentialRetailProfit =
    stockRetailValue -
    stockCostValue;

  const potentialResellerProfit =
    stockResellerValue -
    stockCostValue;

  // =========================================================
  // FILTER INVENTORY
  // =========================================================

  const filteredInventory = useMemo(() => {
    const keyword =
      inventorySearch.trim().toLowerCase();

    if (!keyword) {
      return biota;
    }

    return biota.filter((item) => {
      const name =
        item.name?.toLowerCase() || "";

      const englishName =
        item.english_name?.toLowerCase() || "";

      const category =
        item.category?.toLowerCase() || "";

      const condition =
        item.condition?.toLowerCase() || "";

      const description =
        item.description?.toLowerCase() || "";

      return (
        name.includes(keyword) ||
        englishName.includes(keyword) ||
        category.includes(keyword) ||
        condition.includes(keyword) ||
        description.includes(keyword)
      );
    });
  }, [biota, inventorySearch]);


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-7xl">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 sm:text-sm">
              Dark Reef Marine
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Sampurasun, Pangersa
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
              Kelola biota, macroalgae, equipment,
              harga, stok, dan inventory Dark Reef Marine.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            {/* LAPORAN PENJUALAN */}
            <button
              type="button"
              onClick={() => navigate("/owner/sales")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 transition hover:bg-cyan-100"
            >
              <span>📊</span>
              Laporan Penjualan
            </button>

            {/* LAPORAN KERUGIAN */}
            <button
              type="button"
              onClick={() => navigate("/owner/loss")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <span>📉</span>
              Laporan Kerugian
            </button>

            {/* LAPORAN HARIAN */}
            <button
              type="button"
              onClick={() => navigate("/owner/daily-report")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <span>📅</span>
              Laporan Harian
            </button>

            {/* LOGOUT */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <span>↪</span>
              Logout
            </button>
          </div>

        </div>


        {/* ===================================================
            MAIN GRID
        =================================================== */}

        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">

          {/* =================================================
              FORM
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            {/* HEADER FORM */}

            <div className="flex items-start justify-between gap-4">

              <div>

                <h2 className="text-2xl font-bold">

                  {editingId
                    ? isEquipment
                      ? "Edit Equipment"
                      : "Edit Biota"
                    : isEquipment
                    ? "Tambah Equipment"
                    : "Tambah Biota"}

                </h2>

                <p className="mt-1 text-sm text-slate-500">

                  {isEquipment
                    ? "Tambahkan equipment aquarium baru atau bekas."
                    : "Tambahkan ikan, coral, invertebrate, clean up crew, atau macroalgae."}

                </p>

              </div>

              {editingId && (

                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Batal
                </button>

              )}

            </div>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-4"
            >

              {/* =================================================
                  KATEGORI - WAJIB PILIH PALING AWAL
              ================================================= */}

              <div className="rounded-2xl border-2 border-cyan-100 bg-cyan-50/50 p-4">

                <label
                  htmlFor="category"
                  className="mb-2 block text-sm font-bold text-slate-800"
                >
                  Kategori
                </label>

                <p className="mb-3 text-xs leading-5 text-slate-500">
                  Pilih kategori terlebih dahulu sebelum mengisi
                  data produk.
                </p>

                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border-2 border-slate-300 bg-white px-4 py-3.5 font-semibold text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="">
                    Pilih kategori terlebih dahulu
                  </option>

                  <option value="Marine Fish">
                    Marine Fish
                  </option>

                  <option value="Coral">
                    Coral
                  </option>

                  <option value="Invertebrate">
                    Invertebrate
                  </option>

                  <option value="Clean Up Crew">
                    Clean Up Crew
                  </option>

                  <option value="Macroalgae">
                    Macroalgae
                  </option>

                  <option value="Equipment">
                    Equipment
                  </option>
                </select>

              </div>

              {/* Semua field produk terkunci sebelum kategori dipilih */}
              <fieldset
                disabled={!hasCategory}
                className="space-y-4"
              >

              {/* =================================================
                  FOTO
              ================================================= */}

              <div>

                <label className="mb-2 block text-sm font-medium">
                  Foto {isEquipment ? "Produk" : "Biota"}
                </label>

                <div className="overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">

                  {imagePreview ? (

                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-56 w-full object-cover"
                    />

                  ) : (

                    <div className="flex h-56 items-center justify-center px-6 text-center">

                      <div>

                        <div className="text-4xl">
                          📷
                        </div>

                        <p className="mt-2 text-sm font-medium text-slate-600">
                          Belum ada foto
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          JPG, PNG, WEBP — maksimal 5 MB
                        </p>

                      </div>

                    </div>

                  )}

                  <div className="border-t border-slate-200 p-3">

                    <label className="flex cursor-pointer items-center justify-center rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700">

                      {selectedImage
                        ? "Ganti Foto"
                        : editingId
                        ? "Ganti Foto"
                        : "Pilih Foto"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />

                    </label>

                  </div>

                </div>

              </div>


              {/* =================================================
                  NAMA
              ================================================= */}

              <div>

                <label className="mb-1 block text-sm font-medium">

                  {isEquipment
                    ? "Nama Produk"
                    : "Nama Biota"}

                </label>

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder={
                    isEquipment
                      ? "Contoh: Jebao SLW-10"
                      : "Contoh: Nemo"
                  }
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                />

              </div>


              {/* =================================================
                  ENGLISH NAME
                  HANYA BIOTA
              ================================================= */}

              {!isEquipment && (

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    English Name
                  </label>

                  <input
                    type="text"
                    name="english_name"
                    value={form.english_name}
                    onChange={handleChange}
                    placeholder="Contoh: Ocellaris Clownfish"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                  />

                </div>

              )}


              {/* =================================================
                  EQUIPMENT CONDITION
                  HANYA EQUIPMENT
              ================================================= */}

              {isEquipment && (

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Kondisi Produk
                  </label>

                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-500"
                  >

                    <option value="">
                      Pilih kondisi
                    </option>

                    <option value="Baru">
                      Baru
                    </option>

                    <option value="Bekas">
                      Bekas
                    </option>

                  </select>

                </div>

              )}


              {/* =================================================
                  FIELD KHUSUS BIOTA
              ================================================= */}

              {!isEquipment && (

                <>

                  {/* UKURAN */}

                  <div>

                    <label className="mb-1 block text-sm font-medium">
                      Ukuran
                    </label>

                    <input
                      type="text"
                      name="size"
                      value={form.size}
                      onChange={handleChange}
                      placeholder="Contoh: 4-5 cm"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                    />

                  </div>


                  {/* HARGA BIOTA */}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">

                    <div className="mb-4">

                      <p className="text-sm font-bold text-slate-900">
                        💰 Informasi Harga
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Modal dan harga jual per unit.
                      </p>

                    </div>

                    <div className="space-y-4">

                      {/* MODAL */}

                      <div>

                        <label className="mb-1 block text-sm font-medium">
                          Modal / Harga Beli
                        </label>

                        <div className="relative">

                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            Rp
                          </span>

                          <input
                            type="number"
                            name="cost_price"
                            value={form.cost_price}
                            onChange={handleChange}
                            placeholder="70000"
                            min="0"
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-cyan-500"
                          />

                        </div>

                      </div>


                      {/* RETAIL */}

                      <div>

                        <label className="mb-1 block text-sm font-medium">
                          Harga Satuan
                        </label>

                        <div className="relative">

                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            Rp
                          </span>

                          <input
                            type="number"
                            name="retail_price"
                            value={form.retail_price}
                            onChange={handleChange}
                            placeholder="120000"
                            min="0"
                            required
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-cyan-500"
                          />

                        </div>

                      </div>


                      {/* RESELLER */}

                      <div>

                        <label className="mb-1 block text-sm font-medium">
                          Harga Reseller
                        </label>

                        <div className="relative">

                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                            Rp
                          </span>

                          <input
                            type="number"
                            name="reseller_price"
                            value={form.reseller_price}
                            onChange={handleChange}
                            placeholder="100000"
                            min="0"
                            className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-cyan-500"
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                </>

              )}


              {/* =================================================
                  HARGA EQUIPMENT
              ================================================= */}

              {isEquipment && (

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Harga
                  </label>

                  <div className="relative">

                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      Rp
                    </span>

                    <input
                      type="number"
                      name="retail_price"
                      value={form.retail_price}
                      onChange={handleChange}
                      placeholder="500000"
                      min="0"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 outline-none transition focus:border-cyan-500"
                    />

                  </div>

                </div>

              )}


              {/* =================================================
                  STOK
              ================================================= */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  {editingId
                    ? "Stok Saat Ini"
                    : "Stok"}
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  required
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                />

              </div>


              {/* =================================================
                  PREVIEW INVENTORY
                  KHUSUS BIOTA
              ================================================= */}

              {!isEquipment &&
                (form.stock ||
                  form.cost_price ||
                  form.retail_price ||
                  form.reseller_price) && (

                  <div className="rounded-2xl bg-slate-900 p-4 text-white">

                    <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                      Preview Nilai Inventory
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3">

                      <div className="rounded-xl bg-white/10 p-3">

                        <p className="text-xs text-slate-300">
                          Modal Stok
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          Rp{" "}
                          {formatRupiah(
                            stockCostValue
                          )}
                        </p>

                      </div>


                      <div className="rounded-xl bg-white/10 p-3">

                        <p className="text-xs text-slate-300">
                          Nilai Satuan
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          Rp{" "}
                          {formatRupiah(
                            stockRetailValue
                          )}
                        </p>

                      </div>


                      <div className="rounded-xl bg-white/10 p-3">

                        <p className="text-xs text-slate-300">
                          Nilai Reseller
                        </p>

                        <p className="mt-1 text-sm font-bold">
                          Rp{" "}
                          {formatRupiah(
                            stockResellerValue
                          )}
                        </p>

                      </div>


                      <div className="rounded-xl bg-cyan-500/20 p-3">

                        <p className="text-xs text-cyan-200">
                          Potensi Laba Satuan
                        </p>

                        <p className="mt-1 text-sm font-bold text-cyan-300">
                          Rp{" "}
                          {formatRupiah(
                            potentialRetailProfit
                          )}
                        </p>

                      </div>

                    </div>


                    <div className="mt-3 rounded-xl bg-emerald-500/10 p-3">

                      <p className="text-xs text-emerald-200">
                        Potensi Laba Reseller
                      </p>

                      <p className="mt-1 font-bold text-emerald-300">
                        Rp{" "}
                        {formatRupiah(
                          potentialResellerProfit
                        )}
                      </p>

                    </div>

                  </div>

                )}


              {/* =================================================
                  FIELD BIOTA TAMBAHAN
              ================================================= */}

              {!isEquipment && (

                <>

                  {/* DIFFICULTY */}

                  <div>

                    <label className="mb-1 block text-sm font-medium">
                      Tingkat Kesulitan
                    </label>

                    <select
                      name="difficulty"
                      value={form.difficulty}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-500"
                    >

                      <option value="">
                        Pilih tingkat kesulitan
                      </option>

                      <option value="Mudah">
                        Mudah
                      </option>

                      <option value="Sedang">
                        Sedang
                      </option>

                      <option value="Sulit">
                        Sulit
                      </option>

                    </select>

                  </div>


                  {/* TEMPERAMENT */}

                  <div>

                    <label className="mb-1 block text-sm font-medium">
                      Temperament
                    </label>

                    <input
                      type="text"
                      name="temperament"
                      value={form.temperament}
                      onChange={handleChange}
                      placeholder="Contoh: Damai"
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                    />

                  </div>


                  {/* REEF SAFE */}

                  <div>

                    <label className="mb-1 block text-sm font-medium">
                      Reef Safe
                    </label>

                    <select
                      name="reef_safe"
                      value={form.reef_safe}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-500"
                    >

                      <option value="">
                        Pilih status
                      </option>

                      <option value="Ya">
                        Ya
                      </option>

                      <option value="Tidak">
                        Tidak
                      </option>

                      <option value="Dengan Catatan">
                        Dengan Catatan
                      </option>

                    </select>

                  </div>

                </>

              )}


              {/* =================================================
                  DESKRIPSI
              ================================================= */}

              <div>

                <label className="mb-1 block text-sm font-medium">
                  Deskripsi
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder={
                    isEquipment
                      ? "Contoh: Kondisi masih bagus, fungsi normal, lengkap dengan adaptor."
                      : "Tuliskan informasi tentang biota..."
                  }
                  rows="4"
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-cyan-500"
                />

              </div>


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-cyan-600 px-5 py-3 font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {saving
                  ? editingId
                    ? "Mengupdate..."
                    : "Menyimpan..."
                  : editingId
                  ? isEquipment
                    ? "Update Equipment"
                    : "Update Biota"
                  : isEquipment
                  ? "Simpan Equipment"
                  : "Simpan Biota"}

              </button>

              </fieldset>

            </form>


            {/* =================================================
                MESSAGE
            ================================================= */}

            {message && (

              <div
                className={`mt-4 rounded-xl p-4 text-sm ${
                  messageType === "error"
                    ? "bg-red-50 text-red-700"
                    : "bg-green-50 text-green-700"
                }`}
              >
                {message}
              </div>

            )}

          </section>


          {/* =================================================
              INVENTORY
          ================================================= */}

          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  Inventory
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Data produk Dark Reef Marine. Gunakan pencarian untuk monitoring lebih cepat.
                </p>

              </div>

              <button
                type="button"
                onClick={loadBiota}
                disabled={saving}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50"
              >
                Refresh
              </button>

            </div>


            {/* =================================================
                SEARCH INVENTORY
            ================================================= */}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">

              <label
                htmlFor="inventory-search"
                className="block text-sm font-bold text-slate-900"
              >
                Cari Produk
              </label>

              <div className="relative mt-3">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  🔎
                </span>

                <input
                  id="inventory-search"
                  type="text"
                  value={inventorySearch}
                  onChange={(event) =>
                    setInventorySearch(event.target.value)
                  }
                  placeholder="Cari nama produk, English Name, kategori, kondisi..."
                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />

                {inventorySearch && (
                  <button
                    type="button"
                    onClick={() => setInventorySearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    ✕
                  </button>
                )}

              </div>

              <div className="mt-3 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                <p>
                  Menampilkan{" "}
                  <span className="font-bold text-slate-700">
                    {filteredInventory.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-slate-700">
                    {biota.length}
                  </span>{" "}
                  produk
                </p>

                {inventorySearch && (
                  <p>
                    Hasil pencarian:{" "}
                    <span className="font-semibold text-cyan-700">
                      "{inventorySearch}"
                    </span>
                  </p>
                )}

              </div>

            </div>


            <div className="mt-6 overflow-x-auto">

              {loading ? (

                <div className="py-10 text-center text-slate-500">
                  Memuat data...
                </div>

              ) : biota.length === 0 ? (

                <div className="rounded-xl bg-slate-50 p-10 text-center">

                  <p className="font-semibold">
                    Belum ada data.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Tambahkan produk menggunakan form.
                  </p>

                </div>

              ) : filteredInventory.length === 0 ? (

                <div className="rounded-xl bg-slate-50 p-10 text-center">

                  <div className="text-5xl">
                    🔎
                  </div>

                  <p className="mt-4 font-semibold">
                    Produk tidak ditemukan.
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Coba gunakan nama produk, kategori, atau kondisi yang berbeda.
                  </p>

                  <button
                    type="button"
                    onClick={() => setInventorySearch("")}
                    className="mt-5 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700"
                  >
                    Reset Pencarian
                  </button>

                </div>

              ) : (

                <table className="w-full min-w-300 text-left text-sm">

                  <thead>

                    <tr className="border-b border-slate-200">

                      <th className="px-3 py-3">
                        Foto
                      </th>

                      <th className="px-3 py-3">
                        Nama
                      </th>

                      <th className="px-3 py-3">
                        Kategori
                      </th>

                      <th className="px-3 py-3">
                        Kondisi
                      </th>

                      <th className="px-3 py-3">
                        Modal
                      </th>

                      <th className="px-3 py-3">
                        Harga
                      </th>

                      <th className="px-3 py-3">
                        Reseller
                      </th>

                      <th className="px-3 py-3">
                        Stok
                      </th>

                      <th className="px-3 py-3">
                        Nilai Stok
                      </th>

                      <th className="px-3 py-3">
                        Potensi Laba
                      </th>

                      <th className="px-3 py-3">
                        Aksi
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredInventory.map((item) => {

                      const itemIsEquipment =
                        item.category ===
                        "Equipment";

                      const cost =
                        Number(
                          item.cost_price || 0
                        );

                      const retail =
                        Number(
                          item.retail_price ??
                            item.price ??
                            0
                        );

                      const reseller =
                        Number(
                          item.reseller_price ||
                            0
                        );

                      const stock =
                        Number(
                          item.stock || 0
                        );

                      const modalStok =
                        cost * stock;

                      const potentialProfit =
                        itemIsEquipment
                          ? 0
                          : (retail - cost) *
                            stock;

                      return (

                        <tr
                          key={item.id}
                          className="border-b border-slate-100"
                        >

                          {/* FOTO */}

                          <td className="px-3 py-3">

                            {item.image_url ? (

                              <img
                                src={
                                  item.image_url
                                }
                                alt={
                                  item.name ||
                                  "Produk"
                                }
                                className="h-14 w-14 rounded-xl object-cover"
                              />

                            ) : (

                              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">
                                No Image
                              </div>

                            )}

                          </td>


                          {/* NAMA */}

                          <td className="px-3 py-4">

                            <p className="font-semibold">
                              {item.name ||
                                "-"}
                            </p>

                            {!itemIsEquipment &&
                              item.english_name && (

                                <p className="mt-1 text-xs text-slate-400">
                                  {
                                    item.english_name
                                  }
                                </p>

                              )}

                          </td>


                          {/* KATEGORI */}

                          <td className="px-3 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                item.category ===
                                "Equipment"
                                  ? "bg-slate-200 text-slate-700"
                                  : item.category ===
                                    "Macroalgae"
                                  ? "bg-green-100 text-green-700"
                                  : item.category ===
                                    "Coral"
                                  ? "bg-pink-100 text-pink-700"
                                  : "bg-cyan-100 text-cyan-700"
                              }`}
                            >
                              {item.category ||
                                "-"}
                            </span>

                          </td>


                          {/* KONDISI */}

                          <td className="px-3 py-4">

                            {itemIsEquipment ? (

                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                  item.condition ===
                                  "Baru"
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {item.condition ||
                                  "-"}
                              </span>

                            ) : (

                              <span className="text-slate-300">
                                —
                              </span>

                            )}

                          </td>


                          {/* MODAL */}

                          <td className="px-3 py-4 font-medium">

                            {itemIsEquipment ? (

                              <span className="text-slate-300">
                                —
                              </span>

                            ) : (

                              <>
                                Rp{" "}
                                {formatRupiah(
                                  cost
                                )}
                              </>

                            )}

                          </td>


                          {/* HARGA */}

                          <td className="px-3 py-4 font-semibold text-cyan-600">
                            Rp{" "}
                            {formatRupiah(
                              retail
                            )}
                          </td>


                          {/* RESELLER */}

                          <td className="px-3 py-4">

                            {itemIsEquipment ? (

                              <span className="text-slate-300">
                                —
                              </span>

                            ) : (

                              <>
                                Rp{" "}
                                {formatRupiah(
                                  reseller
                                )}
                              </>

                            )}

                          </td>


                          {/* STOK */}

                          <td className="px-3 py-4">

                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                stock > 0
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {stock}
                            </span>

                          </td>


                          {/* NILAI STOK */}

                          <td className="px-3 py-4 font-semibold text-slate-700">

                            {itemIsEquipment ? (

                              <>
                                Rp{" "}
                                {formatRupiah(
                                  retail *
                                    stock
                                )}
                              </>

                            ) : (

                              <>
                                Rp{" "}
                                {formatRupiah(
                                  modalStok
                                )}
                              </>

                            )}

                          </td>


                          {/* LABA */}

                          <td className="px-3 py-4 font-semibold text-emerald-600">

                            {itemIsEquipment ? (

                              <span className="text-slate-300">
                                —
                              </span>

                            ) : (

                              <>
                                Rp{" "}
                                {formatRupiah(
                                  potentialProfit
                                )}
                              </>

                            )}

                          </td>


                          {/* AKSI */}

                          <td className="px-3 py-4">

                            <div className="flex gap-2">

                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    item
                                  )
                                }
                                disabled={saving}
                                className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-semibold text-amber-700 transition hover:bg-amber-200 disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteModal(
                                    item
                                  )
                                }
                                disabled={saving}
                                className="rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                              >
                                Hapus
                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    })}

                  </tbody>

                </table>

              )}

            </div>

          </section>

        </div>

      </div>


      {/* =====================================================
          DELETE MODAL
      ====================================================== */}

      {deleteTarget && (

        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm"
          onClick={closeDeleteModal}
        >

          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="px-6 pb-2 pt-7 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
                🗑️
              </div>

              <h3 className="mt-5 text-2xl font-bold text-slate-900">

                Hapus{" "}
                {deleteTarget.category ===
                "Equipment"
                  ? "Equipment"
                  : "Biota"}
                ?

              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Data ini akan dihapus dari
                database Dark Reef Marine.
              </p>

            </div>


            {/* PREVIEW */}

            <div className="mx-6 mt-5 flex items-center gap-4 rounded-2xl bg-slate-50 p-4">

              {deleteTarget.image_url ? (

                <img
                  src={
                    deleteTarget.image_url
                  }
                  alt={
                    deleteTarget.name ||
                    "Produk"
                  }
                  className="h-16 w-16 rounded-xl object-cover"
                />

              ) : (

                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-200 text-2xl">
                  {deleteTarget.category ===
                  "Equipment"
                    ? "⚙️"
                    : "🐠"}
                </div>

              )}


              <div className="min-w-0">

                <p className="truncate font-bold text-slate-900">
                  {deleteTarget.name ||
                    "Produk tanpa nama"}
                </p>

                {deleteTarget.category ===
                "Equipment" ? (

                  <p className="mt-1 text-sm text-slate-500">
                    {deleteTarget.condition ||
                      "Kondisi tidak tersedia"}
                  </p>

                ) : (

                  <p className="mt-1 truncate text-sm text-slate-500">
                    {deleteTarget.english_name ||
                      "Tidak ada English Name"}
                  </p>

                )}

                <p className="mt-1 text-xs text-slate-400">
                  Kategori:{" "}
                  {deleteTarget.category ||
                    "-"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Stok:{" "}
                  {deleteTarget.stock ??
                    0}
                </p>

              </div>

            </div>


            {/* WARNING */}

            <div className="mx-6 mt-4 rounded-xl bg-red-50 px-4 py-3">

              <p className="text-center text-xs font-medium leading-5 text-red-600">
                ⚠️ Data yang sudah dihapus
                tidak dapat dikembalikan.
              </p>

            </div>


            {/* BUTTON */}

            <div className="flex gap-3 p-6">

              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting
                  ? "Menghapus..."
                  : "Hapus Data"}
              </button>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

export default Admin;