import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

// In-memory array for dummy users
export const users = [];

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = users.find(u => u.email === credentials.email);

                if (user && user.password === credentials.password) {
                    return { id: user.id, name: user.name, email: user.email };
                }

                // Dummy fallback test user
                if (credentials.email === 'test@test.com' && credentials.password === 'password') {
                    return { id: 'test-1', name: 'Test User', email: 'test@test.com' };
                }

                throw new Error("Invalid credentials");
            }
        })
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token) {
                session.user.id = token.id;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development_purposes',
});
