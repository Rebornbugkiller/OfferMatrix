import { useState } from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import type { CreateApplicationRequest } from '../types';
import { applicationApi } from '../services/api';

interface ApplicationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ApplicationForm({
  open,
  onClose,
  onSuccess,
}: ApplicationFormProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      const data: CreateApplicationRequest = {
        company_name: values.company_name,
        job_title: values.job_title,
        current_status: values.current_status || 'IN_PROCESS',
      };
      await applicationApi.create(data);
      message.success('申请已添加');
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
      title="添加新申请"
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
        initialValues={{ current_status: 'IN_PROCESS' }}
      >
        <Form.Item
          name="company_name"
          label="公司名称"
          rules={[{ required: true, message: '请输入公司名称' }]}
        >
          <Input placeholder="例如：字节跳动" />
        </Form.Item>

        <Form.Item name="job_title" label="职位名称">
          <Input placeholder="例如：前端工程师" />
        </Form.Item>

        <Form.Item name="current_status" label="当前状态">
          <Select>
            <Select.Option value="IN_PROCESS">进行中</Select.Option>
            <Select.Option value="OFFER">已拿 Offer</Select.Option>
            <Select.Option value="REJECTED">已拒绝</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
}
