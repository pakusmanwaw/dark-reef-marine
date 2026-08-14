import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function ProtectedRoute({
  children,
  allowedRoles = [],
}) {
  const {
    user,
    profile,
    loading,
  } = useAuth();


  // =====================================================
  // MASIH MENGECEK SESSION
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">

        <div className="text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm font-semibold text-slate-400">
            Memeriksa akses...
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // BELUM LOGIN
  // =====================================================

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }


  // =====================================================
  // PROFILE BELUM ADA
  // =====================================================

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">

        <div className="max-w-md text-center">

          <h1 className="text-2xl font-bold text-white">
            Profile Tidak Ditemukan
          </h1>

          <p className="mt-3 text-slate-400">
            Akun Anda belum memiliki profile
            yang terdaftar di sistem Dark Reef Marine.
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // CEK ROLE
  // =====================================================

  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(profile.role)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">

        <div className="max-w-md text-center">

          <div className="text-6xl">
            🔒
          </div>

          <h1 className="mt-5 text-3xl font-bold text-white">
            Akses Ditolak
          </h1>

          <p className="mt-3 text-slate-400">
            Anda tidak memiliki izin untuk
            membuka halaman ini.
          </p>

          <p className="mt-4 text-sm text-slate-500">
            Role Anda:{" "}
            <span className="font-bold text-cyan-400">
              {profile.role}
            </span>
          </p>

        </div>

      </div>
    );
  }


  // =====================================================
  // AKSES DIIZINKAN
  // =====================================================

  return children;
}

export default ProtectedRoute;