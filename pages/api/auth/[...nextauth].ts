import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import User from '../../../models/User';
import db from '../../../utils/db';
import { isPasswordValid } from '../../../utils/hash';

export default NextAuth({
  pages: {
    signIn: '/',
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email", placeholder: "user@example.com" },
        password: { label: "Password", type: "password" },
      },
      //@ts-ignore
      async authorize(credentials: any) {
        await db.connect();

        const user = await User.findOne({ email: credentials.email });

        // Check if user exists
        if (!user) {
          return null;
        }

        // Validate password
        const isPasswordMatch = await isPasswordValid(
          credentials.password,
          user.password
        );

        if (!isPasswordMatch) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],

  secret: process.env.SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  callbacks: {
    // Add user id to the token right after successful login
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Pass the user id from token to session object
    async session({ session, token }) {
      if (token.id) {
        // @ts-ignore
        session.user.id = token.id;
      }
      return session;
    },
  },
});
