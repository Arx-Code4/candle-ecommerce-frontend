import { Outlet, useLocation } from 'react-router-dom';
import { ShopFooter } from '@/components/common/ShopFooter';
import { Header } from './Header';
import { ROUTES } from '@/constants';

export default function ShopLayout() {
  const location = useLocation();
  const isHomePage = location.pathname === ROUTES.HOME || location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      <Header />

      {/* 
        If it's the home page, we want the content to go all the way to the top edge 
        so the Hero image sits behind the transparent header.
        Otherwise, we add top padding so content isn't obscured.
      */}
      <main className={`flex-1 ${!isHomePage ? 'pt-[90px]' : ''}`}>
        <Outlet />
      </main>

      <ShopFooter />
    </div>
  );
}
