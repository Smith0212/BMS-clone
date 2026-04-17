import { Toaster } from 'react-hot-toast';
import Providers from '@/components/Providers';
import './globals.css';

export const metadata = {
    title: 'Book My Show',
    description: 'Movie ticket booking application',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className="bg-gray-950 text-white min-h-screen antialiased">
                <Providers>
                    {children}
                    <Toaster position="top-right" />
                </Providers>
            </body>
        </html>
    );
}
