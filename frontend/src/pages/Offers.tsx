import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spin, Empty } from 'antd';
import { ArrowLeftOutlined, TrophyOutlined } from '@ant-design/icons';
import type { Application } from '../types';
import { applicationApi } from '../services/api';
import JDDrawer from '../components/JDDrawer';

export default function Offers() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    applicationApi.list(undefined, ['OFFER']).then(res => {
      setApplications(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const [details, setDetails] = useState<Record<number, Application>>({});
  useEffect(() => {
    applications.forEach(app => {
      applicationApi.get(app.id).then(res => {
        setDetails(prev => ({ ...prev, [app.id]: res.data }));
      });
    });
  }, [applications]);

  const offerCards = useMemo(() => {
    return applications.map(app => {
      const appDetail = details[app.id];
      const interviews = appDetail?.interviews || [];
      const totalRounds = interviews.length;
      const firstInterview = interviews.length > 0
        ? new Date(interviews.reduce((min, iv) =>
            new Date(iv.start_time) < new Date(min.start_time) ? iv : min
          ).start_time)
        : null;
      const offerDate = new Date(app.updated_at);
      const daysToOffer = firstInterview
        ? Math.max(1, Math.ceil((offerDate.getTime() - firstInterview.getTime()) / 86400000))
        : null;
      return { app, totalRounds, daysToOffer };
    });
  }, [applications, details]);

  if (loading) return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: '#1e1b4b' }}>
            <TrophyOutlined style={{ color: '#f59e0b' }} />
            Offer 收割记录
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            共收获 {applications.length} 个 Offer
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Empty description={<span style={{ color: '#6b7280' }}>Offer 正在路上，继续加油！</span>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
          {offerCards.map(({ app, totalRounds, daysToOffer }, idx) => (
            <div
              key={app.id}
              className="relative rounded-2xl p-5 cursor-pointer overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(12px)',
                border: '2px solid transparent',
                backgroundClip: 'padding-box',
                boxShadow: '0 4px 24px rgba(245, 158, 11, 0.15), inset 0 0 0 2px rgba(245, 158, 11, 0.2)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                animation: `fade-in-up 0.5s ease ${idx * 0.1}s both`,
              }}
              onClick={() => {
                setSelectedApp(details[app.id] || app);
                setDrawerOpen(true);
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(245, 158, 11, 0.25), inset 0 0 0 2px rgba(245, 158, 11, 0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(245, 158, 11, 0.15), inset 0 0 0 2px rgba(245, 158, 11, 0.2)';
              }}
            >
              {/* 装饰背景 */}
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(34,197,94,0.1))' }} />
              <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full" style={{ background: 'rgba(245,158,11,0.06)' }} />

              {/* JD 徽章 */}
              {(details[app.id]?.job_description) && (
                <div
                  className="absolute top-3 left-3 text-xs font-medium px-2 py-0.5 rounded-full z-10"
                  style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#16a34a' }}
                >
                  JD
                </div>
              )}

              {/* 奖杯图标 */}
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div>
                  <div className="text-xl font-bold" style={{ color: '#1e1b4b' }}>{app.company_name}</div>
                  {app.job_title && <div className="text-sm mt-0.5" style={{ color: '#6b7280' }}>{app.job_title}</div>}
                  {(details[app.id]?.salary || app.salary) && (
                    <div className="text-sm font-medium mt-1" style={{ color: '#f59e0b' }}>
                      {details[app.id]?.salary || app.salary}
                    </div>
                  )}
                </div>
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: 'linear-gradient(135deg, #f59e0b, #22c55e)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
                >
                  <TrophyOutlined style={{ color: 'white' }} />
                </div>
              </div>

              {/* 统计数据 */}
              <div className="flex gap-4 relative z-10">
                {daysToOffer && (
                  <div
                    className="flex-1 rounded-xl p-3 text-center"
                    style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}
                  >
                    <div className="text-2xl font-bold" style={{ color: '#f59e0b' }}>{daysToOffer}</div>
                    <div className="text-xs" style={{ color: '#92400e' }}>历时天数</div>
                  </div>
                )}
                <div
                  className="flex-1 rounded-xl p-3 text-center"
                  style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}
                >
                  <div className="text-2xl font-bold" style={{ color: '#22c55e' }}>{totalRounds}</div>
                  <div className="text-xs" style={{ color: '#166534' }}>面试轮次</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <JDDrawer
        application={selectedApp}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={(updatedApp) => {
          setDetails(prev => ({
            ...prev,
            [updatedApp.id]: { ...prev[updatedApp.id], ...updatedApp },
          }));
          setSelectedApp(prev => prev ? { ...prev, ...updatedApp } : null);
        }}
      />
    </div>
  );
}
