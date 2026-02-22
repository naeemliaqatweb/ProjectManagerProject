import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
                twoFactorToken: { label: "2FA Token", type: "text" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                try {
                    const response = await axios.post(`${process.env.BACKEND_URL}/users/login`, {
                        email: credentials.email,
                        password: credentials.password,
                        twoFactorToken: credentials.twoFactorToken,
                    });
                    const user = response.data;

                    if (user && !user.requires2fa) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            accessToken: user.accessToken, // Capture token
                        };
                    }
                    return null;
                } catch (error) {
                    console.error('Auth error:', error);
                    return null;
                }
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.image = (user as any).image;
                token.accessToken = (user as any).accessToken; // Persist token
            }
            if (trigger === "update" && session) {
                if (session.user?.name) token.name = session.user.name;
                if (session.user?.email) token.email = session.user.email;

                // Track either field (flatter or nested)
                const newImage = session.image || session.user?.image;
                if (newImage !== undefined) {
                    token.image = newImage;
                }
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                session.user.name = token.name as string;
                session.user.email = token.email as string;
                session.user.image = token.image as string;
                (session as any).accessToken = token.accessToken; // Expose token
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
