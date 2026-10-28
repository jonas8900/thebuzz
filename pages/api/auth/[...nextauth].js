import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { RateLimiterMemory } from "rate-limiter-flexible";
import dbConnect from "../../../db/connect";
import User from "../../../db/models/User";
import Temporaryuser from "../../../db/models/Temporaryuser";
import { normalizeEmail } from "@/lib/normalizeInput";
import { getClientIpFromReq } from "@/lib/hashIp";

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
        const ip = getClientIpFromReq(req);

        if (!credentials?.email || !credentials?.password) {
          throw new Error("Bitte gib sowohl E-Mail als auch Passwort ein.");
        }

        try {
          await rateLimiter.consume(ip);
        } catch {
          throw new Error(
            "Zu viele Anmeldeversuche. Bitte warte 5 Minuten und versuche es erneut."
          );
        }

        await dbConnect();

        const email = normalizeEmail(credentials.email);
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("Ungültige E-Mail-Adresse oder falsches Passwort.");
        }

        const isValid = await user.comparePassword(credentials.password);
        if (!isValid) {
          throw new Error("Ungültige E-Mail-Adresse oder falsches Passwort.");
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
    CredentialsProvider({
      id: "guest",
      name: "Gastzugang",
      credentials: {
        username: { label: "Username", type: "text" },
        gameId: { label: "Game ID", type: "text" },
      },
      async authorize(credentials) {
        try {
          const username = credentials?.username?.trim();
          const gameId = credentials?.gameId;

          if (!username || !gameId) {
            throw new Error("Benutzername und Spiel-ID sind erforderlich.");
          }

          await dbConnect();

          // Scope temporary user lookup to the specific game to avoid cross-game collisions
          let tempUser = await Temporaryuser.findOne({ username, yourgame: gameId });
          if (!tempUser) {
            tempUser = await Temporaryuser.create({ username, yourgame: gameId });
          }

          return {
            id: tempUser._id.toString(),
            username: tempUser.username,
            role: "guest",
            gameId: tempUser.yourgame.toString(),
          };
        } catch (error) {
          console.error("Guest login error:", error);
          throw new Error("Fehler beim Beitritt als Gast.");
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || account.provider === "credentials" || account.provider === "guest") {
        return !!user;
      }

      if (account.provider === "google") {
        await dbConnect();

        const email = profile?.email?.toLowerCase();
        if (!email) return false;

        const baseUsername = (profile?.name || email.split("@")[0] || "user")
          .toLowerCase()
          .replace(/\s+/g, "_");

        let dbUser = await User.findOne({ email });
        if (!dbUser) {
          // Ensure generated username is unique if another user already has the same baseUsername
          let uniqueUsername = baseUsername;
          const usernameTaken = await User.exists({ username: uniqueUsername });
          if (usernameTaken) {
            uniqueUsername = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
          }

          dbUser = await User.create({
            email,
            name: profile?.name || baseUsername,
            username: uniqueUsername,
            role: "user",
            image: profile?.picture || null,
            provider: "google",
          });
        } else {
          const update = {};
          if (!dbUser.name && profile?.name) update.name = profile.name;
          if (!dbUser.image && profile?.picture) update.image = profile.picture;
          if (Object.keys(update).length) {
            await User.updateOne({ _id: dbUser._id }, { $set: update });
            Object.assign(dbUser, update);
          }
        }

        user.id = dbUser._id.toString();
        user.email = dbUser.email;
        user.name = dbUser.name;
        user.username = dbUser.username;
        user.role = dbUser.role;

        return true;
      }

      return true;
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.username = user.username;
        token.gameId = user.gameId;

        if (account?.provider === "google") {
          token.provider = "google";
          token.accessToken = account.access_token;
          token.idToken = account.id_token;
          if (account.refresh_token) token.refreshToken = account.refresh_token;
          token.accessTokenExpires = account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 60 * 60 * 1000;
        }
      }

      if (
        token.provider === "google" &&
        token.accessTokenExpires &&
        Date.now() > token.accessTokenExpires &&
        token.refreshToken
      ) {
        try {
          const params = new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: String(token.refreshToken),
          });

          const res = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params.toString(),
          });

          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Failed to refresh token");

          token.accessToken = data.access_token;
          token.accessTokenExpires = Date.now() + data.expires_in * 1000;
        } catch {
          delete token.accessToken;
          delete token.accessTokenExpires;
          delete token.refreshToken;
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.user.email = token.email;
      session.user.role = token.role;
      session.user.username = token.username;
      session.user.name = token.name;
      session.user.gameId = token.gameId;
      session.user.isGuest = token.role === "guest";

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
