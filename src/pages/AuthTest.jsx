import { useAuth } from "../context/useAuth";

function AuthTest() {
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    isOwner,
    isEmployee,
    logout,
  } = useAuth();


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm font-semibold text-slate-400">
            Mengecek session...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // AUTH TEST
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">

      <div className="mx-auto max-w-3xl">

        {/* HEADER */}

        <div className="mb-8">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
            Dark Reef Marine
          </p>

          <h1 className="mt-3 text-3xl font-bold text-white">
            Auth System Test
          </h1>

          <p className="mt-2 text-slate-400">
            Halaman sementara untuk menguji
            Supabase Auth dan Role.
          </p>

        </div>


        {/* CARD */}

        <div className="rounded-3xl bg-white p-6 shadow-xl">

          <h2 className="text-xl font-bold text-slate-950">
            Status Authentication
          </h2>


          {/* STATUS */}

          <div className="mt-6 space-y-4">

            {/* LOGIN */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <span className="font-semibold text-slate-700">
                Sudah Login
              </span>

              <span
                className={
                  isAuthenticated
                    ? "font-bold text-emerald-600"
                    : "font-bold text-red-500"
                }
              >
                {isAuthenticated
                  ? "YA"
                  : "TIDAK"}
              </span>

            </div>


            {/* OWNER */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <span className="font-semibold text-slate-700">
                Owner
              </span>

              <span
                className={
                  isOwner
                    ? "font-bold text-emerald-600"
                    : "font-bold text-slate-400"
                }
              >
                {isOwner
                  ? "YA"
                  : "TIDAK"}
              </span>

            </div>


            {/* EMPLOYEE */}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">

              <span className="font-semibold text-slate-700">
                Pegawai
              </span>

              <span
                className={
                  isEmployee
                    ? "font-bold text-emerald-600"
                    : "font-bold text-slate-400"
                }
              >
                {isEmployee
                  ? "YA"
                  : "TIDAK"}
              </span>

            </div>

          </div>


          {/* USER */}

          <div className="mt-8">

            <h2 className="text-lg font-bold text-slate-950">
              User Supabase
            </h2>

            <div className="mt-3 rounded-xl bg-slate-950 p-4">

              <p className="break-all text-sm text-slate-300">
                {user?.id || "Tidak ada user"}
              </p>

              <p className="mt-2 text-sm text-cyan-400">
                {user?.email || "Tidak ada email"}
              </p>

            </div>

          </div>


          {/* PROFILE */}

          <div className="mt-8">

            <h2 className="text-lg font-bold text-slate-950">
              Profile Database
            </h2>

            <div className="mt-3 rounded-xl bg-slate-950 p-4">

              <p className="text-sm text-slate-300">
                Nama:
              </p>

              <p className="mt-1 font-bold text-white">
                {profile?.full_name || "Tidak ada"}
              </p>


              <p className="mt-4 text-sm text-slate-300">
                Role:
              </p>

              <p className="mt-1 font-bold text-cyan-400">
                {profile?.role || "Tidak ada"}
              </p>

            </div>

          </div>


          {/* LOGOUT */}

          {isAuthenticated && (
            <button
              type="button"
              onClick={logout}
              className="mt-8 w-full rounded-xl bg-red-500 px-6 py-3.5 font-bold text-white transition hover:bg-red-600"
            >
              Logout Test
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default AuthTest;