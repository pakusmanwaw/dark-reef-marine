import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { toJpeg } from "html-to-image";

import { supabase } from "../services/supabase";
import { useAuth } from "../context/useAuth";


function EmployeeSalesClean() {
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

  // =========================================================
  // SEARCH PRODUK
  // =========================================================

  const [productSearch, setProductSearch] =
    useState("");

  const [activeSearchIndex, setActiveSearchIndex] =
    useState(null);


  const [completedSale, setCompletedSale] =
    useState(null);


  const [completedItems, setCompletedItems] =
    useState([]);


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

    const result =
      await logout();


    if (result?.success) {

      window.location.replace(
        "/login"
      );

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
    ).toLocaleString(
      "id-ID"
    );

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


    // =====================================================
    // RESELLER
    // =====================================================

    if (saleType === "reseller") {

      return Number(
        product.reseller_price ??
        product.retail_price ??
        product.price ??
        0
      );

    }


    // =====================================================
    // ONLINE SHOP
    // RETAIL + 20%
    // =====================================================

    if (saleType === "online_shop") {

      const retailPrice =
        Number(
          product.retail_price ??
          product.price ??
          0
        );


      return Math.round(
        retailPrice * 1.20
      );

    }


    // =====================================================
    // RETAIL
    // =====================================================

    return Number(
      product.retail_price ??
      product.price ??
      0
    );

  }


  // =========================================================
  // FILTER PRODUK UNTUK SEARCH
  // =========================================================

  function getFilteredProducts() {

    const keyword =
      productSearch.trim().toLowerCase();


    if (!keyword) {
      return products;
    }


    return products.filter(
      (product) =>
        String(
          product.name || ""
        )
          .toLowerCase()
          .includes(keyword) ||

        String(
          product.english_name || ""
        )
          .toLowerCase()
          .includes(keyword)
    );

  }


  // =========================================================
  // TOTAL
  // =========================================================

  const totalAmount =
    useMemo(() => {

      return items.reduce(
        (
          total,
          item
        ) => {

          const product =
            products.find(
              (productItem) =>
                String(
                  productItem.id
                ) ===
                String(
                  item.productId
                )
            );


          let price = 0;


          if (product) {

            if (
              saleType ===
              "reseller"
            ) {

              price =
                Number(
                  product.reseller_price ??
                  product.retail_price ??
                  product.price ??
                  0
                );

            } else if (
              saleType ===
              "online_shop"
            ) {

              const retailPrice =
                Number(
                  product.retail_price ??
                  product.price ??
                  0
                );


              price =
                Math.round(
                  retailPrice * 1.20
                );

            } else {

              price =
                Number(
                  product.retail_price ??
                  product.price ??
                  0
                );

            }

          }


          const quantity =
            Math.max(
              0,
              Number(
                item.quantity || 0
              )
            );


          return (
            total +
            price *
              quantity
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

  function handleSaleTypeChange(
    type
  ) {

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

    setItems(
      (currentItems) => {

        const nextItems = [
          ...currentItems,
        ];


        nextItems[index] = {
          ...nextItems[index],
          productId,
          quantity: 1,
        };


        return nextItems;

      }
    );


    const selectedProduct =
      getProduct(productId);

    setProductSearch(
      selectedProduct?.name || ""
    );

    setActiveSearchIndex(null);

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
      Math.floor(
        nextQuantity
      );


    if (
      nextQuantity < 1
    ) {

      nextQuantity = 1;

    }


    if (
      stock > 0 &&
      nextQuantity > stock
    ) {

      nextQuantity =
        stock;

    }


    setItems(
      (currentItems) => {

        const nextItems = [
          ...currentItems,
        ];


        nextItems[index] = {
          ...nextItems[index],
          quantity:
            nextQuantity,
        };


        return nextItems;

      }
    );


    setErrorMessage("");

  }


  // =========================================================
  // ADD ITEM
  // =========================================================

  function handleAddItem() {

    setItems(
      (currentItems) => [
        ...currentItems,

        {
          productId: "",
          quantity: 1,
        },
      ]
    );

    setProductSearch("");
    setActiveSearchIndex(null);

  }


  // =========================================================
  // REMOVE ITEM
  // =========================================================

  function handleRemoveItem(
    index
  ) {

    setItems(
      (currentItems) => {

        if (
          currentItems.length === 1
        ) {

          return currentItems;

        }


        return currentItems.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !==
            index
        );

      }
    );

    setProductSearch("");
    setActiveSearchIndex(null);

  }


  // =========================================================
  // BACK
  // =========================================================

  function handleBack() {

    navigate(
      "/employee"
    );

  }


  // =========================================================
  // NEW SALE
  // =========================================================

  async function handleNewSale() {

    setSaleType(
      "retail"
    );


    setCustomerName(
      ""
    );


    setItems([
      {
        productId: "",
        quantity: 1,
      },
    ]);

    setProductSearch("");
    setActiveSearchIndex(null);


    setErrorMessage(
      ""
    );


    setCompletedItems(
      []
    );


    setCompletedSale(
      null
    );


    setLoadingProducts(
      true
    );


    try {

      const {
        data,
        error,
      } =
        await supabase
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


      setProducts(
        data || []
      );


    } catch (error) {

      console.error(
        "Refresh product error:",
        error
      );


      setErrorMessage(
        "Gagal memperbarui stok produk."
      );


    } finally {

      setLoadingProducts(
        false
      );

    }

  }


  // =========================================================
  // SAVE SALE
  // =========================================================

  async function handleSaveSale(
    event
  ) {

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
          Number(
            item.quantity
          ) <= 0
      );


    if (invalidItem) {

      setErrorMessage(
        "Pastikan semua produk sudah dipilih dan jumlahnya benar."
      );


      return;

    }


    if (
      totalAmount <= 0
    ) {

      setErrorMessage(
        "Total nota harus lebih dari Rp0."
      );


      return;

    }


    const productIds =
      items.map(
        (item) =>
          String(
            item.productId
          )
      );


    const duplicateProduct =
      productIds.some(
        (
          id,
          index
        ) =>
          productIds.indexOf(
            id
          ) !== index
      );


    if (
      duplicateProduct
    ) {

      setErrorMessage(
        "Produk yang sama tidak boleh dimasukkan dua kali. Gabungkan jumlahnya pada satu baris."
      );


      return;

    }


    setSaving(true);


    try {

      const payloadItems =
        items.map(
          (item) => ({
            biota_id:
              Number(
                item.productId
              ),

            quantity:
              Number(
                item.quantity
              ),
          })
        );


      const {
        data,
        error,
      } =
        await supabase.rpc(
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
        items.map(
          (item) => {

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

          }
        );


      setCompletedItems(
        savedItems
      );


      setCompletedSale(
        data
      );


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

    if (!completedSale) {

      alert(
        "Nota belum siap untuk diexport."
      );


      return;

    }


    let exportNode =
      null;


    try {

      // =====================================================
      // TEMPLATE
      // =====================================================

      const escapeHtml =
        (value) =>
          String(
            value ?? ""
          )
            .replace(
              /&/g,
              "&amp;"
            )
            .replace(
              /</g,
              "&lt;"
            )
            .replace(
              />/g,
              "&gt;"
            )
            .replace(
              /"/g,
              "&quot;"
            )
            .replace(
              /'/g,
              "&#039;"
            );


      const invoiceNumber =
        completedSale.invoice_number ||
        completedSale.sale_number ||
        "nota-dark-reef";


      // =====================================================
      // RECEIPT TYPE
      // =====================================================

      let receiptType =
        "RETAIL";


      if (
        completedSale.sale_type ===
        "reseller"
      ) {

        receiptType =
          "RESELLER";

      } else if (
        completedSale.sale_type ===
        "online_shop"
      ) {

        receiptType =
          "ONLINE SHOP";

      }


      const receiptDate =
        completedSale.created_at
          ? new Date(
              completedSale.created_at
            ).toLocaleDateString(
              "id-ID"
            )
          : "-";


      const customerNameValue =
        completedSale.customer_name ||
        "Customer";


      const totalAmountValue =
        Number(
          completedSale.total_amount ||
          0
        );


      const productsHtml =
        completedItems
          .map(
            (
              item,
              index
            ) => `

              <div
                style="
                  padding:18px 0;
                  border-bottom:${
                    index !==
                    completedItems.length - 1
                      ? "1px solid #e2e8f0"
                      : "none"
                  };
                "
              >

                <div
                  style="
                    display:flex;
                    justify-content:space-between;
                    align-items:flex-start;
                    gap:20px;
                  "
                >

                  <div>

                    <div
                      style="
                        font-size:18px;
                        font-weight:700;
                      "
                    >
                      ${escapeHtml(
                        item.productName
                      )}
                    </div>


                    <div
                      style="
                        margin-top:6px;
                        font-size:13px;
                        color:#64748b;
                      "
                    >
                      ${Number(
                        item.quantity || 0
                      )} × Rp ${formatRupiah(
                        item.unitPrice
                      )}
                    </div>

                  </div>


                  <div
                    style="
                      font-size:18px;
                      font-weight:700;
                      white-space:nowrap;
                    "
                  >
                    Rp ${formatRupiah(
                      item.subtotal
                    )}
                  </div>

                </div>

              </div>

            `
          )
          .join("");


      exportNode =
        document.createElement(
          "div"
        );


      exportNode.style.position =
        "absolute";

      exportNode.style.left =
        "0";

      exportNode.style.top =
        "0";

      exportNode.style.width =
        "700px";

      exportNode.style.background =
        "#ffffff";

      exportNode.style.padding =
        "40px";

      exportNode.style.boxSizing =
        "border-box";

      exportNode.style.fontFamily =
        "Arial, Helvetica, sans-serif";

      exportNode.style.color =
        "#0f172a";

      exportNode.style.pointerEvents =
        "none";


      exportNode.innerHTML = `

        <div
          style="
            width:100%;
            background:#ffffff;
          "
        >

          <!-- HEADER -->

          <div
            style="
              text-align:center;
              border-bottom:3px solid #06b6d4;
              padding-bottom:24px;
            "
          >

            <div
              style="
                font-size:18px;
                font-weight:800;
                letter-spacing:5px;
                color:#0891b2;
              "
            >
              DARK REEF MARINE
            </div>


            <div
              style="
                margin-top:8px;
                font-size:30px;
                font-weight:800;
              "
            >
              NOTA PENJUALAN
            </div>


            <div
              style="
                margin-top:8px;
                font-size:14px;
                color:#64748b;
              "
            >
              We Sell with Love, Not Just for Money.
            </div>

          </div>


          <!-- INFO -->

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:20px;
              margin-top:28px;
              margin-bottom:28px;
            "
          >

            <div>

              <div
                style="
                  font-size:12px;
                  color:#94a3b8;
                  margin-bottom:5px;
                "
              >
                NOMOR NOTA
              </div>

              <div
                style="
                  font-size:17px;
                  font-weight:700;
                "
              >
                ${escapeHtml(
                  invoiceNumber
                )}
              </div>

            </div>


            <div>

              <div
                style="
                  font-size:12px;
                  color:#94a3b8;
                  margin-bottom:5px;
                "
              >
                TANGGAL
              </div>

              <div
                style="
                  font-size:17px;
                  font-weight:700;
                "
              >
                ${escapeHtml(
                  receiptDate
                )}
              </div>

            </div>


            <div>

              <div
                style="
                  font-size:12px;
                  color:#94a3b8;
                  margin-bottom:5px;
                "
              >
                CUSTOMER
              </div>

              <div
                style="
                  font-size:17px;
                  font-weight:700;
                "
              >
                ${escapeHtml(
                  customerNameValue
                )}
              </div>

            </div>


            <div>

              <div
                style="
                  font-size:12px;
                  color:#94a3b8;
                  margin-bottom:5px;
                "
              >
                TIPE PENJUALAN
              </div>

              <div
                style="
                  font-size:17px;
                  font-weight:700;
                  color:${
                    receiptType ===
                    "RESELLER"
                      ? "#7c3aed"
                      : receiptType ===
                        "ONLINE SHOP"
                        ? "#059669"
                        : "#0891b2"
                  };
                "
              >
                ${receiptType}
              </div>

            </div>

          </div>


          <!-- PRODUCTS -->

          <div
            style="
              border-top:1px solid #e2e8f0;
              border-bottom:1px solid #e2e8f0;
            "
          >

            ${productsHtml}

          </div>


          <!-- TOTAL -->

          <div
            style="
              display:flex;
              justify-content:space-between;
              align-items:center;
              margin-top:25px;
              padding:20px;
              border-radius:14px;
              background:#0f172a;
              color:#ffffff;
            "
          >

            <div
              style="
                font-size:18px;
                font-weight:600;
              "
            >
              TOTAL
            </div>


            <div
              style="
                font-size:28px;
                font-weight:800;
              "
            >
              Rp ${formatRupiah(
                totalAmountValue
              )}
            </div>

          </div>


          <!-- FOOTER -->

          <div
            style="
              text-align:center;
              margin-top:35px;
              padding-top:20px;
              border-top:1px solid #e2e8f0;
            "
          >

            <div
              style="
                font-size:15px;
                font-weight:700;
              "
            >
              Terima kasih sudah berbelanja di Dark Reef Marine 🙏
            </div>


            <div
              style="
                margin-top:8px;
                font-size:12px;
                color:#64748b;
              "
            >
              Dark Reef Marine • Bandung
            </div>


            <div
              style="
                margin-top:4px;
                font-size:11px;
                color:#94a3b8;
              "
            >
              We Sell with Love, Not Just for Money.
            </div>

          </div>

        </div>

      `;


      document.body.appendChild(
        exportNode
      );


      await new Promise(
        (resolve) => {

          requestAnimationFrame(
            () => {

              requestAnimationFrame(
                resolve
              );

            }
          );

        }
      );


      const dataUrl =
        await toJpeg(
          exportNode,
          {
            quality: 0.95,
            pixelRatio: 2,
            backgroundColor:
              "#ffffff",
            cacheBust: true,
          }
        );


      const link =
        document.createElement(
          "a"
        );


      link.download =
        `${invoiceNumber}.jpg`;


      link.href =
        dataUrl;


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );


    } catch (error) {

      console.error(
        "Gagal membuat JPG:",
        error
      );


      alert(
        "Gagal membuat gambar nota. Silakan coba lagi."
      );


    } finally {

      if (
        exportNode?.parentNode
      ) {

        exportNode.parentNode.removeChild(
          exportNode
        );

      }

    }

  }


  // =========================================================
  // SUCCESS PAGE
  // =========================================================

  if (completedSale) {

    return (

      <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 sm:py-10">

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
              Transaksi berhasil disimpan dan stok produk sudah diperbarui.
            </p>


            <div className="mt-8 rounded-2xl bg-slate-50 p-5">

              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Nomor Nota
              </p>


              <p className="mt-2 text-xl font-bold text-slate-900">
                {completedSale.invoice_number ||
                  completedSale.sale_number}
              </p>

            </div>


            <div className="mt-4 grid grid-cols-2 gap-3">

              <div className="rounded-2xl bg-cyan-50 p-4">

                <p className="text-xs text-cyan-600">
                  Tipe
                </p>


                <p className="mt-1 font-bold capitalize text-cyan-800">
                  {completedSale.sale_type ===
                  "online_shop"
                    ? "Online Shop"
                    : completedSale.sale_type}
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


            <button
              type="button"
              onClick={
                handleExportJpg
              }
              className="mt-8 w-full rounded-xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              📷 Export JPG
            </button>


            <button
              type="button"
              onClick={
                handleNewSale
              }
              className="mt-3 w-full rounded-xl bg-cyan-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-cyan-700"
            >
              🧾 Buat Nota Baru
            </button>


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


            <div className="mt-5 grid gap-4 sm:grid-cols-3">

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


              {/* ONLINE SHOP */}

              <button
                type="button"
                onClick={() =>
                  handleSaleTypeChange(
                    "online_shop"
                  )
                }
                className={`rounded-2xl border-2 p-5 text-left transition ${
                  saleType ===
                  "online_shop"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >

                <div className="flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${
                        saleType ===
                        "online_shop"
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-100"
                      }`}
                    >
                      🌐
                    </div>


                    <div>

                      <h3 className="font-bold">
                        Online Shop
                      </h3>


                      <p className="mt-1 text-xs text-slate-500">
                        Retail + 20%
                      </p>

                    </div>

                  </div>


                  <div
                    className={`h-5 w-5 rounded-full border-2 ${
                      saleType ===
                      "online_shop"
                        ? "border-emerald-500 bg-emerald-500"
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
                  : saleType ===
                    "reseller"
                    ? "bg-violet-50 text-violet-700"
                    : "bg-emerald-50 text-emerald-700"
              }`}
            >

              Harga yang ditampilkan akan otomatis
              menggunakan harga{" "}

              <strong>

                {saleType ===
                "retail"
                  ? "Retail"
                  : saleType ===
                    "reseller"
                    ? "Reseller"
                    : "Online Shop (Retail + 20%)"}

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


                            <div className="relative mt-2">

                              <div className="relative">

                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                  🔍
                                </span>


                                <input
                                  type="text"
                                  value={
                                    activeSearchIndex === index
                                      ? productSearch
                                      : product?.name || ""
                                  }
                                  onFocus={() => {

                                    const currentProduct =
                                      getProduct(
                                        item.productId
                                      );


                                    setProductSearch(
                                      currentProduct?.name || ""
                                    );

                                    setActiveSearchIndex(
                                      index
                                    );

                                  }}
                                  onChange={(
                                    event
                                  ) => {

                                    setProductSearch(
                                      event.target.value
                                    );

                                    setActiveSearchIndex(
                                      index
                                    );

                                  }}
                                  placeholder="Cari nama biota..."
                                  autoComplete="off"
                                  className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                                />

                              </div>


                              {activeSearchIndex === index && (

                                <div className="absolute left-0 right-0 z-50 mt-2 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xl">

                                  {getFilteredProducts().length > 0 ? (

                                    getFilteredProducts().map(
                                      (productItem) => {

                                        const productStock =
                                          Number(
                                            productItem.stock || 0
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

                                        } else if (
                                          saleType ===
                                          "online_shop"
                                        ) {

                                          const retailPrice =
                                            Number(
                                              productItem.retail_price ??
                                              productItem.price ??
                                              0
                                            );


                                          productPrice =
                                            Math.round(
                                              retailPrice *
                                              1.20
                                            );

                                        }


                                        const disabled =
                                          productStock <= 0;


                                        return (

                                          <button
                                            key={
                                              productItem.id
                                            }
                                            type="button"
                                            disabled={
                                              disabled
                                            }
                                            onMouseDown={(
                                              event
                                            ) => {
                                              event.preventDefault();
                                            }}
                                            onClick={() => {

                                              handleProductChange(
                                                index,
                                                productItem.id
                                              );

                                            }}
                                            className={`w-full rounded-xl px-3 py-3 text-left transition ${
                                              disabled
                                                ? "cursor-not-allowed opacity-40"
                                                : "hover:bg-cyan-50"
                                            }`}
                                          >

                                            <div className="flex items-center justify-between gap-3">

                                              <div className="min-w-0">

                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                  {
                                                    productItem.name
                                                  }
                                                </p>


                                                {productItem.english_name && (

                                                  <p className="mt-0.5 truncate text-xs text-slate-400">
                                                    {
                                                      productItem.english_name
                                                    }
                                                  </p>

                                                )}

                                              </div>


                                              <div className="shrink-0 text-right">

                                                <p className="text-sm font-bold text-cyan-600">
                                                  Rp{" "}
                                                  {
                                                    formatRupiah(
                                                      productPrice
                                                    )
                                                  }
                                                </p>


                                                <p
                                                  className={`mt-0.5 text-xs font-medium ${
                                                    disabled
                                                      ? "text-red-400"
                                                      : "text-slate-400"
                                                  }`}
                                                >
                                                  Stok{" "}
                                                  {
                                                    productStock
                                                  }
                                                </p>

                                              </div>

                                            </div>

                                          </button>

                                        );

                                      }
                                    )

                                  ) : (

                                    <div className="px-4 py-5 text-center text-sm text-slate-500">
                                      Biota tidak ditemukan.
                                    </div>

                                  )}

                                </div>

                              )}

                            </div>

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
                    : saleType ===
                      "reseller"
                      ? "Reseller"
                      : "Online Shop"}

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


export default EmployeeSalesClean;