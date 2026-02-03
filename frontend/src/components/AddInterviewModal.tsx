import { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { Application, CreateInterviewRequest } from '../types';
import { interviewApi } from '../services/api';

interface AddInterviewModalProps {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddInterviewModal({
  application,
  open,
  onClose,
  onSuccess,
}: AddInterviewModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!application) return;
    try {
      setLoading(true);
      const values = await form.validateFields();
      const data: CreateInterviewRequest = {
        application_id: application.id,
        round_name: values.round_name,
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        status: values.status || 'SCHEDULED',
        meeting_link: values.meeting_link,
      };
      await interviewApi.create(data);
      message.success('面试已添加');
      form.resetFields();
      onSuccess();
      onClose();
    } catch (error) {
      message.error('添加失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`添加面试 - ${application?.company_name}`}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="添加"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: 'SCHEDULED',
          start_time: dayjs().hour(10).minute(0),
          end_time: dayjs().hour(11).minute(0),
        }}
      >
        <Form.Item
          name="round_name"
          label="面试轮次"
          rules={[{ required: true, message: '请输入面试轮次' }]}
        >
          <Input placeholder="例如：技术一面、HR面" />
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
          <Input placeholder="Zoom/腾讯会议链接" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
