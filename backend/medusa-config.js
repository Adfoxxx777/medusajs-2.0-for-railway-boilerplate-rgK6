import { loadEnv, Modules, defineConfig } from '@medusajs/utils';
import {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  WORKER_MODE,
  SENDPULSE_SMTP_HOST,
  SENDPULSE_SMTP_PORT,
  SENDPULSE_SMTP_USER,
  SENDPULSE_SMTP_PASS,
  SENDPULSE_FROM_EMAIL
} from "./src/lib/constants";

loadEnv(process.env.NODE_ENV, process.cwd());

const medusaConfig = {
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: true,
    redisUrl: REDIS_URL,
    workerMode: 'shared', // Устанавливаем режим shared для обработки событий
    http: {
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      storeCors: STORE_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET
    }
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-s3",
            id: "spaces",
            options: {
              file_url: process.env.SPACE_URL,
              access_key_id: process.env.SPACE_ACCESS_KEY_ID,
              secret_access_key: process.env.SPACE_SECRET_ACCESS_KEY,
              region: process.env.SPACE_REGION,
              bucket: process.env.SPACE_BUCKET,
              endpoint: process.env.SPACE_ENDPOINT
            },
          },
        ],
      },
    },
    // Настройка EventBus для обработки событий
    {
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-local', // Используем локальный event bus для разработки
      options: {
        subscriberLogging: true // Включаем логирование для subscriber'ов
      }
    },
    // Настройка модуля уведомлений
    {
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [
          {
            resolve: './src/modules/email-notifications',
            id: 'sendpulse',
            options: {
              channels: ['email'],
              smtp_host: SENDPULSE_SMTP_HOST,
              smtp_port: SENDPULSE_SMTP_PORT,
              smtp_user: SENDPULSE_SMTP_USER,
              smtp_password: SENDPULSE_SMTP_PASS,
              from_email: SENDPULSE_FROM_EMAIL,
            },
          }
        ]
      }
    }
  ],
  plugins: [],
  featureFlags: {
    medusa_v2: true
  }
};

export default defineConfig(medusaConfig);
