import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  supabase,
} from "../services/supabase";

import {
  useAuth,
} from "../context/useAuth";


// =========================================================
// OWNER DAILY NOTICE
// =========================================================

function OwnerDailyNotice() {

  const {
    user,
    profile,
    loading: authLoading,
  } = useAuth();


  // =======================================================
  // STATE
  // =======================================================

  const [
    showNotice,
    setShowNotice,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);


  // =======================================================
  // TANGGAL HARI INI
  // =======================================================

  const today =
    useMemo(() => {

      const now =
        new Date();

      const year =
        now.getFullYear();

      const month =
        String(
          now.getMonth() + 1
        ).padStart(
          2,
          "0"
        );

      const day =
        String(
          now.getDate()
        ).padStart(
          2,
          "0"
        );

      return `${year}-${month}-${day}`;

    }, []);


  // =======================================================
  // CEK LAPORAN HARI INI
  // =======================================================

  useEffect(() => {

    // Auth masih loading
    if (authLoading) {
      return;
    }


    // Belum ada user
    if (!user) {
      return;
    }


    // Profile belum tersedia
    if (!profile) {
      return;
    }


    // Bukan owner
    if (
      profile.role !== "owner"
    ) {
      return;
    }


    let cancelled = false;


    async function checkDailyReport() {

      try {

        // -------------------------------------------------
        // CARI LAPORAN HARI INI
        // -------------------------------------------------

        const {
          data,
          error,
        } =
          await supabase
            .from(
              "daily_owner_reports"
            )
            .select(
              "id, report_date, viewed_at"
            )
            .eq(
              "report_date",
              today
            )
            .maybeSingle();


        if (error) {
          throw error;
        }


        // -------------------------------------------------
        // KALAU BELUM ADA
        // BUAT RECORD BARU
        // -------------------------------------------------

        if (!data) {

          const {
            error:
              insertError,
          } =
            await supabase
              .from(
                "daily_owner_reports"
              )
              .insert({
                report_date:
                  today,
              });


          // 23505 = record sudah dibuat
          // oleh tab/request lain
          if (
            insertError &&
            insertError.code !==
              "23505"
          ) {

            throw insertError;

          }


          if (!cancelled) {

            setShowNotice(
              true
            );

          }


          return;

        }


        // -------------------------------------------------
        // SUDAH DILIHAT?
        // -------------------------------------------------

        if (!cancelled) {

          setShowNotice(
            !data.viewed_at
          );

        }

      } catch (error) {

        console.error(
          "Gagal mengecek laporan harian:",
          error
        );

      } finally {

        if (!cancelled) {

          setLoading(
            false
          );

        }

      }

    }


    checkDailyReport();


    return () => {

      cancelled = true;

    };

  }, [
    authLoading,
    user,
    profile,
    today,
  ]);


  // =======================================================
  // SINKRONISASI ANTAR TAB
  // =======================================================

  useEffect(() => {

    function handleStorage(
      event
    ) {

      if (
        event.key !==
        "drm-owner-daily-report-viewed"
      ) {

        return;

      }


      if (
        event.newValue ===
        today
      ) {

        setShowNotice(
          false
        );

      }

    }


    window.addEventListener(
      "storage",
      handleStorage
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorage
      );

    };

  }, [
    today,
  ]);


  // =======================================================
  // BUKA LAPORAN TAB BARU
  // =======================================================

  function handleOpenReport() {

    window.open(
      "/owner/daily-report",
      "_blank",
      "noopener,noreferrer"
    );

  }


  // =======================================================
  // JANGAN TAMPILKAN
  // =======================================================

  if (
    loading ||
    !showNotice
  ) {

    return null;

  }


  // =======================================================
  // RENDER
  // =======================================================

  return (

    <div className="mb-6 overflow-hidden rounded-3xl border border-amber-200 bg-linear-to-r from-amber-50 to-orange-50 shadow-sm">

      <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">

        {/* =================================================
            ICON + TEXT
        ================================================= */}

        <div className="flex items-start gap-4">

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-2xl">

            🔔

          </div>


          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">

              Laporan Harian

            </p>


            <h2 className="mt-1 text-lg font-bold text-slate-900">

              Laporan hari ini belum dilihat

            </h2>


            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">

              Laporan penjualan, HPP,
              laba, kerugian, dan stok
              hari ini sudah tersedia.

            </p>

          </div>

        </div>


        {/* =================================================
            BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={
            handleOpenReport
          }
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
        >

          📋 Lihat Laporan Hari Ini

        </button>

      </div>

    </div>

  );

}


export default OwnerDailyNotice;