import { useState } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, message, Space } from 'antd';
import { RobotOutlined, SettingOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Application } from '../types';
import { interviewApi, applicationApi } from '../services/api';
import { parseInterviewText, getLLMConfig } from '../services/llm';
import LLMSettingsModal from './LLMSettingsModal';

interface AIQuickAddModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  applications: Application[];
}

export default function AIQuickAddModal({
  open,
  onClose,
  onSuccess,
  applications,
}: AIQuickAddModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [rawText, setRawText] = useState('');
  const [llmSettingsOpen, setLlmSettingsOpen] = useState(false);
  const [parsed, setParsed] = useState(false);

  const handleClose = () => {
    setRawText('');
    setParsed(false);
    form.resetFields();
    onClose();
  };

  const handleParse = async () => {
    if (!rawText.trim()) {
      message.warning('请先粘贴面试通知内容');
      return;
    }

    const config = getLLMConfig();
    if (!config) {
      message.warning('请先配置 LLM');
      setLlmSettingsOpen(true);
      return;
    }

    setParsing(true);
    try {
      const result = await parseInterviewText(rawText);

      const updates: Record<string, unknown> = {
        status: 'SCHEDULED',
      };

      if (result.company_name) {
        updates.company_name = result.company_name;
      }

      if (result.round_name) {
        updates.round_name = result.round_name;
      }

      if (result.start_time) {
        updates.start_time = dayjs(result.start_time);
      }

      if (result.end_time) {
        updates.end_time = dayjs(result.end_time);
      }

      if (result.meeting_link) {
        updates.meeting_link = result.meeting_link;
      }

      form.setFieldsValue(updates);
      setParsed(true);

      if (result.confidence >= 0.7) {
        message.success(`解析成功 (置信度: ${Math.round(result.confidence * 100)}%)`);
      } else {
        message.warning(`解析完成，但置信度较低 (${Math.round(result.confidence * 100)}%)，请检查结果`);
      }
    } catch (error) {
      message.error(error instanceof Error ? error.message : '解析失败');
    } finally {
      setParsing(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      if (!values.company_name) {
        message.error('请输入公司名称');
        return;
      }

      // 查找是否已存在该公司
      let targetApplication = applications.find(
        (app) => app.company_name === values.company_name
      );

      // 如果公司不存在，创建新公司
      if (!targetApplication) {
        const newApp = await applicationApi.create({
          company_name: values.company_name,
          current_status: 'IN_PROCESS',
        });
        targetApplication = newApp.data;
      }

      // 创建面试
      await interviewApi.create({
        application_id: targetApplication.id,
        round_name: values.round_name || '面试',
        start_time: values.start_time.toISOString(),
        end_time: values.end_time.toISOString(),
        status: values.status || 'SCHEDULED',
        meeting_link: values.meeting_link,
      });

      message.success('面试已添加');
      onSuccess();
      handleClose();
    } catch (error) {
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const hasLLMConfig = !!getLLMConfig();

  return (
    <>
      <Modal
        title={
          <div className="flex items-center justify-between pr-8">
            <span>AI 快速添加面试</span>
            <Button
              size="small"
              icon={<SettingOutlined />}
              onClick={() => setLlmSettingsOpen(true)}
            >
              设置
            </Button>
          </div>
        }
        open={open}
        onOk={handleSubmit}
        onCancel={handleClose}
        confirmLoading={loading}
        okText="保存"
        cancelText="取消"
        okButtonProps={{ disabled: !parsed }}
        width={520}
      >
        {/* 粘贴区域 */}
        <div className="mb-4">
          <div className="text-sm text-gray-600 mb-2">粘贴面试通知</div>
          <Input.TextArea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="粘贴面试邀请邮件或消息内容，AI 将自动解析公司、时间、会议链接等信息..."
            rows={5}
          />
          <div className="mt-2 flex justify-center">
            <Button
              type="primary"
              icon={<RobotOutlined />}
              onClick={handleParse}
              loading={parsing}
              disabled={!rawText.trim() || !hasLLMConfig}
            >
              AI 解析
            </Button>
            {!hasLLMConfig && (
              <span className="ml-2 text-sm text-orange-500">
                请先点击右上角"设置"配置 LLM
              </span>
            )}
          </div>
        </div>

        {/* 解析结果表单 */}
        {parsed && (
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
              name="company_name"
              label="公司名称"
              rules={[{ required: true, message: '请输入公司名称' }]}
            >
              <Input placeholder="如：字节跳动" />
            </Form.Item>

            <Form.Item
              name="round_name"
              label="面试轮次"
              rules={[{ required: true, message: '请选择面试轮次' }]}
            >
              <Select placeholder="选择面试轮次">
                <Select.Option value="一面">一面</Select.Option>
                <Select.Option value="二面">二面</Select.Option>
                <Select.Option value="三面">三面</Select.Option>
                <Select.Option value="HR面">HR面</Select.Option>
              </Select>
            </Form.Item>

            <Space className="w-full" size="middle">
              <Form.Item
                name="start_time"
                label="开始时间"
                rules={[{ required: true, message: '请选择开始时间' }]}
                className="flex-1 mb-0"
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
              </Form.Item>

              <Form.Item
                name="end_time"
                label="结束时间"
                rules={[{ required: true, message: '请选择结束时间' }]}
                className="flex-1 mb-0"
              >
                <DatePicker showTime format="YYYY-MM-DD HH:mm" className="w-full" />
              </Form.Item>
            </Space>

            <Form.Item name="meeting_link" label="会议链接" className="mt-4">
              <Input placeholder="Zoom/腾讯会议/飞书链接" />
            </Form.Item>

            <Form.Item name="status" label="状态" hidden>
              <Select>
                <Select.Option value="SCHEDULED">待进行</Select.Option>
              </Select>
            </Form.Item>
          </Form>
        )}
      </Modal>

      <LLMSettingsModal
        open={llmSettingsOpen}
        onClose={() => setLlmSettingsOpen(false)}
      />
    </>
  );
}
