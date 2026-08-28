import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_32chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10),
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    user: process.env.SMTP_USER || 'aw419770@gmail.com',
    pass: process.env.SMTP_PASS || 'eqqoknioltpwsyxr',
    from: process.env.EMAIL_FROM || '"BitBlog Digital Publication" <aw419770@gmail.com>',
  },
  db: {
    user: process.env.DB_USER || 'bitblog_user',
    password: process.env.DB_PASSWORD || 'your_secure_password',
    connectString: process.env.DB_CONNECTION_STRING || process.env.DB_CONNECT_STRING || 'localhost:1521/XEPDB1',
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
  },
};
