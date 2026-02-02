import { Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CasesPage } from './pages/CasesPage';
import { CaseDetailsPage } from './pages/CaseDetailsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { VolunteerPage } from './pages/VolunteerPage';
import { ProfilePage } from './pages/ProfilePage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateCasePage } from './pages/CreateCasePage';
import { AlertsPage } from './pages/AlertsPage';
import { GeolocationPage } from './pages/GeolocationPage';
import { CollaborativeNetworkPage } from './pages/CollaborativeNetworkPage';
import { UserCasesPage } from './pages/UserCasesPage';
import { ManageUsersPage } from './pages/admin/ManageUsersPage';
import { PermissionsPage } from './pages/admin/PermissionsPage';
import { SettingsPage } from './pages/admin/SettingsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { PatternAnalysisPage } from './pages/admin/PatternAnalysisPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { ManageBadgesPage } from './pages/admin/ManageBadgesPage';
import { DuplicatesPage } from './pages/admin/DuplicatesPage';
import { ReportsFlowPage } from './pages/admin/ReportsFlowPage';
import { PartnersPage } from './pages/admin/PartnersPage';
import { ImageAnalysisPage } from './pages/admin/ImageAnalysisPage';
import { InstitutionalContentPage } from './pages/admin/InstitutionalContentPage';
import { SystemConfigPage } from './pages/admin/SystemConfigPage';
import { DeletedCasesPage } from './pages/admin/DeletedCasesPage';
import { BackupsPage } from './pages/admin/BackupsPage';
import { AnnouncementsPage } from './pages/admin/AnnouncementsPage';
import { NotificationConfigPage } from './pages/admin/NotificationConfigPage';
import { InfoPage } from './pages/InfoPage';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/informacoes" element={<InfoPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/registar" element={<RegisterPage />} />
          <Route path="/recuperar-senha" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/casos/novo" element={<CreateCasePage />} />
          <Route path="/casos" element={<CasesPage />} />
          <Route path="/casos/:id" element={<CaseDetailsPage />} />
          <Route path="/analise" element={<AnalyticsPage />} />
          <Route path="/voluntariado" element={<VolunteerPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/alertas" element={<AlertsPage />} />
          <Route path="/geolocalizacao" element={<GeolocationPage />} />
          <Route path="/rede-colaborativa" element={<CollaborativeNetworkPage />} />
          <Route path="/usuarios/:userId/casos" element={<UserCasesPage />} />
          <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageUsersPage /></ProtectedRoute>} />
          <Route path="/admin/permissoes" element={<ProtectedRoute allowedRoles={['ADMIN']}><PermissionsPage /></ProtectedRoute>} />
          <Route path="/admin/configuracoes" element={<ProtectedRoute allowedRoles={['ADMIN']}><SettingsPage /></ProtectedRoute>} />
          <Route path="/admin/relatorios" element={<ProtectedRoute allowedRoles={['ADMIN']}><ReportsPage /></ProtectedRoute>} />
          <Route path="/admin/analise-padroes" element={<ProtectedRoute allowedRoles={['ADMIN']}><PatternAnalysisPage /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute allowedRoles={['ADMIN']}><ActivityLogsPage /></ProtectedRoute>} />
          <Route path="/admin/badges" element={<ProtectedRoute allowedRoles={['ADMIN']}><ManageBadgesPage /></ProtectedRoute>} />
          <Route path="/admin/duplicados" element={<ProtectedRoute allowedRoles={['ADMIN', 'MODERADOR']}><DuplicatesPage /></ProtectedRoute>} />
          <Route path="/admin/denuncias-fluxo" element={<ProtectedRoute allowedRoles={['ADMIN', 'MODERADOR']}><ReportsFlowPage /></ProtectedRoute>} />
          <Route path="/admin/parceiros" element={<ProtectedRoute allowedRoles={['ADMIN', 'MODERADOR']}><PartnersPage /></ProtectedRoute>} />
          <Route path="/admin/analise-imagens" element={<ProtectedRoute allowedRoles={['ADMIN', 'MODERADOR']}><ImageAnalysisPage /></ProtectedRoute>} />
          <Route path="/admin/conteudo-institucional" element={<ProtectedRoute allowedRoles={['ADMIN']}><InstitutionalContentPage /></ProtectedRoute>} />
          <Route path="/admin/configuracoes-sistema" element={<ProtectedRoute allowedRoles={['ADMIN']}><SystemConfigPage /></ProtectedRoute>} />
          <Route path="/admin/casos-deletados" element={<ProtectedRoute allowedRoles={['ADMIN']}><DeletedCasesPage /></ProtectedRoute>} />
          <Route path="/admin/backups" element={<ProtectedRoute allowedRoles={['ADMIN']}><BackupsPage /></ProtectedRoute>} />
          <Route path="/admin/comunicados" element={<ProtectedRoute allowedRoles={['ADMIN']}><AnnouncementsPage /></ProtectedRoute>} />
          <Route path="/admin/notificacoes" element={<ProtectedRoute allowedRoles={['ADMIN']}><NotificationConfigPage /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

