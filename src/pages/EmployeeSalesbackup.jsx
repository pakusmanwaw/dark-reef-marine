import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { toJpeg } from "html-to-image";

import { supabase } from "../services/supabase";
import { useAuth } from "../context/useAuth";

function EmployeeSales() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] =
    useState(true);

  const [saleType, setSaleType] =
    useState("retail");

  const [customerName, setCustomerName] =
    useState("");

  const [items, setItems] = useState([
    {
      productId: "",
      quantity: 1,
    },
  ]);

  const [saving, setSaving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [completedSale, setCompletedSale] =
    useState(null);

  const [completedItems, setCompletedItems] =
    useState([]);

  const [receiptDate, setReceiptDate] =
    useState(null);

  const receiptRef = useRef(null);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        const {
          data,
          error,
        } = await supabase
          .from("biota")
          .select(`
            id,
            name,
            english_name,
            category,
            retail_price,
            reseller_price,
            price,
            stock,
            image_url
          `)
          .order("name", {
            ascending: true,
          });

        if (cancelled) {
          return;
        }

        if (error) {
          console.error(
            "Gagal mengambil produk:",
            error
          );

          setProducts([]);

          setErrorMessage(
            "Gagal mengambil data produk."
          );

          return;
        }

        setProducts(data || []);
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Product loading error:",
            error
          );

          setProducts([]);

          setErrorMessage(
            "Gagal mengambil data produk."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProducts(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // =========================================================
  // LOGOUT
  // =========================================================

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

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  function formatRupiah(value) {
    return Number(
      value || 0
    ).toLocaleString("id-ID");
  }

  // =========================================================
  // GET PRODUCT
  // =========================================================

  function getProduct(productId) {
    return products.find(
      (product) =>
        String(product.id) ===
        String(productId)
    );
  }

  // =========================================================
  // GET PRODUCT PRICE
  // =========================================================

  function getProductPrice(product) {
    if (!product) {
      return 0;
    }

    if (saleType === "reseller") {
      return Number(
        product.reseller_price ??
        product.retail_price ??
        product.price ??
        0
      );
    }

    return Number(
      product.retail_price ??
      product.price ??
      0
    );
  }

  // =========================================================
  // TOTAL
  // =========================================================

  const totalAmount = useMemo(() => {
    return items.reduce(
      (total, item) => {
        const product =
          products.find(
            (productItem) =>
              String(productItem.id) ===
              String(item.productId)
          );

        let price = 0;

        if (product) {
          if (
            saleType === "reseller"
          ) {
            price = Number(
              product.reseller_price ??
              product.retail_price ??
              product.price ??
              0
            );
          } else {
            price = Number(
              product.retail_price ??
              product.price ??
              0
            );
          }
        }

        const quantity = Math.max(
          0,
          Number(item.quantity || 0)
        );

        return (
          total +
          price * quantity
        );
      },
      0
    );
  }, [
    items,
    products,
    saleType,
  ]);

  // =========================================================
  // CHANGE SALE TYPE
  // =========================================================

  function handleSaleTypeChange(type) {
    setSaleType(type);
    setErrorMessage("");
  }

  // =========================================================
  // CHANGE PRODUCT
  // =========================================================

  function handleProductChange(
    index,
    productId
  ) {
    setItems((currentItems) => {
      const nextItems = [
        ...currentItems,
      ];

      nextItems[index] = {
        ...nextItems[index],
        productId,
        quantity: 1,
      };

      return nextItems;
    });

    setErrorMessage("");
  }

  // =========================================================
  // CHANGE QUANTITY
  // =========================================================

  function handleQuantityChange(
    index,
    quantity
  ) {
    const product =
      getProduct(
        items[index]?.productId
      );

    const stock =
      Number(
        product?.stock || 0
      );

    let nextQuantity =
      Number(quantity);

    if (
      !Number.isFinite(
        nextQuantity
      )
    ) {
      nextQuantity = 1;
    }

    nextQuantity =
      Math.floor(nextQuantity);

    if (nextQuantity < 1) {
      nextQuantity = 1;
    }

    if (
      stock > 0 &&
      nextQuantity > stock
    ) {
      nextQuantity = stock;
    }

    setItems((currentItems) => {
      const nextItems = [
        ...currentItems,
      ];

      nextItems[index] = {
        ...nextItems[index],
        quantity: nextQuantity,
      };

      return nextItems;
    });

    setErrorMessage("");
  }

  // =========================================================
  // ADD ITEM
  // =========================================================

  function handleAddItem() {
    setItems((currentItems) => [
      ...currentItems,
      {
        productId: "",
        quantity: 1,
      },
    ]);
  }

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  function handleRemoveItem(index) {
    setItems((currentItems) => {
      if (currentItems.length === 1) {
        return currentItems;
      }

      return currentItems.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  }

  // =========================================================
  // BACK
  // =========================================================

  function handleBack() {
    navigate("/employee");
  }

  // =========================================================
  // NEW SALE
  // =========================================================

  async function handleNewSale() {
    setSaleType("retail");

    setCustomerName("");

    setItems([
      {
        productId: "",
        quantity: 1,
      },
    ]);

    setErrorMessage("");

    setCompletedItems([]);

    setCompletedSale(null);

    setReceiptDate(null);

    setLoadingProducts(true);

    try {
      const {
        data,
        error,
      } = await supabase
        .from("biota")
        .select(`
          id,
          name,
          english_name,
          category,
          retail_price,
          reseller_price,
          price,
          stock,
          image_url
        `)
        .order("name", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Gagal refresh produk:",
          error
        );

        setErrorMessage(
          "Gagal memperbarui stok produk."
        );

        return;
      }

      setProducts(data || []);
    } catch (error) {
      console.error(
        "Refresh product error:",
        error
      );

      setErrorMessage(
        "Gagal memperbarui stok produk."
      );
    } finally {
      setLoadingProducts(false);
    }
  }

  // =========================================================
  // SAVE SALE
  // =========================================================

  async function handleSaveSale(event) {
    event.preventDefault();

    setErrorMessage("");

    if (saving) {
      return;
    }

    if (!saleType) {
      setErrorMessage(
        "Silakan pilih jenis penjualan."
      );

      return;
    }

    const invalidItem =
      items.some(
        (item) =>
          !item.productId ||
          Number(item.quantity) <= 0
      );

    if (invalidItem) {
      setErrorMessage(
        "Pastikan semua produk sudah dipilih dan jumlahnya benar."
      );

      return;
    }

    if (totalAmount <= 0) {
      setErrorMessage(
        "Total nota harus lebih dari Rp0."
      );

      return;
    }

    const productIds =
      items.map(
        (item) =>
          String(item.productId)
      );

    const duplicateProduct =
      productIds.some(
        (id, index) =>
          productIds.indexOf(id) !==
          index
      );

    if (duplicateProduct) {
      setErrorMessage(
        "Produk yang sama tidak boleh dimasukkan dua kali. Gabungkan jumlahnya pada satu baris."
      );

      return;
    }

    setSaving(true);

    try {
      const payloadItems =
        items.map((item) => ({
          biota_id: Number(
            item.productId
          ),

          quantity: Number(
            item.quantity
          ),
        }));

      const {
        data,
        error,
      } = await supabase.rpc(
        "create_sale",
        {
          p_customer_name:
            customerName.trim() ||
            null,

          p_sale_type:
            saleType,

          p_items:
            payloadItems,
        }
      );

      if (error) {
        console.error(
          "Gagal menyimpan nota:",
          error
        );

        setErrorMessage(
          error.message ||
          "Gagal menyimpan nota."
        );

        return;
      }

      if (!data) {
        setErrorMessage(
          "Nota tidak berhasil dibuat."
        );

        return;
      }

      // =====================================================
      // SIMPAN DETAIL ITEM UNTUK NOTA JPG
      // =====================================================

      const savedItems =
        items.map((item) => {
          const product =
            getProduct(
              item.productId
            );

          const quantity =
            Number(
              item.quantity || 0
            );

          const unitPrice =
            getProductPrice(
              product
            );

          return {
            productId:
              item.productId,

            productName:
              product?.name ||
              "Produk",

            quantity,

            unitPrice,

            subtotal:
              unitPrice *
              quantity,
          };
        });

      setCompletedItems(
        savedItems
      );

      // =====================================================
      // SIMPAN TANGGAL NOTA
      // =====================================================

      setReceiptDate(
        data.created_at
          ? new Date(
              data.created_at
            )
          : new Date()
      );

      setCompletedSale(data);
    } catch (error) {
      console.error(
        "Save sale error:",
        error
      );

      setErrorMessage(
        error?.message ||
        "Terjadi kesalahan saat menyimpan nota."
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================================================
  // EXPORT JPG
  // =========================================================

  async function handleExportJpg() {
    if (!receiptRef.current) {
      alert(
        "Nota belum siap untuk diexport."
      );

      return;
    }

    try {
      await new Promise((resolve) => {
        requestAnimationFrame(() => {
          resolve();
        });
      });

      const dataUrl =
        await toJpeg(
          receiptRef.current,
          {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor:
              "#ffffff",
            cacheBust: true,
          }
        );

      const invoiceNumber =
        completedSale?.invoice_number ||
        completedSale?.sale_number ||
        "nota-dark-reef";

      const link =
        document.createElement(
          "a"
        );

      link.download =
        `${invoiceNumber}.jpg`;

      link.href = dataUrl;

      link.click();
    } catch (error) {
      console.error(
        "Gagal membuat JPG:",
        error
      );

      alert(
        "Gagal membuat gambar nota. Silakan coba lagi."
      );
    }
  }

  // =========================================================
  // SUCCESS PAGE
  // =========================================================

  if (completedSale) {
    const receiptType =
      completedSale.sale_type ===
      "reseller"
        ? "RESELLER"
        : "RETAIL";

    return (
      <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

        {/* =================================================
            NOTA EXPORT JPG
        ================================================= */}

        <div
          ref={receiptRef}
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "700px",
            margin: "0 auto 24px auto",
            background: "#ffffff",
            padding: "40px",
            fontFamily:
              "Arial, Helvetica, sans-serif",
            color: "#0f172a",
            boxSizing: "border-box",
          }}
        >

          {/* HEADER */}

          <div
            style={{
              textAlign: "center",
              borderBottom:
                "3px solid #06b6d4",
              paddingBottom:
                "24px",
            }}
          >

            <div
              style={{
                fontSize: "18px",
                fontWeight: "800",
                letterSpacing:
                  "5px",
                color: "#0891b2",
              }}
            >
              DARK REEF MARINE
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "30px",
                fontWeight: "800",
              }}
            >
              NOTA PENJUALAN
            </div>

            <div
              style={{
                marginTop: "8px",
                fontSize: "14px",
                color: "#64748b",
              }}
            >
              We Sell with Love,
              Not Just for Money.
            </div>

          </div>


          {/* INFO */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "1fr 1fr",
              gap: "20px",
              marginTop: "28px",
              marginBottom:
                "28px",
            }}
          >

            <div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginBottom:
                    "5px",
                }}
              >
                NOMOR NOTA
              </div>

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                }}
              >
                {completedSale.invoice_number ||
                  completedSale.sale_number}
              </div>

            </div>


            <div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginBottom:
                    "5px",
                }}
              >
                TANGGAL
              </div>

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                }}
              >
                {receiptDate
                  ? receiptDate.toLocaleDateString(
                      "id-ID"
                    )
                  : "-"}
              </div>

            </div>


            <div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginBottom:
                    "5px",
                }}
              >
                CUSTOMER
              </div>

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                }}
              >
                {completedSale.customer_name ||
                  "Customer"}
              </div>

            </div>


            <div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#94a3b8",
                  marginBottom:
                    "5px",
                }}
              >
                TIPE PENJUALAN
              </div>

              <div
                style={{
                  fontSize: "17px",
                  fontWeight: "700",
                  color:
                    receiptType ===
                    "RESELLER"
                      ? "#7c3aed"
                      : "#0891b2",
                }}
              >
                {receiptType}
              </div>

            </div>

          </div>


          {/* PRODUCTS */}

          <div
            style={{
              borderTop:
                "1px solid #e2e8f0",
              borderBottom:
                "1px solid #e2e8f0",
            }}
          >

            {completedItems.map(
              (
                item,
                index
              ) => (
                <div
                  key={index}
                  style={{
                    padding:
                      "18px 0",
                    borderBottom:
                      index !==
                      completedItems.length -
                        1
                        ? "1px solid #e2e8f0"
                        : "none",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "flex-start",
                      gap: "20px",
                    }}
                  >

                    <div>

                      <div
                        style={{
                          fontSize:
                            "18px",
                          fontWeight:
                            "700",
                        }}
                      >
                        {
                          item.productName
                        }
                      </div>

                      <div
                        style={{
                          marginTop:
                            "6px",
                          fontSize:
                            "13px",
                          color:
                            "#64748b",
                        }}
                      >
                        {
                          item.quantity
                        }{" "}
                        × Rp{" "}
                        {formatRupiah(
                          item.unitPrice
                        )}
                      </div>

                    </div>


                    <div
                      style={{
                        fontSize:
                          "18px",
                        fontWeight:
                          "700",
                      }}
                    >
                      Rp{" "}
                      {formatRupiah(
                        item.subtotal
                      )}
                    </div>

                  </div>

                </div>
              )
            )}

          </div>


          {/* TOTAL */}

          <div
            style={{
              display: "flex",
              justifyContent:
                "space-between",
              alignItems:
                "center",
              marginTop: "25px",
              padding: "20px",
              borderRadius:
                "14px",
              background:
                "#0f172a",
              color: "#ffffff",
            }}
          >

            <div
              style={{
                fontSize:
                  "18px",
                fontWeight:
                  "600",
              }}
            >
              TOTAL
            </div>

            <div
              style={{
                fontSize:
                  "28px",
                fontWeight:
                  "800",
              }}
            >
              Rp{" "}
              {formatRupiah(
                completedSale.total_amount
              )}
            </div>

          </div>


          {/* FOOTER */}

          <div
            style={{
              textAlign: "center",
              marginTop: "35px",
              paddingTop:
                "20px",
              borderTop:
                "1px solid #e2e8f0",
            }}
          >

            <div
              style={{
                fontSize:
                  "15px",
                fontWeight:
                  "700",
              }}
            >
              Terima kasih sudah
              berbelanja di
              Dark Reef Marine 🙏
            </div>

            <div
              style={{
                marginTop:
                  "8px",
                fontSize:
                  "12px",
                color:
                  "#64748b",
              }}
            >
              Dark Reef Marine
              • Bandung
            </div>

            <div
              style={{
                marginTop:
                  "4px",
                fontSize:
                  "11px",
                color:
                  "#94a3b8",
              }}
            >
              We Sell with Love,
              Not Just for Money.
            </div>

          </div>

        </div>


        {/* =================================================
            SUCCESS CARD
        ================================================= */}

        <div className="mx-auto flex min-h-[80vh] max-w-xl items-center justify-center">

          <div className="w-full rounded-3xl bg-white p-6 text-center shadow-sm sm:p-10">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-5xl">
              ✓
            </div>


            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">
              Dark Reef Marine
            </p>


            <h1 className="mt-3 text-3xl font-bold">
              Nota Berhasil Dibuat
            </h1>


            <p className="mt-3 text-sm leading-6 text-slate-500">
              Transaksi berhasil disimpan dan
              stok produk sudah diperbarui.
            </p>


            {/* NOMOR NOTA */}

            <div className="mt-8 rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nomor Nota
              </p>

              <p className="mt-2 text-xl font-bold text-slate-900">
                {completedSale.invoice_number ||
                  completedSale.sale_number}
              </p>

            </div>


            {/* INFO */}

            <div className="mt-4 grid grid-cols-2 gap-3">

              <div className="rounded-2xl bg-cyan-50 p-4">

                <p className="text-xs text-cyan-600">
                  Tipe
                </p>

                <p className="mt-1 font-bold capitalize text-cyan-800">
                  {completedSale.sale_type}
                </p>

              </div>


              <div className="rounded-2xl bg-emerald-50 p-4">

                <p className="text-xs text-emerald-600">
                  Total
                </p>

                <p className="mt-1 font-bold text-emerald-800">
                  Rp{" "}
                  {formatRupiah(
                    completedSale.total_amount
                  )}
                </p>

              </div>

            </div>


            {/* EXPORT JPG */}

            <button
              type="button"
              onClick={
                handleExportJpg
              }
              className="mt-8 w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              📷 Export JPG
            </button>


            {/* NEW SALE */}

            <button
              type="button"
              onClick={
                handleNewSale
              }
              className="mt-3 w-full rounded-xl bg-cyan-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700"
            >
              🧾 Buat Nota Baru
            </button>


            {/* BACK */}

            <button
              type="button"
              onClick={
                handleBack
              }
              className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              ← Kembali ke Dashboard
            </button>

          </div>

        </div>

      </main>
    );
  }

  // =========================================================
  // MAIN FORM
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <button
              type="button"
              onClick={
                handleBack
              }
              className="mb-4 text-sm font-semibold text-slate-500 transition hover:text-cyan-600"
            >
              ← Kembali ke Dashboard
            </button>


            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600 sm:text-sm">
              Dark Reef Marine
            </p>


            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Buat Nota Penjualan
            </h1>


            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Catat pembelian pelanggan dengan cepat dan rapi.
            </p>

          </div>


          <button
            type="button"
            onClick={
              handleLogout
            }
            className="shrink-0 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
          >
            ↪ Logout
          </button>

        </header>


        {/* EMPLOYEE INFO */}

        <div className="mt-6 rounded-2xl bg-white px-5 py-4 shadow-sm">

          <p className="text-xs text-slate-400">
            Diproses oleh
          </p>

          <p className="mt-1 text-sm font-bold text-slate-800">
            {profile?.full_name ||
              "Pegawai Dark Reef"}
          </p>

        </div>


        <form
          onSubmit={
            handleSaveSale
          }
          className="mt-6"
        >

          {/* ERROR */}

          {errorMessage && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">

              <p className="text-sm font-semibold text-red-700">
                ⚠️{" "}
                {errorMessage}
              </p>

            </div>
          )}


          {/* SALE TYPE */}

          <section className="rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            <h2 className="text-xl font-bold">
              Jenis Penjualan
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Pilih tipe harga sebelum memilih produk.
            </p>


            <div className="mt-5 grid gap-4 sm:grid-cols-2">

              {/* RETAIL */}

              <button
                type="button"
                onClick={() =>
                  handleSaleTypeChange(
                    "retail"
                  )
                }
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  saleType ===
                  "retail"
                    ? "border-cyan-500 bg-cyan-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                        saleType ===
                        "retail"
                          ? "bg-cyan-500 text-white"
                          : "bg-slate-100"
                      }`}
                    >
                      🛒
                    </div>


                    <div>

                      <h3 className="font-bold">
                        Retail
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Harga normal customer
                      </p>

                    </div>

                  </div>


                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      saleType ===
                      "retail"
                        ? "border-cyan-500 bg-cyan-500"
                        : "border-slate-300"
                    }`}
                  />

                </div>

              </button>


              {/* RESELLER */}

              <button
                type="button"
                onClick={() =>
                  handleSaleTypeChange(
                    "reseller"
                  )
                }
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  saleType ===
                  "reseller"
                    ? "border-violet-500 bg-violet-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                        saleType ===
                        "reseller"
                          ? "bg-violet-500 text-white"
                          : "bg-slate-100"
                      }`}
                    >
                      📦
                    </div>


                    <div>

                      <h3 className="font-bold">
                        Reseller
                      </h3>

                      <p className="mt-1 text-xs text-slate-500">
                        Harga khusus reseller
                      </p>

                    </div>

                  </div>


                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      saleType ===
                      "reseller"
                        ? "border-violet-500 bg-violet-500"
                        : "border-slate-300"
                    }`}
                  />

                </div>

              </button>

            </div>


            <div
              className={`mt-4 rounded-xl px-4 py-3 text-sm font-medium ${
                saleType ===
                "retail"
                  ? "bg-cyan-50 text-cyan-700"
                  : "bg-violet-50 text-violet-700"
              }`}
            >
              Harga yang ditampilkan akan otomatis
              menggunakan harga{" "}
              <strong>
                {saleType ===
                "retail"
                  ? "Retail"
                  : "Reseller"}
              </strong>
              .
            </div>

          </section>


          {/* CUSTOMER */}

          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            <h2 className="text-xl font-bold">
              Data Customer
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Isi nama customer jika diperlukan.
            </p>


            <div className="mt-5">

              <label
                htmlFor="customer-name"
                className="block text-sm font-semibold text-slate-700"
              >
                Nama Customer
              </label>


              <input
                id="customer-name"
                type="text"
                value={
                  customerName
                }
                onChange={(
                  event
                ) =>
                  setCustomerName(
                    event.target.value
                  )
                }
                placeholder="Contoh: Budi"
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />

            </div>

          </section>


          {/* PRODUCTS */}

          <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm sm:p-6">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  Produk
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Pilih produk dan jumlah yang dibeli.
                </p>

              </div>


              <span className="text-xs font-medium text-slate-400">
                {items.length}{" "}
                item
              </span>

            </div>


            {loadingProducts ? (

              <div className="py-12 text-center">

                <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

                <p className="mt-3 text-sm text-slate-500">
                  Memuat produk...
                </p>

              </div>

            ) : products.length ===
              0 ? (

              <div className="mt-5 rounded-xl bg-slate-50 p-6 text-center">

                <div className="text-4xl">
                  📦
                </div>

                <p className="mt-3 font-bold">
                  Produk tidak tersedia
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Belum ada produk di inventory.
                </p>

              </div>

            ) : (

              <div className="mt-5 space-y-4">

                {items.map(
                  (
                    item,
                    index
                  ) => {

                    const product =
                      getProduct(
                        item.productId
                      );

                    const price =
                      getProductPrice(
                        product
                      );

                    const stock =
                      Number(
                        product?.stock ||
                        0
                      );

                    const subtotal =
                      price *
                      Number(
                        item.quantity ||
                        0
                      );

                    return (
                      <div
                        key={index}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                      >

                        <div className="grid gap-4 lg:grid-cols-[1fr_140px_190px_auto] lg:items-end">

                          <div>

                            <label className="block text-sm font-semibold text-slate-700">
                              Produk
                            </label>


                            <select
                              value={
                                item.productId
                              }
                              onChange={(
                                event
                              ) =>
                                handleProductChange(
                                  index,
                                  event.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                            >

                              <option value="">
                                Pilih produk...
                              </option>


                              {products.map(
                                (
                                  productItem
                                ) => {

                                  const productStock =
                                    Number(
                                      productItem.stock ||
                                      0
                                    );

                                  let productPrice =
                                    Number(
                                      productItem.retail_price ??
                                      productItem.price ??
                                      0
                                    );

                                  if (
                                    saleType ===
                                    "reseller"
                                  ) {
                                    productPrice =
                                      Number(
                                        productItem.reseller_price ??
                                        productItem.retail_price ??
                                        productItem.price ??
                                        0
                                      );
                                  }

                                  return (
                                    <option
                                      key={
                                        productItem.id
                                      }
                                      value={
                                        productItem.id
                                      }
                                      disabled={
                                        productStock <=
                                        0
                                      }
                                    >
                                      {
                                        productItem.name
                                      }
                                      {" — Rp "}
                                      {formatRupiah(
                                        productPrice
                                      )}
                                      {" — Stok "}
                                      {
                                        productStock
                                      }
                                    </option>
                                  );
                                }
                              )}

                            </select>

                          </div>


                          <div>

                            <label className="block text-sm font-semibold text-slate-700">
                              Jumlah
                            </label>


                            <input
                              type="number"
                              min="1"
                              max={
                                stock > 0
                                  ? stock
                                  : undefined
                              }
                              value={
                                item.quantity
                              }
                              disabled={
                                !item.productId
                              }
                              onChange={(
                                event
                              ) =>
                                handleQuantityChange(
                                  index,
                                  event.target.value
                                )
                              }
                              className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 disabled:bg-slate-100 disabled:text-slate-400"
                            />


                            {product && (
                              <p className="mt-1 text-xs text-slate-400">
                                Stok tersedia:{" "}
                                {stock}
                              </p>
                            )}

                          </div>


                          <div>

                            <p className="text-sm font-semibold text-slate-700">
                              Subtotal
                            </p>


                            <div className="mt-2 rounded-xl bg-white px-4 py-3">

                              <p className="text-xs text-slate-400">
                                {product
                                  ? `Rp ${formatRupiah(
                                      price
                                    )} × ${item.quantity}`
                                  : "Pilih produk terlebih dahulu"}
                              </p>


                              <p className="mt-1 text-lg font-bold text-cyan-600">
                                Rp{" "}
                                {formatRupiah(
                                  subtotal
                                )}
                              </p>

                            </div>

                          </div>


                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveItem(
                                index
                              )
                            }
                            disabled={
                              items.length ===
                              1
                            }
                            className="rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            Hapus
                          </button>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}


            {!loadingProducts &&
              products.length > 0 && (
                <button
                  type="button"
                  onClick={
                    handleAddItem
                  }
                  className="mt-5 w-full rounded-xl border-2 border-dashed border-slate-300 px-4 py-3 text-sm font-bold text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-700"
                >
                  + Tambah Produk
                </button>
              )}

          </section>


          {/* TOTAL */}

          <section className="mt-6 rounded-2xl bg-slate-900 p-6 text-white shadow-sm">

            <div className="flex items-center justify-between gap-4">

              <div>

                <p className="text-sm text-slate-400">
                  Total{" "}
                  {saleType ===
                  "retail"
                    ? "Retail"
                    : "Reseller"}
                </p>


                <p className="mt-1 text-3xl font-bold">
                  Rp{" "}
                  {formatRupiah(
                    totalAmount
                  )}
                </p>

              </div>


              <div className="text-4xl">
                🧾
              </div>

            </div>

          </section>


          {/* ACTION */}

          <section className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={
                handleBack
              }
              disabled={
                saving
              }
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Batal
            </button>


            <button
              type="submit"
              disabled={
                saving ||
                loadingProducts ||
                products.length ===
                  0 ||
                totalAmount <=
                  0 ||
                items.some(
                  (item) =>
                    !item.productId
                )
              }
              className="rounded-xl bg-cyan-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving
                ? "Menyimpan..."
                : "Simpan Nota"}
            </button>

          </section>

        </form>

      </div>

    </main>
  );
}

export default EmployeeSales;