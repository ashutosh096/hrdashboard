import React, { useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { EntityProvider } from './contexts/EntityContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { SearchModal } from './components/SearchModal';
import { TaskAssignModal } from './components/TaskAssignModal';
import { ClockInModal } from './components/ClockInModal';
import { ExportReportModal } from './components/ExportReportModal';
import { LoginView } from './pages/LoginView';
import { DashboardView } from './pages/DashboardView';
import { TasksView } from './pages/TasksView';
import { TeamTasksView } from './pages/TeamTasksView';
import { MeetingsView } from './pages/MeetingsView';
import { AttendanceView } from './pages/AttendanceView';
import { OfficeTodayView } from './pages/OfficeTodayView';
import { TeamDirectoryView } from './pages/TeamDirectoryView';
import { ApplicationsView } from './pages/ApplicationsView';
import { AnnouncementsView } from './pages/AnnouncementsView';
import { AcceptInviteView } from './pages/AcceptInviteView';
import { SettingsView } from './pages/SettingsView';
import { NotificationsView } from './pages/NotificationsView';
import { ReportsView } from './pages/ReportsView';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [, setLocation] = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isClockModalOpen, setIsClockModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50/80">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          onOpenClockModal={() => setIsClockModalOpen(true)}
          onOpenTaskModal={() => setIsTaskModalOpen(true)}
          onOpenAddEmployeeModal={() => setLocation('/team')}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <TaskAssignModal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} onSubmit={() => {}} />
      <ClockInModal isOpen={isClockModalOpen} onClose={() => setIsClockModalOpen(false)} />
      <ExportReportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
    </div>
  );
};

export const MainContent: React.FC = () => {
  const { user, setUserSession } = useAuth();

  if (!user) {
    return <LoginView onLoginSuccess={(userData) => setUserSession(userData)} />;
  }

  return (
    <Switch>
      <Route path="/accept-invite" component={AcceptInviteView} />
      <Route path="*">
        <AppLayout>
          <Switch>
            <Route path="/" component={DashboardView} />
            <Route path="/attendance" component={AttendanceView} />
            <Route path="/meetings" component={MeetingsView} />
            <Route path="/office-today" component={OfficeTodayView} />
            <Route path="/announcements" component={AnnouncementsView} />
            <Route path="/tasks" component={TasksView} />
            <Route path="/team-tasks" component={TeamTasksView} />
            <Route path="/applications" component={ApplicationsView} />
            <Route path="/team" component={TeamDirectoryView} />
            <Route path="/reports" component={ReportsView} />
            <Route path="/notifications" component={NotificationsView} />
            <Route path="/settings" component={SettingsView} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <EntityProvider>
          <Toaster position="top-right" richColors />
          <MainContent />
        </EntityProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
