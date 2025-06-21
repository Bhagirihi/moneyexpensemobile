import "dotenv/config";
export default {
  expo: {
    name: "Trivense",
    slug: "Trivense",
    version: "1.0.0",
    extra: {
      eas: {
        projectId: "373dac47-60b0-4de3-8dfc-aea74ec58784",
      },
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    },
  },
};
