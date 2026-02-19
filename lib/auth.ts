import { betterAuth } from "better-auth";

export const auth = betterAuth({
  appName: "preffer.me",
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
});
