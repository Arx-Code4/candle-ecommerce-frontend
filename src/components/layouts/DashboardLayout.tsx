import { Outlet } from 'react-router-dom';
import { ShopFooter } from '@/components/common/ShopFooter';
import { Header } from './Header';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />
      <main className="flex-1 pt-[90px]">
        <Outlet />
      </main>
      <ShopFooter />
    </div>
  );
}
