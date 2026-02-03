import { useState, useEffect, useMemo } from 'react';
import { Card, Statistic, Row, Col, Segmented, Empty, Spin } from 'antd';
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
  LineChart,
  Line,
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
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="总面试场次"
              value={stats.totalInterviews}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="申请公司数"
              value={stats.totalCompanies}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="Offer"
              value={stats.offers}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="已挂"
              value={stats.rejected}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="进行中"
              value={stats.inProcess}
              prefix={<RocketOutlined />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="Offer 率"
              value={stats.offerRate}
              suffix="%"
              prefix={<PercentageOutlined />}
              valueStyle={{ color: '#22c55e' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="复盘完成率"
              value={stats.reviewRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={6}>
          <Card>
            <Statistic
              title="单日最多面试"
              value={stats.maxDayCount}
              suffix="场"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#f97316' }}
            />
            <div className="text-xs text-gray-400 mt-1">{stats.maxDayDate}</div>
          </Card>
        </Col>
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
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="面试数"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={{ fill: '#4f46e5' }}
                  />
                </LineChart>
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
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="面试数" fill="#4f46e5" radius={[0, 4, 4, 0]} />
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
