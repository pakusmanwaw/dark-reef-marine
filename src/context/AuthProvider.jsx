import { useEffect, useState } from "react";

import { AuthContext } from "./AuthContext";
import { supabase } from "../services/supabase";


// =====================================================
// AUTH PROVIDER
// =====================================================

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null);
      return null;
    }

    const {
      data,
      error,
    } = await supabase
      .from("profiles")
      .select("id, full_name, role")
      .eq("id", userId)
      .maybeSingle();


    if (error) {
      console.error(
        "Gagal mengambil profile:",
        error
      );

      setProfile(null);

      return null;
    }


    console.log(
      "PROFILE BERHASIL DIBACA:",
      data
    );


    setProfile(data || null);

    return data || null;
  }


  // =====================================================
  // INITIAL SESSION
  // =====================================================

  useEffect(() => {
    let active = true;


    async function initializeAuth() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();


        if (error) {
          console.error(
            "Gagal mengambil session:",
            error
          );

          if (active) {
            setLoading(false);
          }

          return;
        }


        if (!active) {
          return;
        }


        const currentUser =
          data?.session?.user || null;


        setUser(currentUser);


        if (currentUser) {
          await loadProfile(
            currentUser.id
          );
        } else {
          setProfile(null);
        }


      } catch (error) {

        console.error(
          "Auth initialization error:",
          error
        );

      } finally {

        if (active) {
          setLoading(false);
        }

      }
    }


    initializeAuth();


    // ===================================================
    // AUTH LISTENER
    // ===================================================

    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {

          if (!active) {
            return;
          }


          const currentUser =
            session?.user || null;


          setUser(currentUser);


          if (!currentUser) {
            setProfile(null);
          }

        }
      );


    // ===================================================
    // CLEANUP
    // ===================================================

    return () => {

      active = false;

      listener?.subscription?.unsubscribe();

    };

  }, []);


  // =====================================================
  // LOGIN
  // =====================================================

  async function login(
    email,
    password
  ) {

    setLoading(true);
    setProfile(null);


    try {

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });


      if (error) {

        console.error(
          "Login error:",
          error
        );

        return {
          success: false,
          error,
        };

      }


      if (!data?.user) {

        return {
          success: false,
          error: new Error(
            "User tidak ditemukan setelah login."
          ),
        };

      }


      setUser(data.user);


      // =================================================
      // LOAD PROFILE SEBELUM LOGIN DIANGGAP SELESAI
      // =================================================

      const userProfile =
        await loadProfile(
          data.user.id
        );


      if (!userProfile) {

        await supabase.auth.signOut();

        setUser(null);
        setProfile(null);


        return {
          success: false,
          error: new Error(
            "Profile pengguna tidak ditemukan."
          ),
        };

      }


      return {
        success: true,
        user: data.user,
        profile: userProfile,
      };


    } catch (error) {

      console.error(
        "Login exception:",
        error
      );


      return {
        success: false,
        error,
      };

    } finally {

      setLoading(false);

    }

  }


  // =====================================================
  // LOGOUT
  // =====================================================

  async function logout() {

    const {
      error,
    } =
      await supabase.auth.signOut();


    if (error) {

      console.error(
        "Logout error:",
        error
      );


      return {
        success: false,
        error,
      };

    }


    setUser(null);
    setProfile(null);


    return {
      success: true,
    };

  }


  // =====================================================
  // AUTH VALUE
  // =====================================================

  const value = {

    user,

    profile,

    loading,

    isAuthenticated:
      Boolean(user),

    isOwner:
      profile?.role === "owner",

    isEmployee:
      profile?.role === "employee",

    login,

    logout,

  };


  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );

}


export { AuthProvider };