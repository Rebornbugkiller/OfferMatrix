import { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Button, message } from 'antd';
import {
  getLLMConfig,
  saveLLMConfig,
  testLLMConnection,
  type LLMConfig,
  type LLMProvider,
} from '../services/llm';

interface LLMSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const PROVIDER_OPTIONS: { value: LLMProvider; label: string }[] = [
  { value: 'openai', label: 'OpenAI' },
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'qwen', label: '通义千问' },
  { value: 'zhipu', label: '智谱 AI' },
];

const DEFAULT_MODELS: Record<LLMProvider, string> = {
  openai: 'gpt-4o-mini',
  claude: 'claude-3-haiku-20240307',
  qwen: 'qwen-turbo',
  zhipu: 'glm-4-flash',
};

export default function LLMSettingsModal({
  open,
  onClose,
}: LLMSettingsModalProps) {
  const [form] = Form.useForm();
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (open) {
      const config = getLLMConfig();
      if (config) {
        form.setFieldsValue(config);
      } else {
        form.setFieldsValue({ provider: 'openai' });
      }
    }
  }, [open, form]);

  const handleProviderChange = (provider: LLMProvider) => {
    form.setFieldsValue({ model: DEFAULT_MODELS[provider] });
  };

  const handleTest = async () => {
    try {
      const values = await form.validateFields();
      setTesting(true);
      const config: LLMConfig = {
        provider: values.provider,
        apiKey: values.apiKey,
        model: values.model,
        baseUrl: values.baseUrl,
      };
      const success = await testLLMConnection(config);
      if (success) {
        message.success('连接成功');
      } else {
        message.error('连接失败，请检查配置');
      }
    } catch {
      message.error('请填写必要信息');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const config: LLMConfig = {
        provider: values.provider,
        apiKey: values.apiKey,
        model: values.model,
        baseUrl: values.baseUrl,
      };
      saveLLMConfig(config);
      message.success('配置已保存');
      onClose();
    } catch {
      message.error('请填写必要信息');
    }
  };

  return (
    <Modal
      title="LLM 设置"
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="test" onClick={handleTest} loading={testing}>
          测试连接
        </Button>,
        <Button key="cancel" onClick={onClose}>
          取消
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          保存
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="provider"
          label="LLM 提供商"
          rules={[{ required: true, message: '请选择提供商' }]}
        >
          <Select options={PROVIDER_OPTIONS} onChange={handleProviderChange} />
        </Form.Item>

        <Form.Item
          name="apiKey"
          label="API Key"
          rules={[{ required: true, message: '请输入 API Key' }]}
        >
          <Input.Password placeholder="sk-..." />
        </Form.Item>

        <Form.Item name="model" label="模型（可选）">
          <Input placeholder="留空使用默认模型" />
        </Form.Item>

        <Form.Item name="baseUrl" label="自定义 API 地址（可选）">
          <Input placeholder="留空使用默认地址" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
