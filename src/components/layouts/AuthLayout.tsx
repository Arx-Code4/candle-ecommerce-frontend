import { Outlet } from 'react-router-dom';

interface AuthLayoutProps {
  maxWidth?: string;
}

export default function AuthLayout({ maxWidth = 'max-w-sm' }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className={`w-full ${maxWidth}`}>
        <Outlet />
      </div>
    </div>
  );
}
