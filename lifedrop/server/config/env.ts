import 'dotenv/config';

function need(key: string): string {
  const v = process.env[key];
  if (!v) {
    console.error(`\n[LifeDrop API] Missing environment variable ${key}. Copy .env.example to .env and fill it in.\n`);
    process.exit(1);
  }
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  supabaseUrl: need('SUPABASE_URL'),
  serviceKey: need('SUPABASE_SERVICE_ROLE_KEY'),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
};
