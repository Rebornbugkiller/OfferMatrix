import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, message } from 'antd';
import {
  PlusOutlined,
  CalendarOutlined,
  RocketOutlined,
  TrophyOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import WeeklyCalendar from '../components/WeeklyCalendar';
import InterviewDrawer from '../components/InterviewDrawer';
import ApplicationForm from '../components/ApplicationForm';
import AddInterviewModal from '../components/AddInterviewModal';
import AIQuickAddModal from '../components/AIQuickAddModal';
import type { Interview, Application } from '../types';
import { interviewApi, applicationApi } from '../services/api';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  gradient: string;
  glow: string;
  onClick?: () => void;
}

function StatCard({ icon, label, value, gradient, glow, onClick }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 text-white relative overflow-hidden cursor-pointer"
      style={{
        background: gradient,
        boxShadow: `0 8px 32px ${glow}`,
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
      }}
    >
      <div
        className="absolute -top-4 -right-4 w-24 h-24 rounded-full"
        style={{ background: 'rgba(255,255,255,0.1)' }}
      />
      <div
        className="absolute -bottom-2 -right-2 w-16 h-16 rounded-full"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      />
      <div className="flex items-center gap-4 relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ background: 'rgba(255,255,255,0.2)' }}
        >
          {icon}
        </div>
        <div>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-sm opacity-85">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [appFormOpen, setAppFormOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [aiQuickAddOpen, setAiQuickAddOpen] = useState(false);

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
      {/* 统计卡片 + AI 快速添加按钮 */}
      <div className="flex items-stretch gap-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 stagger-children">
          <StatCard
            icon={<CalendarOutlined />}
            label="本周面试"
            value={stats.thisWeek}
            gradient="linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)"
            glow="rgba(59, 130, 246, 0.3)"
            onClick={() => navigate('/week-interviews')}
          />
          <StatCard
            icon={<RocketOutlined />}
            label="进行中"
            value={stats.inProcess}
            gradient="linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)"
            glow="rgba(14, 165, 233, 0.3)"
            onClick={() => navigate('/in-process')}
          />
          <StatCard
            icon={<TrophyOutlined />}
            label="已拿 Offer"
            value={stats.offers}
            gradient="linear-gradient(135deg, #22c55e 0%, #10b981 100%)"
            glow="rgba(34, 197, 94, 0.3)"
            onClick={() => navigate('/offers')}
          />
        </div>
        <Button
          icon={<RobotOutlined />}
          onClick={() => setAiQuickAddOpen(true)}
          style={{
            background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
            borderColor: 'transparent',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            height: 'auto',
            padding: '20px 24px',
            boxShadow: '0 8px 32px rgba(236, 72, 153, 0.3)',
          }}
          className="rounded-2xl hover:shadow-lg transition-shadow"
        >
          AI 快速添加
        </Button>
      </div>

      {/* 快速操作区 */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: '#1e1b4b' }}>快速添加面试</h3>
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
                className={app.current_status === 'IN_PROCESS' ? 'hover:border-blue-400 hover:text-blue-600' : ''}
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
      <div className="glass-card rounded-2xl">
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

      <AIQuickAddModal
        open={aiQuickAddOpen}
        onClose={() => setAiQuickAddOpen(false)}
        onSuccess={() => {
          fetchInterviews();
          fetchApplications();
        }}
        applications={applications}
      />
    </div>
  );
}
