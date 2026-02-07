import { useState, useEffect, useMemo } from 'react';
import { Card, Row, Col, Segmented, Empty, Spin } from 'antd';
import {
  TrophyOutlined,
  CloseCircleOutlined,
  RocketOutlined,
  CalendarOutlined,
  FireOutlined,
  CheckCircleOutlined,
  PercentageOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import type { Interview, Application } from '../types';
import { interviewApi, applicationApi } from '../services/api';

export default function Statistics() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month'>('week');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [interviewRes, appRes] = await Promise.all([
          interviewApi.list(),
          applicationApi.list(),
        ]);
        setInterviews(interviewRes.data);
        setApplications(appRes.data);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 基础统计
  const stats = useMemo(() => {
    const totalInterviews = interviews.length;
    const totalCompanies = applications.length;
    const offers = applications.filter((a) => a.current_status === 'OFFER').length;
    const rejected = applications.filter((a) => a.current_status === 'REJECTED').length;
    const inProcess = applications.filter((a) => a.current_status === 'IN_PROCESS').length;
    const offerRate = totalCompanies > 0 ? ((offers / totalCompanies) * 100).toFixed(1) : '0';

    // 已复盘的面试数量
    const reviewedCount = interviews.filter((i) => i.review_content && i.review_content.trim()).length;
    const reviewRate = totalInterviews > 0 ? ((reviewedCount / totalInterviews) * 100).toFixed(1) : '0';

    // 单日最多面试
    const dateCountMap: Record<string, { count: number; date: string }> = {};
    interviews.forEach((i) => {
      const date = i.start_time.split('T')[0];
      if (!dateCountMap[date]) {
        dateCountMap[date] = { count: 0, date };
      }
      dateCountMap[date].count++;
    });
    const maxDayRecord = Object.values(dateCountMap).sort((a, b) => b.count - a.count)[0];

    return {
      totalInterviews,
      totalCompanies,
      offers,
      rejected,
      inProcess,
      offerRate,
      reviewRate,
      maxDayCount: maxDayRecord?.count || 0,
      maxDayDate: maxDayRecord?.date || '-',
    };
  }, [interviews, applications]);

  // 时间趋势数据
  const trendData = useMemo(() => {
    if (interviews.length === 0) return [];

    const now = new Date();
    const data: { name: string; count: number }[] = [];

    if (trendPeriod === 'week') {
      // 最近8周
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay() - i * 7);
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);

        const count = interviews.filter((interview) => {
          const date = new Date(interview.start_time);
          return date >= weekStart && date < weekEnd;
        }).length;

        const label = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;
        data.push({ name: label, count });
      }
    } else {
      // 最近6个月
      for (let i = 5; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

        const count = interviews.filter((interview) => {
          const date = new Date(interview.start_time);
          return date >= monthStart && date <= monthEnd;
        }).length;

        const label = `${monthStart.getMonth() + 1}月`;
        data.push({ name: label, count });
      }
    }

    return data;
  }, [interviews, trendPeriod]);

  // 公司状态分布
  const statusData = useMemo(() => {
    return [
      { name: '进行中', value: stats.inProcess, color: '#3b82f6' },
      { name: 'Offer', value: stats.offers, color: '#22c55e' },
      { name: '已挂', value: stats.rejected, color: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [stats]);

  // 面试轮次分布
  const roundData = useMemo(() => {
    const roundCount: Record<string, number> = {};
    interviews.forEach((i) => {
      const round = i.round_name || '其他';
      roundCount[round] = (roundCount[round] || 0) + 1;
    });
    return Object.entries(roundCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [interviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 数字卡片区 */}
      <Row gutter={[16, 16]} className="stagger-children">
        {[
          { icon: <CalendarOutlined />, title: '总面试场次', value: stats.totalInterviews, gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)', glow: 'rgba(236, 72, 153, 0.25)' },
          { icon: <TeamOutlined />, title: '申请公司数', value: stats.totalCompanies, gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', glow: 'rgba(99, 102, 241, 0.25)' },
          { icon: <TrophyOutlined />, title: 'Offer', value: stats.offers, gradient: 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)', glow: 'rgba(34, 197, 94, 0.25)' },
          { icon: <CloseCircleOutlined />, title: '已挂', value: stats.rejected, gradient: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', glow: 'rgba(239, 68, 68, 0.25)' },
          { icon: <RocketOutlined />, title: '进行中', value: stats.inProcess, gradient: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%)', glow: 'rgba(59, 130, 246, 0.25)' },
          { icon: <PercentageOutlined />, title: 'Offer 率', value: stats.offerRate, suffix: '%', gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', glow: 'rgba(16, 185, 129, 0.25)' },
          { icon: <CheckCircleOutlined />, title: '复盘完成率', value: stats.reviewRate, suffix: '%', gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', glow: 'rgba(139, 92, 246, 0.25)' },
          { icon: <FireOutlined />, title: '单日最多面试', value: stats.maxDayCount, suffix: '场', gradient: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)', glow: 'rgba(249, 115, 22, 0.25)', extra: stats.maxDayDate },
        ].map((item, index) => (
          <Col xs={12} sm={8} md={6} key={index}>
            <div
              className="rounded-2xl p-5 text-white relative overflow-hidden"
              style={{
                background: item.gradient,
                boxShadow: `0 8px 32px ${item.glow}`,
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; }}
            >
              <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <div className="text-2xl mb-2" style={{ opacity: 0.8 }}>{item.icon}</div>
              <div className="text-3xl font-bold">{item.value}{item.suffix}</div>
              <div className="text-sm opacity-80">{item.title}</div>
              {item.extra && <div className="text-xs opacity-60 mt-1">{item.extra}</div>}
            </div>
          </Col>
        ))}
      </Row>

      {/* 图表区 */}
      <Row gutter={[16, 16]}>
        {/* 面试趋势 */}
        <Col xs={24} lg={14}>
          <Card
            title="面试趋势"
            extra={
              <Segmented
                size="small"
                options={[
                  { label: '按周', value: 'week' },
                  { label: '按月', value: 'month' },
                ]}
                value={trendPeriod}
                onChange={(v) => setTrendPeriod(v as 'week' | 'month')}
              />
            }
          >
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(236, 72, 153, 0.08)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis allowDecimals={false} stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(236, 72, 153, 0.15)',
                      borderRadius: 12,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="面试数"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fill="url(#areaGradient)"
                    dot={{ fill: '#ec4899', strokeWidth: 2, stroke: '#fff', r: 5 }}
                    activeDot={{ r: 7, fill: '#ec4899', stroke: '#fff', strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>

        {/* 公司状态分布 */}
        <Col xs={24} lg={10}>
          <Card title="公司状态分布">
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={105}
                    paddingAngle={4}
                    dataKey="value"
                    cornerRadius={6}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(236, 72, 153, 0.15)',
                      borderRadius: 12,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>

        {/* 面试轮次分布 */}
        <Col xs={24}>
          <Card title="面试轮次分布">
            {roundData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roundData} layout="vertical">
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(236, 72, 153, 0.08)" />
                  <XAxis type="number" allowDecimals={false} stroke="#9ca3af" fontSize={12} />
                  <YAxis type="category" dataKey="name" width={80} stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(255,255,255,0.9)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(236, 72, 153, 0.15)',
                      borderRadius: 12,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="count" name="面试数" fill="url(#barGradient)" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description="暂无数据" />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
