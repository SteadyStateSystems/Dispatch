import './globals.css';

export const metadata = {
  title: 'Jarvis Mission Control',
  description: 'Read-only mission control dashboard for mobile and desktop.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
