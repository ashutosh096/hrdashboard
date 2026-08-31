import React from 'react';
import { Users, UserCheck, UserX, Calendar } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { RevenueChart } from '../components/RevenueChart';
import { ScheduleWidget } from '../components/ScheduleWidget';
import { TaskAnalyticsPanel } from '../components/TaskAnalyticsPanel';
import { EmployeeDashboardView } from '../components/EmployeeDashboardView';
import { useEntity } from '../contexts/EntityContext';
import { useAuth } from '../contexts/AuthContext';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const { selectedEntity } = useEntity();

  // If logged in as an Employee, show the specialized Employee Portal Dashboard
  if (user?.role === 'EMPLOYEE') {
    return <EmployeeDashboardView />;
  }

  // Manager / Admin Dashboard
  const totalEmployees = selectedEntity === 'CAG' ? 6 : selectedEntity === 'EHM' ? 10 : 16;
  const presentEmployees = selectedEntity === 'CAG' ? 5 : selectedEntity === 'EHM' ? 9 : 14;
  const absentEmployees = totalEmployees - presentEmployees;
  const activeMeetings = selectedEntity === 'CAG' ? 2 : selectedEntity === 'EHM' ? 2 : 4;

  return (
    <div className="p-6 space-y-6">
      {/* Top Row: 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employees" value={totalEmployees} label="Total Staff" icon={Users} />
        <StatCard title="Present Employees" value={presentEmployees} label="Present Today" icon={UserCheck} />
        <StatCard title="Absent Employees" value={absentEmployees} label="Absent Today" icon={UserX} />
        <StatCard title="Active Meetings" value={activeMeetings} label="Meetings Today" icon={Calendar} />
      </div>

      {/* Middle Row: Attendance Chart (65%) + Schedule Widget (35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1">
          <ScheduleWidget />
        </div>
      </div>

      {/* Bottom Section: Task Analytics & Employee Performance Rates */}
      <TaskAnalyticsPanel />
    </div>
  );
};
