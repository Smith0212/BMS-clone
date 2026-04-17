import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'Book My Show',
  description: 'Movie ticket booking application'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white min-h-screen antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
