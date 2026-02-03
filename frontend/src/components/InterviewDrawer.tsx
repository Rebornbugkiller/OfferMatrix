import { useState, useEffect } from 'react';
import {
  Drawer,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tabs,
  message,
  Popconfirm,
} from 'antd';
import { DeleteOutlined, LinkOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Interview, UpdateInterviewRequest } from '../types';
import { interviewApi, applicationApi } from '../services/api';

interface InterviewDrawerProps {
  interview: Interview | null;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
  onDelete: () => void;
}

export default function InterviewDrawer({
  interview,
  open,
  onClose,
  onUpdate,
  onDelete,
}: InterviewDrawerProps) {
  const [form] = Form.useForm();
  const [reviewContent, setReviewContent] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (interview) {
      form.setFieldsValue({
        job_title: interview.application?.job_title,
        round_name: interview.round_name,
        start_time: dayjs(interview.start_time),
        end_time: dayjs(interview.end_time),
        status: interview.status,
        meeting_link: interview.meeting_link,
      });
      setReviewContent(interview.review_content || '');
    }
  }, [interview, form]);

  const handleSaveDetails = async () => {
    if (!interview) return;
    try {
      setLoading(true);
      const values = await form.validateFields();

      // 更新职位（如果有变化）
      if (values.job_title !== interview.application?.job_title && interview.application_id) {
        await applicationApi.update(interview.application_id, {
          job_title: values.job_title,
        });
      }

      const data: UpdateInterviewRequest = {
        round_name: values.round_name,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        status: values.status,
        meeting_link: values.meeting_link,
      };
      await interviewApi.update(interview.id, data);
      message.success('保存成功');
      onUpdate();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReview = async () => {
    if (!interview) return;
    try {
      setLoading(true);
      await interviewApi.updateReview(interview.id, reviewContent);
      message.success('复盘笔记已保存');
      onUpdate();
    } catch (error) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!interview) return;
    try {
      await interviewApi.delete(interview.id);
      message.success('已删除');
      onDelete();
      onClose();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const tabItems = [
    {
      key: 'details',
      label: '面试详情',
      children: (
        <Form form={form} layout="vertical">
          <Form.Item name="job_title" label="职位">
            <Input placeholder="例如：前端开发工程师" />
          </Form.Item>

          <Form.Item
            name="round_name"
            label="面试轮次"
            rules={[{ required: true, message: '请选择面试轮次' }]}
          >
            <Select placeholder="请选择面试轮次">
              <Select.Option value="AI面">AI面</Select.Option>
              <Select.Option value="HR面">HR面</Select.Option>
              <Select.Option value="业务一面">业务一面</Select.Option>
              <Select.Option value="业务二面">业务二面</Select.Option>
              <Select.Option value="业务三面">业务三面</Select.Option>
              <Select.Option value="技术一面">技术一面</Select.Option>
              <Select.Option value="技术二面">技术二面</Select.Option>
              <Select.Option value="终面">终面</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="start_time"
            label="开始时间"
            rules={[{ required: true, message: '请选择开始时间' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item
            name="end_time"
            label="结束时间"
            rules={[{ required: true, message: '请选择结束时间' }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
          </Form.Item>

          <Form.Item name="status" label="状态">
            <Select>
              <Select.Option value="SCHEDULED">待进行</Select.Option>
              <Select.Option value="FINISHED">已完成</Select.Option>
              <Select.Option value="CANCELLED">已取消</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="meeting_link" label="会议链接">
            <Input
              prefix={<LinkOutlined />}
              placeholder="Zoom/腾讯会议链接"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" onClick={handleSaveDetails} loading={loading}>
              保存
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'review',
      label: '面试复盘',
      children: (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              复盘笔记
            </label>
            <Input.TextArea
              value={reviewContent}
              onChange={(e) => setReviewContent(e.target.value)}
              rows={12}
              placeholder="记录面试问题、你的回答、以及事后反思..."
            />
          </div>

          <Button type="primary" onClick={handleSaveReview} loading={loading}>
            保存笔记
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Drawer
      title={
        <div className="flex justify-between items-center">
          <span>
            {interview?.application?.company_name} - {interview?.round_name}
          </span>
        </div>
      }
      placement="right"
      size="large"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Popconfirm
            title="确定删除这场面试吗？"
            onConfirm={handleDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      }
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />
    </Drawer>
  );
}
