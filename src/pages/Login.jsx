import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";


function Login() {
  const navigate = useNavigate();

  const {
    login,
  } = useAuth();


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  // =====================================================
  // LOGIN
  // =====================================================

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setError("");


    const result = await login(
      email.trim(),
      password
    );


    // ===================================================
    // LOGIN GAGAL
    // ===================================================

    if (!result?.success) {

      console.error(
        "Login gagal:",
        result?.error
      );


      setError(
        result?.error?.message ===
          "Profile pengguna tidak ditemukan."
          ? "Profile pengguna tidak ditemukan."
          : "Email atau password salah."
      );


      setLoading(false);

      return;
    }


    // ===================================================
    // PROFILE BERHASIL
    // ===================================================

    const role =
      result.profile?.role;


    console.log(
      "LOGIN BERHASIL"
    );

    console.log(
      "User:",
      result.user
    );

    console.log(
      "Profile:",
      result.profile
    );

    console.log(
      "Role:",
      role
    );


    // ===================================================
    // REDIRECT OWNER
    // ===================================================

    if (role === "owner") {

      navigate(
        "/admin",
        {
          replace: true,
        }
      );

      return;
    }


    // ===================================================
    // REDIRECT EMPLOYEE
    // ===================================================

    if (role === "employee") {

      navigate(
        "/employee",
        {
          replace: true,
        }
      );

      return;
    }


    // ===================================================
    // ROLE TIDAK VALID
    // ===================================================

    setError(
      "Role pengguna tidak valid."
    );


    await result?.logout?.();

    setLoading(false);
  }


  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-slate-950">

      <div className="flex min-h-screen items-center justify-center px-6 py-12">

        <div className="w-full max-w-md">

          {/* =================================================
              BRAND
          ================================================= */}

          <div className="mb-8 text-center">

            <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
              Dark Reef Marine
            </p>

            <h1 className="mt-3 text-3xl font-bold text-white">
              Login
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Masuk ke sistem internal Dark Reef Marine.
            </p>

          </div>


          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <div className="rounded-3xl bg-white p-6 shadow-2xl sm:p-8">

            <form
              onSubmit={handleLogin}
              className="space-y-5"
            >

              {/* EMAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  placeholder="Masukkan email"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-bold text-slate-900"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
                />

              </div>


              {/* ERROR */}

              {error && (

                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  {error}
                </div>

              )}


              {/* BUTTON */}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-600 px-6 py-3.5 font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {loading
                  ? "Memproses..."
                  : "Masuk"}

              </button>

            </form>


            {/* INFO */}

            <div className="mt-6 border-t border-slate-100 pt-5 text-center">

              <p className="text-xs leading-5 text-slate-400">
                Halaman ini khusus Owner dan
                Pegawai Dark Reef Marine.
              </p>

            </div>

          </div>


          {/* BACK */}

          <div className="mt-6 text-center">

            <a
              href="/"
              className="text-sm font-semibold text-slate-400 transition hover:text-cyan-400"
            >
              ← Kembali ke website
            </a>

          </div>

        </div>

      </div>

    </div>
  );
}


export default Login;