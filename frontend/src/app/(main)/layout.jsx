import Navbar from '@/components/Navbar';

export default function MainLayout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 w-full max-w-7xl mx-auto">{children}</main>
            <footer className="w-full bg-gray-900 border-t border-gray-800 py-8 mt-12 text-center text-sm text-gray-400">
                <p>&copy; {new Date().getFullYear()} Book My Show Clone. All rights reserved.</p>
            </footer>
        </div>
    );
}
