import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, message } from 'antd';
import dayjs from 'dayjs';
import type { Application, CreateInterviewRequest } from '../types';
import { interviewApi, applicationApi } from '../services/api';

interface AddInterviewModalProps {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onApplicationUpdate?: () => void;
}

export default function AddInterviewModal({
  application,
  open,
  onClose,
  onSuccess,
  onApplicationUpdate,
}: AddInterviewModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (application && open) {
      form.setFieldsValue({
        application_status: application.current_status,
      });
    }
  }, [application, open, form]);

  const handleSubmit = async () => {
    if (!application) return;
    try {
      setLoading(true);
      const values = await form.getFieldsValue();

      // 更新公司状态（如果有变化）
      if (values.application_status !== application.current_status) {
        await applicationApi.update(application.id, {
          current_status: values.application_status,
        });
        onApplicationUpdate?.();
      }

      // 如果选择了面试轮次，才创建面试
      if (values.round_name) {
        const data: CreateInterviewRequest = {
          application_id: application.id,
          round_name: values.round_name,
          start_time: values.start_time.toISOString(),
          end_time: values.end_time.toISOString(),
          status: values.status || 'SCHEDULED',
          meeting_link: values.meeting_link,
          notes: values.notes,
        };
        await interviewApi.create(data);
        message.success('面试已添加');
        onSuccess();
      } else {
        message.success('已更新');
      }

      form.resetFields();
      onClose();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={`${application?.company_name}`}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="保存"
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
        <Form.Item name="application_status" label="公司状态">
          <Select>
            <Select.Option value="IN_PROCESS">进行中</Select.Option>
            <Select.Option value="OFFER">已拿 Offer ✓</Select.Option>
            <Select.Option value="REJECTED">已拒绝 ✗</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="round_name"
          label="面试轮次"
        >
          <Select placeholder="不选则只更新公司状态" allowClear>
            <Select.Option value="一面">一面</Select.Option>
            <Select.Option value="二面">二面</Select.Option>
            <Select.Option value="三面">三面</Select.Option>
            <Select.Option value="HR面">HR面</Select.Option>
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
          <Input placeholder="Zoom/腾讯会议链接" />
        </Form.Item>

        <Form.Item name="notes" label="备注">
          <Input.TextArea rows={2} placeholder="会议号、面试官信息等" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
