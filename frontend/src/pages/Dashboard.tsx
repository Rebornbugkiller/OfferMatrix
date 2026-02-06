import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, message } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  RocketOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import WeeklyCalendar from '../components/WeeklyCalendar';
import InterviewDrawer from '../components/InterviewDrawer';
import ApplicationForm from '../components/ApplicationForm';
import AddInterviewModal from '../components/AddInterviewModal';
import type { Interview, Application } from '../types';
import { interviewApi, applicationApi } from '../services/api';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-800">{value}</div>
          <div className="text-sm text-gray-500">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [appFormOpen, setAppFormOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await interviewApi.list();
      setInterviews(res.data);
    } catch (error) {
      message.error('获取面试列表失败');
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await applicationApi.list();
      setApplications(res.data);
    } catch (error) {
      message.error('获取申请列表失败');
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
    fetchApplications();
  }, [fetchInterviews, fetchApplications]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const thisWeekInterviews = interviews.filter((i) => {
      const start = new Date(i.start_time);
      return start >= weekStart && start < weekEnd;
    });

    const inProcess = applications.filter((a) => a.current_status === 'IN_PROCESS').length;
    const offers = applications.filter((a) => a.current_status === 'OFFER').length;

    return {
      thisWeek: thisWeekInterviews.length,
      inProcess,
      offers,
    };
  }, [interviews, applications]);

  const handleEventClick = (interview: Interview) => {
    setSelectedInterview(interview);
    setDrawerOpen(true);
  };

  const handleEventDrop = async (id: number, start: Date, end: Date) => {
    // 保存原始状态用于回滚
    let oldStartTime: string | undefined;
    let oldEndTime: string | undefined;
    setInterviews(prev => {
      const interview = prev.find(i => i.id === id);
      oldStartTime = interview?.start_time;
      oldEndTime = interview?.end_time;
      return prev.map(i =>
        i.id === id
          ? { ...i, start_time: start.toISOString(), end_time: end.toISOString() }
          : i
      );
    });

    try {
      await interviewApi.update(id, {
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
      message.success('时间已更新');
    } catch (error) {
      // 回滚到原状态
      if (oldStartTime && oldEndTime) {
        setInterviews(prev =>
          prev.map(i =>
            i.id === id
              ? { ...i, start_time: oldStartTime!, end_time: oldEndTime! }
              : i
          )
        );
      }
      message.error('更新失败，已恢复');
    }
  };

  const handleAddInterview = (app: Application) => {
    setSelectedApp(app);
    setInterviewModalOpen(true);
  };

  const quickAddApps = useMemo(() => {
    const statusOrder: Record<string, number> = {
      'OFFER': 0,
      'IN_PROCESS': 1,
      'REJECTED': 2,
    };
    return applications
      .filter(
        (app) => app.current_status === 'IN_PROCESS' || app.current_status === 'OFFER' || app.current_status === 'REJECTED'
      )
      .sort((a, b) => (statusOrder[a.current_status] ?? 1) - (statusOrder[b.current_status] ?? 1));
  }, [applications]);

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<CalendarOutlined />}
          label="本周面试"
          value={stats.thisWeek}
          color="#4f46e5"
        />
        <StatCard
          icon={<RocketOutlined />}
          label="进行中"
          value={stats.inProcess}
          color="#0ea5e9"
        />
        <StatCard
          icon={<TrophyOutlined />}
          label="已拿 Offer"
          value={stats.offers}
          color="#22c55e"
        />
      </div>

      {/* 快速操作区 */}
      <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-gray-800">快速添加面试</h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAppFormOpen(true)}
          >
            新增申请
          </Button>
        </div>
        {quickAddApps.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {quickAddApps.map((app) => (
              <Button
                key={app.id}
                onClick={() => handleAddInterview(app)}
                style={
                  app.current_status === 'OFFER'
                    ? { borderColor: '#22c55e', color: '#16a34a', backgroundColor: '#f0fdf4' }
                    : app.current_status === 'REJECTED'
                    ? { borderColor: '#ef4444', color: '#dc2626', backgroundColor: '#fef2f2' }
                    : undefined
                }
                className={app.current_status === 'IN_PROCESS' ? 'hover:border-indigo-400 hover:text-indigo-600' : ''}
              >
                {app.company_name}
                {app.current_status === 'OFFER' && ' ✓'}
                {app.current_status === 'REJECTED' && ' ✗'}
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 text-sm">暂无进行中的申请，点击右上角添加</div>
        )}
      </div>

      {/* 日历 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <WeeklyCalendar
          interviews={interviews}
          onEventClick={handleEventClick}
          onEventDrop={handleEventDrop}
        />
      </div>

      <InterviewDrawer
        interview={selectedInterview}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={() => {
          fetchInterviews();
          fetchApplications();
        }}
        onDelete={() => {
          fetchInterviews();
        }}
      />

      <ApplicationForm
        open={appFormOpen}
        onClose={() => setAppFormOpen(false)}
        onSuccess={() => {
          fetchApplications();
        }}
      />

      <AddInterviewModal
        application={selectedApp}
        open={interviewModalOpen}
        onClose={() => setInterviewModalOpen(false)}
        onSuccess={() => {
          fetchInterviews();
        }}
        onApplicationUpdate={() => {
          fetchApplications();
        }}
      />
    </div>
  );
}
