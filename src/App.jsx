import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Home from "./pages/Home";
import Biota from "./pages/Biota";
import BiotaDetail from "./pages/BiotaDetail";
import JasaAquarium from "./pages/JasaAquarium";
import TentangKami from "./pages/TentangKami";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

import OwnerSales from "./pages/OwnerSales";
import OwnerLoss from "./pages/OwnerLoss";
import OwnerDailyReport from "./pages/OwnerDailyReport";

import Employee from "./pages/Employee";
import EmployeeSalesClean from "./pages/EmployeeSalesClean";
import EmployeeSalesHistory from "./pages/EmployeeSalesHistory";
import EmployeeSalesDetail from "./pages/EmployeeSalesDetail";
import EmployeeLoss from "./pages/EmployeeLoss";
import EmployeeLossHistory from "./pages/EmployeeLossHistory";

import ProtectedRoute from "./components/ProtectedRoute";
import OwnerDailyNotice from "./components/OwnerDailyNotice";

import {
  AuthProvider,
} from "./context/AuthProvider";


// =========================================================
// OWNER DASHBOARD WRAPPER
// =========================================================

function OwnerDashboard() {

  return (

    <div>

      {/* =================================================
          NOTIFIKASI LAPORAN HARIAN
      ================================================= */}

      <div className="mx-auto max-w-[1600px] px-4 pt-4">

        <OwnerDailyNotice />

      </div>


      {/* =================================================
          ADMIN DASHBOARD ASLI
      ================================================= */}

      <Admin />

    </div>

  );

}


// =========================================================
// APP
// =========================================================

function App() {

  return (

    <BrowserRouter>

      <AuthProvider>

        <Routes>


          {/* =================================================
              WEBSITE PUBLIC
          ================================================= */}

          <Route
            path="/"
            element={
              <Home />
            }
          />


          <Route
            path="/biota"
            element={
              <Biota />
            }
          />


          <Route
            path="/biota/:id"
            element={
              <BiotaDetail />
            }
          />


          {/* =================================================
              JASA AQUARIUM
          ================================================= */}

          <Route
            path="/jasa-aquarium"
            element={
              <JasaAquarium />
            }
          />


          {/* =================================================
              TENTANG KAMI
          ================================================= */}

          <Route
            path="/tentang-kami"
            element={
              <TentangKami />
            }
          />


          {/* =================================================
              LOGIN
          ================================================= */}

          <Route
            path="/login"
            element={
              <Login />
            }
          />


          {/* =================================================
              OWNER DASHBOARD
          ================================================= */}

          <Route
            path="/admin"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "owner",
                ]}
              >

                <OwnerDashboard />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              OWNER - LAPORAN PENJUALAN
          ================================================= */}

          <Route
            path="/owner/sales"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "owner",
                ]}
              >

                <OwnerSales />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              OWNER - LAPORAN KERUGIAN
          ================================================= */}

          <Route
            path="/owner/loss"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "owner",
                ]}
              >

                <OwnerLoss />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              OWNER - LAPORAN HARIAN
          ================================================= */}

          <Route
            path="/owner/daily-report"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "owner",
                ]}
              >

                <OwnerDailyReport />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              EMPLOYEE DASHBOARD
          ================================================= */}

          <Route
            path="/employee"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "employee",
                ]}
              >

                <Employee />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              EMPLOYEE - BUAT NOTA
          ================================================= */}

          <Route
            path="/employee/sales"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "employee",
                ]}
              >

                <EmployeeSalesClean />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              EMPLOYEE - RIWAYAT NOTA
          ================================================= */}

          <Route
            path="/employee/sales-history"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "employee",
                ]}
              >

                <EmployeeSalesHistory />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              EMPLOYEE - DETAIL NOTA
          ================================================= */}

          <Route
            path="/employee/sales-history/:id"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "employee",
                ]}
              >

                <EmployeeSalesDetail />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              EMPLOYEE - CATAT KERUGIAN
          ================================================= */}

          <Route
            path="/employee/loss"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "employee",
                ]}
              >

                <EmployeeLoss />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              EMPLOYEE - RIWAYAT KERUGIAN
          ================================================= */}

          <Route
            path="/employee/loss-history"
            element={

              <ProtectedRoute
                allowedRoles={[
                  "employee",
                ]}
              >

                <EmployeeLossHistory />

              </ProtectedRoute>

            }
          />


          {/* =================================================
              FALLBACK
          ================================================= */}

          <Route
            path="*"
            element={
              <Home />
            }
          />


        </Routes>

      </AuthProvider>

    </BrowserRouter>

  );

}


export default App;