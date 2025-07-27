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
import DefectTypeManagementPage from "../pages/DefectTypeManagementPage"
import { ExcelImportPage } from "../pages/ExcelImportPage"
import OrderDataTableTestPage from "../pages/OrderDataTableTestPage"

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
      
      {/* 보호된 라우트들을 하나의 ProtectedRoute로 감싸기 */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Routes>
            <Route path="/" element={
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            } />
            
            <Route path="/inspection/create" element={
              <MainLayout>
                <Navigate to="/inspection/create/incoming" replace />
              </MainLayout>
            } />
            
            <Route path="/inspection/create/incoming" element={
              <MainLayout>
                <InspectionCreatePage type="incoming" />
              </MainLayout>
            } />
            
            <Route path="/inspection/create/process" element={
              <MainLayout>
                <InspectionCreatePage type="process" />
              </MainLayout>
            } />
            
            <Route path="/inspection/create/shipment" element={
              <MainLayout>
                <InspectionCreatePage type="shipment" />
              </MainLayout>
            } />
            
            <Route path="/order" element={
              <MainLayout>
                <OrderPage />
              </MainLayout>
            } />
            
            <Route path="/quality-history" element={
              <MainLayout>
                <QualityHistoryPage />
              </MainLayout>
            } />
            
            <Route path="/reports" element={
              <MainLayout>
                <ReportsPage />
              </MainLayout>
            } />
            
            <Route path="/defect-types" element={
              <MainLayout>
                <DefectTypeManagementPage />
              </MainLayout>
            } />
            
            <Route path="/excel-import" element={
              <MainLayout>
                <ExcelImportPage />
              </MainLayout>
            } />
            
            <Route path="/settings" element={
              <MainLayout>
                <Settings />
              </MainLayout>
            } />
            
            <Route path="/test/order-datatable" element={
              <MainLayout>
                <OrderDataTableTestPage />
              </MainLayout>
            } />
            
            {/* 기본 리다이렉트 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ProtectedRoute>
      } />
    </Routes>
  )
}