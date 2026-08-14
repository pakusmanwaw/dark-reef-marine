import { useAuth } from "../context/useAuth";

function AuthProviderTest() {
  const {
    user,
    profile,
    loading,
    isAuthenticated,
    isOwner,
    isEmployee,
  } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-400" />

          <p className="mt-4 text-sm text-slate-400">
            Memeriksa akun...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12">

      <div className="mx-auto max-w-2xl">

        <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400">
          Dark Reef Marine
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white">
          Auth Provider Test
        </h1>

        <div className="mt-8 rounded-3xl bg-white p-6">

          <h2 className="text-xl font-bold text-slate-950">
            Status Authentication
          </h2>

          <div className="mt-6 space-y-3">

            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">
                Sudah Login
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {isAuthenticated ? "YA" : "TIDAK"}
              </p>
            </div>


            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">
                Email
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {user?.email || "-"}
              </p>
            </div>


            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">
                Nama Profile
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {profile?.full_name || "-"}
              </p>
            </div>


            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">
                Role
              </p>

              <p className="mt-1 font-bold text-cyan-600">
                {profile?.role || "-"}
              </p>
            </div>


            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">
                Owner
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {isOwner ? "YA" : "TIDAK"}
              </p>
            </div>


            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm text-slate-500">
                Employee
              </p>

              <p className="mt-1 font-bold text-slate-900">
                {isEmployee ? "YA" : "TIDAK"}
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default AuthProviderTest;