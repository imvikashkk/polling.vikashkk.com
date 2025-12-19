import type { Metadata } from 'next';
import { Sora } from 'next/font/google';
import './globals.css';
import { Providers } from '../componnets/Providers';
import { NotificationContainer } from '@/componnets/shared/NotificationContainer';

const sora = Sora({
  variable: '--font-sora',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Live Polling System',
  description: 'Real-time polling system for teachers and students',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={sora.variable}>
        <Providers>
          {children}
          <NotificationContainer />
        </Providers>
      </body>
    </html>
  );
}
