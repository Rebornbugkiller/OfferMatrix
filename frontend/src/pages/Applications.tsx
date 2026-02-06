import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Popconfirm,
  message,
  Select,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Application } from '../types';
import { applicationApi } from '../services/api';
import ApplicationForm from '../components/ApplicationForm';

export default function Applications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const fetchApplications = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const res = await applicationApi.list(search);
      setApplications(res.data);
    } catch (error) {
      message.error('获取申请列表失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearch = () => {
    fetchApplications(keyword);
  };

  const handleStatusChange = useCallback(async (id: number, status: Application['current_status']) => {
    // 保存当前状态用于回滚
    let oldStatus: Application['current_status'] | undefined;
    setApplications(prev => {
      const app = prev.find(a => a.id === id);
      oldStatus = app?.current_status;
      return prev.map(a =>
        a.id === id ? { ...a, current_status: status } : a
      );
    });

    try {
      await applicationApi.update(id, { current_status: status });
      message.success('状态已更新');
    } catch (error) {
      // 回滚到原状态
      if (oldStatus !== undefined) {
        setApplications(prev =>
          prev.map(a =>
            a.id === id ? { ...a, current_status: oldStatus! } : a
          )
        );
      }
      message.error('更新失败，已恢复');
    }
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    // 保存被删除的项用于回滚
    let deletedApp: Application | undefined;
    let deletedIndex: number = -1;
    setApplications(prev => {
      deletedIndex = prev.findIndex(a => a.id === id);
      deletedApp = prev[deletedIndex];
      return prev.filter(a => a.id !== id);
    });

    try {
      await applicationApi.delete(id);
      message.success('已删除');
    } catch (error) {
      // 回滚：恢复被删除的项
      if (deletedApp && deletedIndex >= 0) {
        setApplications(prev => {
          const newList = [...prev];
          newList.splice(deletedIndex, 0, deletedApp!);
          return newList;
        });
      }
      message.error('删除失败，已恢复');
    }
  }, []);

  const columns = useMemo<ColumnsType<Application>>(() => [
    {
      title: '公司名称',
      dataIndex: 'company_name',
      key: 'company_name',
      render: (text, record) => (
        <a onClick={() => navigate(`/applications/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '职位',
      dataIndex: 'job_title',
      key: 'job_title',
    },
    {
      title: '状态',
      dataIndex: 'current_status',
      key: 'current_status',
      render: (status, record) => (
        <Select
          value={status}
          onChange={(value) => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
          size="small"
        >
          <Select.Option value="IN_PROCESS">
            <Tag color="blue">进行中</Tag>
          </Select.Option>
          <Select.Option value="OFFER">
            <Tag color="green">已拿 Offer</Tag>
          </Select.Option>
          <Select.Option value="REJECTED">
            <Tag color="red">已拒绝</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: '面试轮数',
      key: 'interviews_count',
      render: (_, record) => record.interviews?.length || 0,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/applications/${record.id}`)}
          >
            详情
          </Button>
          <Popconfirm
            title="确定删除这个申请吗？相关面试也会被删除。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ], [navigate, handleStatusChange, handleDelete]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">公司申请</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setFormOpen(true)}
        >
          添加申请
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="搜索公司或职位"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
          />
          <Button onClick={handleSearch}>搜索</Button>
        </div>

        <Table
          columns={columns}
          dataSource={applications}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </div>

      <ApplicationForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={() => fetchApplications(keyword)}
      />
    </div>
  );
}
