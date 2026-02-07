import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout, Menu, Dropdown, Spin } from 'antd';
import { CalendarOutlined, AppstoreOutlined, UserOutlined, LogoutOutlined, BarChartOutlined } from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import ApplicationDetail from './pages/ApplicationDetail';
import Statistics from './pages/Statistics';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

const { Header, Content } = Layout;

// 樱花飘落背景组件
function BackgroundDecorations() {
  return (
    <div className="bg-decorations">
      <div className="sakura sakura-1">🌸</div>
      <div className="sakura sakura-2">🌸</div>
      <div className="sakura sakura-3">🌸</div>
      <div className="sakura sakura-4">🌸</div>
      <div className="sakura sakura-5">🌸</div>
      <div className="sakura sakura-6">🌸</div>
      <div className="sakura sakura-7">🌸</div>
      <div className="sakura sakura-8">🌸</div>
      <div className="sakura sakura-9">🌸</div>
      <div className="sakura sakura-10">🌸</div>
      <div className="sakura sakura-11">🌸</div>
      <div className="sakura sakura-12">🌸</div>
      <div className="sakura sakura-13">🌸</div>
      <div className="sakura sakura-14">🌸</div>
      <div className="sakura sakura-15">🌸</div>
      <div className="sakura sakura-16">🌸</div>
      <div className="sakura sakura-17">🌸</div>
      <div className="sakura sakura-18">🌸</div>
      <div className="sakura sakura-19">🌸</div>
      <div className="sakura sakura-20">🌸</div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <CalendarOutlined />,
      label: <Link to="/">面试日历</Link>,
    },
    {
      key: '/applications',
      icon: <AppstoreOutlined />,
      label: <Link to="/applications">公司申请</Link>,
    },
    {
      key: '/statistics',
      icon: <BarChartOutlined />,
      label: <Link to="/statistics">数据统计</Link>,
    },
  ];

  const selectedKey = location.pathname.startsWith('/applications')
    ? '/applications'
    : location.pathname.startsWith('/statistics')
    ? '/statistics'
    : '/';

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Layout className="min-h-screen" style={{ position: 'relative' }}>
      <BackgroundDecorations />
      <Header
        className="flex items-center px-6"
        style={{
          background: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
          boxShadow: '0 2px 8px rgba(236, 72, 153, 0.3)'
        }}
      >
        <div className="flex items-center mr-8">
          <span className="text-xl font-semibold tracking-tight text-white">OfferMatrix</span>
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[selectedKey]}
          items={menuItems}
          className="flex-1 border-none"
          style={{ background: 'transparent' }}
        />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <div className="flex items-center cursor-pointer text-white hover:opacity-80">
            <UserOutlined className="mr-2" />
            <span>{user?.username}</span>
          </div>
        </Dropdown>
      </Header>
      <Content className="p-6" style={{ background: 'transparent', position: 'relative', zIndex: 1 }}>
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/applications/:id" element={<ApplicationDetail />} />
            <Route path="/statistics" element={<Statistics />} />
          </Routes>
        </div>
      </Content>
    </Layout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#3b82f6',
          colorText: '#334155',
          colorTextSecondary: '#64748b',
          borderRadius: 8,
        },
        components: {
          Menu: {
            darkItemBg: 'transparent',
            darkItemSelectedBg: 'rgba(255,255,255,0.15)',
            darkItemHoverBg: 'rgba(255,255,255,0.1)',
          }
        }
      }}
    >
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
