import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
  points: 5, 
  duration: 60 * 5,
});


export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {

        const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

        if (!credentials) {
          throw new Error("Bitte gib deine Anmeldedaten ein.");
        }

        if (!credentials.email || !credentials.password) {
          throw new Error("Bitte gib sowohl E-Mail als auch Passwort ein.");
        }

        try {
          await rateLimiter.consume(ip);
        } catch (rateLimiterRes) {
          throw new Error("Zu viele Anfragen. Dein Account wurde für 5 Minuten gesperrt. Bitte versuche es später erneut.");
        }

        await dbConnect();

        


        const user = await User.findOne({ email: credentials.email });
        if (!user) {
          throw new Error("Kein Benutzer mit dieser E-Mail gefunden.");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Falsches Passwort.");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: user.name,
          username: user.username,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.username = token.username;
      session.user.name = token.name;

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  jwt: {
    secret: process.env.JWT_SECRET,
    encryption: true,
  },
};

export default NextAuth(authOptions);
