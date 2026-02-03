import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  Timeline,
  Tag,
  Button,
  Descriptions,
  message,
  Empty,
} from 'antd';
import {
  ArrowLeftOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import type { Application, Interview } from '../types';
import { applicationApi } from '../services/api';
import AddInterviewModal from '../components/AddInterviewModal';
import InterviewDrawer from '../components/InterviewDrawer';

const statusIcons: Record<string, React.ReactNode> = {
  SCHEDULED: <ClockCircleOutlined style={{ color: '#1890ff' }} />,
  FINISHED: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
  CANCELLED: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
};

const statusColors: Record<string, string> = {
  SCHEDULED: 'blue',
  FINISHED: 'green',
  CANCELLED: 'red',
};

const appStatusLabels: Record<string, string> = {
  IN_PROCESS: '进行中',
  OFFER: '已拿 Offer',
  REJECTED: '已拒绝',
};

const appStatusColors: Record<string, string> = {
  IN_PROCESS: 'blue',
  OFFER: 'green',
  REJECTED: 'red',
};

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchApplication = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const res = await applicationApi.get(parseInt(id, 10));
      setApplication(res.data);
    } catch (error) {
      message.error('获取申请详情失败');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleInterviewClick = (interview: Interview) => {
    setSelectedInterview({ ...interview, application: application ?? undefined });
    setDrawerOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (!application) {
    return <div className="text-center py-8">申请不存在</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/applications')}
        >
          返回
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">
          {application.company_name}
        </h1>
        <Tag color={appStatusColors[application.current_status]}>
          {appStatusLabels[application.current_status]}
        </Tag>
      </div>

      <Card>
        <Descriptions column={2}>
          <Descriptions.Item label="公司名称">
            {application.company_name}
          </Descriptions.Item>
          <Descriptions.Item label="职位">
            {application.job_title || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {new Date(application.created_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(application.updated_at).toLocaleString('zh-CN')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="面试时间线"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            添加面试
          </Button>
        }
      >
        {application.interviews && application.interviews.length > 0 ? (
          <Timeline
            items={application.interviews.map((interview) => ({
              dot: statusIcons[interview.status],
              children: (
                <div
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded -m-2"
                  onClick={() => handleInterviewClick(interview)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{interview.round_name}</span>
                    <Tag color={statusColors[interview.status]}>
                      {interview.status === 'SCHEDULED'
                        ? '待进行'
                        : interview.status === 'FINISHED'
                          ? '已完成'
                          : '已取消'}
                    </Tag>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(interview.start_time).toLocaleString('zh-CN')} -{' '}
                    {new Date(interview.end_time).toLocaleTimeString('zh-CN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                  {interview.meeting_link && (
                    <div className="text-sm text-blue-500 mt-1">
                      <a
                        href={interview.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        会议链接
                      </a>
                    </div>
                  )}
                  {interview.review_content && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                      <div className="text-xs text-gray-400 mb-1">复盘笔记</div>
                      <div className="prose prose-sm max-w-none line-clamp-3">
                        <ReactMarkdown>
                          {interview.review_content.slice(0, 200)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        ) : (
          <Empty description="暂无面试记录" />
        )}
      </Card>

      <AddInterviewModal
        application={application}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchApplication}
      />

      <InterviewDrawer
        interview={selectedInterview}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onUpdate={fetchApplication}
        onDelete={fetchApplication}
      />
    </div>
  );
}
