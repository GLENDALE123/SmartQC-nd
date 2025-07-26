import { Routes, Route, Navigate } from "react-router-dom"
import { MainLayout } from "@/layouts/mainlayout/MainLayout"
import { AuthLayout } from "@/layouts/AuthLayout"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"
import { LoginPage } from "@/pages/LoginPage"
import { DashboardPage } from "../pages/DashboardPage"
import { InspectionCreatePage } from "../pages/InspectionCreatePage"
import { OrderPage } from "../pages/OrderPage"
import { QualityHistoryPage } from "../pages/QualityHistoryPage"
import { ReportsPage } from "../pages/ReportsPage"
import Settings from "../pages/Settings"
import { DefectTypeManagementPage } from "../pages/DefectTypeManagementPage"

/**
 * 애플리케이션의 모든 라우트를 관리하는 컴포넌트
 */
export function AppRoutes() {
  return (
    <Routes>
      {/* 공개 라우트 */}
      <Route path="/login" element={
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      } />
      
      {/* 보호된 라우트 */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/inspection/create" element={
        <ProtectedRoute>
          <MainLayout>
            <Navigate to="/inspection/create/incoming" replace />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/inspection/create/incoming" element={
        <ProtectedRoute>
          <MainLayout>
            <InspectionCreatePage type="incoming" />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/inspection/create/process" element={
        <ProtectedRoute>
          <MainLayout>
            <InspectionCreatePage type="process" />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/inspection/create/shipment" element={
        <ProtectedRoute>
          <MainLayout>
            <InspectionCreatePage type="shipment" />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/order" element={
        <ProtectedRoute>
          <MainLayout>
            <OrderPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/quality-history" element={
        <ProtectedRoute>
          <MainLayout>
            <QualityHistoryPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/reports" element={
        <ProtectedRoute>
          <MainLayout>
            <ReportsPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/defect-types" element={
        <ProtectedRoute>
          <MainLayout>
            <DefectTypeManagementPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* 기본 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
} 