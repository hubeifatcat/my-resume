import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";
import AuthModal from "./components/AuthModal.jsx";
import HomePage from "./pages/HomePage.jsx";
import DemoPage from "./pages/DemoPage.jsx";
import ResumePage from "./pages/ResumePage.jsx";
import WorkbenchPage from "./pages/WorkbenchPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import CanvasPage from "./pages/CanvasPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/workbench" element={<WorkbenchPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/canvas" element={<CanvasPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <AuthModal />
      </HashRouter>
    </AuthProvider>
  );
}
