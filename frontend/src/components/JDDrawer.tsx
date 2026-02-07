import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Drawer, Input, Button, Divider, Empty, Spin, message } from 'antd';
import { RobotOutlined, SettingOutlined, ArrowRightOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import type { Application } from '../types';
import { applicationApi } from '../services/api';
import { analyzeJD, getLLMConfig } from '../services/llm';
import LLMSettingsModal from './LLMSettingsModal';

interface JDDrawerProps {
  application: Application | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (app: Application) => void;
}

export default function JDDrawer({ application, open, onClose, onUpdate }: JDDrawerProps) {
  const navigate = useNavigate();
  const [jdText, setJdText] = useState('');
  const [salary, setSalary] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [llmSettingsOpen, setLlmSettingsOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (application) {
      setJdText(application.job_description || '');
      setSalary(application.salary || '');
      setAnalysis(application.jd_analysis || '');
      setDirty(false);
    }
  }, [application]);

  const handleSaveJD = async () => {
    if (!application) return;
    setSaving(true);
    try {
      const res = await applicationApi.update(application.id, {
        job_description: jdText,
        salary: salary,
      });
      message.success('已保存');
      onUpdate(res.data);
      setDirty(false);
    } catch {
      message.error('保存失败');
    } finally {
      setSaving(false);
    }
  };
  const handleAnalyze = async () => {
    if (!application) return;
    if (!jdText.trim()) {
      message.warning('请先输入 JD 内容');
      return;
    }
    const config = getLLMConfig();
    if (!config) {
      message.warning('请先配置 LLM');
      setLlmSettingsOpen(true);
      return;
    }
    setAnalyzing(true);
    try {
      const result = await analyzeJD(
        jdText,
        application.company_name,
        application.job_title || '',
        salary
      );
      setAnalysis(result);
      await applicationApi.update(application.id, {
        jd_analysis: result,
      });
      message.success('分析完成并已保存');
      onUpdate({ ...application, jd_analysis: result });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '分析失败');
    } finally {
      setAnalyzing(false);
    }
  };

  const hasLLMConfig = !!getLLMConfig();

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold" style={{ color: '#1e1b4b' }}>
              {application?.company_name}
              {application?.job_title && (
                <span className="text-sm font-normal ml-2" style={{ color: '#6b7280' }}>
                  {application.job_title}
                </span>
              )}
            </span>
          </div>
        }
        placement="right"
        size="large"
        onClose={onClose}
        open={open}
        extra={
          <Button
            size="small"
            icon={<SettingOutlined />}
            onClick={() => setLlmSettingsOpen(true)}
          >
            LLM 设置
          </Button>
        }
      >
        {/* 薪资输入 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-semibold" style={{ color: '#1e1b4b' }}>
              薪资待遇
            </h3>
            <Button
              type="primary"
              onClick={handleSaveJD}
              loading={saving}
              disabled={!dirty}
              size="small"
            >
              保存
            </Button>
          </div>
          <Input
            value={salary}
            onChange={(e) => {
              setSalary(e.target.value);
              setDirty(true);
            }}
            placeholder="如：20-35k * 14"
            style={{ marginBottom: 12 }}
          />
        </div>

        {/* JD 输入区 */}
        <div className="mb-6">
          <h3 className="text-base font-semibold mb-2" style={{ color: '#1e1b4b' }}>
            职位描述 (JD)
          </h3>
          <Input.TextArea
            value={jdText}
            onChange={(e) => {
              setJdText(e.target.value);
              setDirty(true);
            }}
            placeholder="粘贴职位描述 (JD) 内容..."
            rows={8}
            style={{ resize: 'vertical' }}
          />
        </div>

        <Divider />

        {/* AI 分析区 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold" style={{ color: '#1e1b4b' }}>
              AI 分析
            </h3>
            <Button
              icon={<RobotOutlined />}
              onClick={handleAnalyze}
              loading={analyzing}
              disabled={!jdText.trim() || !hasLLMConfig}
              style={
                jdText.trim() && hasLLMConfig
                  ? {
                      background: 'linear-gradient(135deg, #ec4899, #a855f7)',
                      borderColor: 'transparent',
                      color: 'white',
                    }
                  : undefined
              }
              size="small"
            >
              {analysis ? '重新分析' : 'AI 分析'}
            </Button>
          </div>

          {!hasLLMConfig && (
            <div className="text-sm mb-3 p-3 rounded-lg" style={{ background: '#fffbeb', color: '#92400e' }}>
              请先点击右上角「LLM 设置」配置 AI 服务后使用分析功能
            </div>
          )}

          {analyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Spin size="large" />
              <div className="mt-3 text-sm" style={{ color: '#6b7280' }}>AI 正在分析 JD...</div>
            </div>
          ) : analysis ? (
            <div
              className="prose prose-sm max-w-none rounded-xl p-4"
              style={{ background: 'rgba(249, 250, 251, 0.8)' }}
            >
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          ) : (
            <Empty
              description={<span style={{ color: '#9ca3af' }}>暂无分析结果，请先粘贴 JD 并点击 AI 分析</span>}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </div>

        <Divider />

        {/* 查看详情链接 */}
        <Button
          type="link"
          icon={<ArrowRightOutlined />}
          onClick={() => {
            onClose();
            navigate(`/applications/${application?.id}`);
          }}
          style={{ color: '#ec4899', padding: 0 }}
        >
          查看完整详情
        </Button>
      </Drawer>

      <LLMSettingsModal
        open={llmSettingsOpen}
        onClose={() => setLlmSettingsOpen(false)}
      />
    </>
  );
}
