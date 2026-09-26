import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthLayout } from "./components/layouts/AuthLayout";
import { AuthPage } from "./pages/Auth/AuthPage";
import { GalleryPage } from "./pages/Gallery/GalleryPage";
import { AppLayout } from "./components/layouts/AppLayout";
import { NotesPage } from "./pages/Notes/NotesPage";
import { MapPage } from "./pages/Map/MapPage";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App () {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<AuthPage />}/>
          </Route>

          {/* Galería, notas y mapa */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/gallery" element={<GalleryPage />}/>
              <Route path="/notes" element={<NotesPage />}/>
              <Route path="/map" element={<MapPage />}/>
            </Route>
          </Route>

          {/* Por defecto */}
          <Route path="*" element={<Navigate to="/login" replace/>}></Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
