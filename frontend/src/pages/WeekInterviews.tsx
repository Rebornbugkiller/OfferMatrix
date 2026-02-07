import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tag, Spin, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import type { Interview } from '../types';
import { interviewApi } from '../services/api';

export default function WeekInterviews() {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewApi.list().then(res => {
      setInterviews(res.data);
    }).finally(() => setLoading(false));
  }, []);

  const { weekStart, dayGroups } = useMemo(() => {
    const now = new Date();
    const ws = new Date(now);
    ws.setDate(now.getDate() - now.getDay());
    ws.setHours(0, 0, 0, 0);
    const we = new Date(ws);
    we.setDate(ws.getDate() + 7);

    const thisWeek = interviews.filter(i => {
      const s = new Date(i.start_time);
      return s >= ws && s < we;
    }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

    const days: Record<number, Interview[]> = {};
    for (let d = 1; d <= 5; d++) days[d] = [];
    thisWeek.forEach(i => {
      const day = new Date(i.start_time).getDay();
      if (days[day]) days[day].push(i);
      else if (days[0]) days[0] = [...(days[0] || []), i];
    });

    return { weekStart: ws, dayGroups: days };
  }, [interviews]);

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const today = new Date().getDay();
  const totalCount = Object.values(dayGroups).flat().length;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const formatDate = (base: Date, dayOffset: number) => {
    const d = new Date(base);
    d.setDate(base.getDate() + dayOffset);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  const getRelativeTime = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    if (diff < 0) return null;
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) return `${Math.floor(hours / 24)}天后`;
    if (hours > 0) return `${hours}小时${mins > 0 ? mins + '分' : ''}后`;
    return `${mins}分钟后`;
  };

  if (loading) return <div className="flex items-center justify-center h-96"><Spin size="large" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>返回</Button>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#1e1b4b' }}>
            本周面试日程
          </h1>
          <p className="text-sm" style={{ color: '#6b7280' }}>
            {formatDate(weekStart, 1)} - {formatDate(weekStart, 5)} · 共 {totalCount} 场面试
          </p>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Empty description={<span style={{ color: '#6b7280' }}>本周暂无面试安排，好好休息一下吧 🌸</span>} />
        </div>
      ) : (
        <div className="relative" style={{ paddingLeft: 40 }}>
          {/* 时间轴竖线 */}
          <div className="absolute left-[18px] top-0 bottom-0 w-[3px] rounded-full" style={{ background: 'linear-gradient(to bottom, #ec4899, #a855f7)' }} />

          {[1, 2, 3, 4, 5].map(day => {
            const isToday = day === today;
            const dayInterviews = dayGroups[day] || [];
            return (
              <div key={day} className="relative mb-8 last:mb-0">
                {/* 时间轴圆点 */}
                <div
                  className="absolute -left-[22px] w-[11px] h-[11px] rounded-full border-[3px] border-white"
                  style={{
                    top: 6,
                    background: isToday ? '#ec4899' : dayInterviews.length > 0 ? '#a855f7' : '#d1d5db',
                    boxShadow: isToday ? '0 0 0 4px rgba(236,72,153,0.2), 0 0 12px rgba(236,72,153,0.4)' : 'none',
                    animation: isToday ? 'pulse 2s ease-in-out infinite' : 'none',
                  }}
                />
                {/* 日期标题 */}
                <div className="flex items-center gap-2 mb-3">
                  <span
                    className="text-sm font-bold px-3 py-1 rounded-full"
                    style={{
                      background: isToday ? 'linear-gradient(135deg, #ec4899, #a855f7)' : 'rgba(255,255,255,0.6)',
                      color: isToday ? 'white' : '#6b7280',
                    }}
                  >
                    {dayNames[day]} {formatDate(weekStart, day)}
                  </span>
                  {isToday && <span className="text-xs font-medium" style={{ color: '#ec4899' }}>今天</span>}
                  {dayInterviews.length > 0 && (
                    <span className="text-xs" style={{ color: '#9ca3af' }}>{dayInterviews.length} 场</span>
                  )}
                </div>
                {/* 面试卡片 */}
                {dayInterviews.length === 0 ? (
                  <div className="text-sm ml-2" style={{ color: '#d1d5db' }}>无面试</div>
                ) : (
                  <div className="space-y-3">
                    {dayInterviews.map(interview => {
                      const isPast = new Date(interview.end_time) < new Date();
                      const relTime = !isPast ? getRelativeTime(interview.start_time) : null;
                      return (
                        <div
                          key={interview.id}
                          className="glass-card rounded-xl p-4 cursor-pointer"
                          style={{ opacity: isPast ? 0.55 : 1 }}
                          onClick={() => interview.application && navigate(`/applications/${interview.application.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-lg font-bold" style={{ color: '#1e1b4b' }}>
                                {formatTime(interview.start_time)} - {formatTime(interview.end_time)}
                              </div>
                              {relTime && (
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'linear-gradient(135deg, #fce7f3, #f3e8ff)', color: '#ec4899' }}>
                                  {relTime}
                                </span>
                              )}
                            </div>
                            <Tag color={interview.status === 'SCHEDULED' ? 'blue' : interview.status === 'FINISHED' ? 'green' : 'red'}>
                              {interview.status === 'SCHEDULED' ? '待进行' : interview.status === 'FINISHED' ? '已完成' : '已取消'}
                            </Tag>
                          </div>
                          <div className="mt-2 flex items-center gap-2">
                            <span className="font-semibold" style={{ color: '#1e1b4b' }}>{interview.application?.company_name}</span>
                            <span style={{ color: '#9ca3af' }}>·</span>
                            <span style={{ color: '#6b7280' }}>{interview.round_name}</span>
                          </div>
                          {interview.meeting_link && (
                            <div className="mt-1 text-xs truncate" style={{ color: '#ec4899' }}>{interview.meeting_link}</div>
                          )}
                        </div>
                      );
                    })}
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
