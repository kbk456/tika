import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tika',
  description: 'Ticket-based Kanban Board',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
