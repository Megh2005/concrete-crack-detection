import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email address and password.');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const trimmedEmail = credentials.email.trim().toLowerCase();

        if (!emailRegex.test(trimmedEmail)) {
          throw new Error('Please enter a valid email address.');
        }

        if (credentials.password.length < 8 || credentials.password.length > 12) {
          throw new Error('Password must be strictly 8 to 12 characters long.');
        }

        await connectDB();

        const user = await User.findOne({ email: trimmedEmail }).select('_id name email password salutation').lean();

        if (!user) {
          throw new Error('Invalid email address or password.');
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid email address or password.');
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          salutation: user.salutation,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  pages: {
    signIn: '/auth',
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.salutation = (user as any).salutation;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).salutation = token.salutation;
      }
      return session;
    },
  },
};
