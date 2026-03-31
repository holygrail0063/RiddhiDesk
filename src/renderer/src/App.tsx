import { Navigate, Route, Routes } from 'react-router-dom'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { MainLayout } from '@/components/layout/MainLayout'
import { PlannerProvider } from '@/store/plannerContext'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PlannerPage } from '@/pages/PlannerPage'
import { TasksPage } from '@/pages/TasksPage'
import { CompletedPage } from '@/pages/CompletedPage'
import { NeedsReplanPage } from '@/pages/NeedsReplanPage'
import { RemindersPage } from '@/pages/RemindersPage'
import { SettingsPage } from '@/pages/SettingsPage'

export default function App(): JSX.Element {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <PlannerProvider>
              <MainLayout />
            </PlannerProvider>
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/planner" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="planner" element={<PlannerPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="reminders" element={<RemindersPage />} />
        <Route path="completed" element={<CompletedPage />} />
        <Route path="needs-replan" element={<NeedsReplanPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/planner" replace />} />
    </Routes>
  )
}
