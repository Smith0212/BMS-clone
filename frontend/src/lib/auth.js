import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

const BMS_URL = process.env.BMS_API_URL || 'http://localhost:8856/api/v1';
const BMS_KEY = process.env.BMS_API_KEY  || 'bms-api-key-2024';

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email:    { label: 'Email',    type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                try {
                    const res = await fetch(`${BMS_URL}/user/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'api-key': BMS_KEY,
                            'accept-language': 'en',
                        },
                        body: JSON.stringify({
                            email:    credentials.email,
                            password: credentials.password,
                        }),
                    });

                    const data = await res.json();

                    if (data.code === 1 && data.data?.user_token) {
                        const { user_id, first_name, last_name, email, user_token } = data.data;
                        return {
                            id:           String(user_id),
                            name:         `${first_name || ''} ${last_name || ''}`.trim() || email,
                            email:        email,
                            backendToken: user_token,
                        };
                    }
                    // Surface the backend error message to the login page
                    throw new Error(data.message || 'Invalid credentials');
                } catch (err) {
                    throw new Error(err.message || 'Login failed');
                }
            },
        }),
    ],
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/login',
        error:  '/login',
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id           = user.id;
                token.backendToken = user.backendToken;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id           = token.id;
            session.user.backendToken = token.backendToken;
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || 'fallback_secret_for_development_purposes',
});
