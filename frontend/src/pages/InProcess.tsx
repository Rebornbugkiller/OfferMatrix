import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Spin, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Application } from '../types';
import { applicationApi } from '../services/api';

export default function InProcess() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    applicationApi.list(undefined, ['IN_PROCESS']).then(res => {
      setApplications(res.data);
    }).finally(() => setLoading(false));
  }, []);

  // 获取每个公司的面试详情
  const [details, setDetails] = useState<Record<number, Application>>({});
  useEffect(() => {
    applications.forEach(app => {
      applicationApi.get(app.id).then(res => {
        setDetails(prev => ({ ...prev, [app.id]: res.data }));
      });
    });
  }, [applications]);

  const sorted = useMemo(() => {
    return [...applications].sort((a, b) => {
      const aInterviews = details[a.id]?.interviews || [];
      const bInterviews = details[b.id]?.interviews || [];
      const aLatest = aInterviews.length > 0 ? new Date(aInterviews[aInterviews.length - 1].start_time).getTime() : 0;
      const bLatest = bInterviews.length > 0 ? new Date(bInterviews[bInterviews.length - 1].start_time).getTime() : 0;
      return bLatest - aLatest;
    });
  }, [applications, details]);

  if (loading) return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1e1b4b' }}>
            进行中的公司
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            共 {applications.length} 家公司正在面试流程中
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Empty description={<span style={{ color: '#6b7280' }}>暂无进行中的公司，去投递简历吧 🚀</span>} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
          {sorted.map(app => {
            const appDetail = details[app.id];
            const interviews = appDetail?.interviews || [];
            const latestTime = interviews.length > 0
              ? new Date(interviews[interviews.length - 1].start_time).toLocaleDateString('zh-CN')
              : null;

            return (
              <div
                key={app.id}
                className="glass-card rounded-2xl p-5 cursor-pointer"
                style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                onClick={() => navigate(`/applications/${app.id}`)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-lg font-bold" style={{ color: '#1e1b4b' }}>{app.company_name}</div>
                    {app.job_title && <div className="text-sm" style={{ color: '#6b7280' }}>{app.job_title}</div>}
                  </div>
                  <div
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #dbeafe, #e0e7ff)', color: '#3b82f6' }}
                  >
                    {interviews.length} 轮
                  </div>
                </div>

                {/* 面试进度圆点 */}
                {interviews.length > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    {interviews.map((iv, idx) => {
                      const color = iv.status === 'SCHEDULED' ? '#3b82f6'
                        : iv.status === 'FINISHED' ? '#22c55e' : '#ef4444';
                      return (
                        <div key={iv.id} className="flex items-center">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ background: color, boxShadow: `0 0 6px ${color}40` }}
                            title={`${iv.round_name} - ${iv.status === 'SCHEDULED' ? '待进行' : iv.status === 'FINISHED' ? '已完成' : '已取消'}`}
                          />
                          {idx < interviews.length - 1 && (
                            <div className="w-4 h-[2px] mx-0.5" style={{ background: '#e5e7eb' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* 轮次名称列表 */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {interviews.map(iv => (
                    <span
                      key={iv.id}
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: iv.status === 'SCHEDULED' ? '#eff6ff'
                          : iv.status === 'FINISHED' ? '#f0fdf4' : '#fef2f2',
                        color: iv.status === 'SCHEDULED' ? '#3b82f6'
                          : iv.status === 'FINISHED' ? '#16a34a' : '#dc2626',
                      }}
                    >
                      {iv.round_name}
                    </span>
                  ))}
                </div>

                {latestTime && (
                  <div className="text-xs" style={{ color: '#9ca3af' }}>
                    最近面试: {latestTime}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
