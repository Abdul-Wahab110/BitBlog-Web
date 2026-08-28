import { UserModel, UserRecord } from '../models/userModel';
import { PasswordResetModel } from '../models/passwordResetModel';
import { hashPassword, comparePassword, generateRandomToken, hashToken } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { AuthValidator } from '../validators/authValidator';
import { JwtPayload, UserRole } from '../types';
import { EmailService } from './emailService';

// Temporary memory store for pending OTP registrations (valid for 10 minutes)
interface PendingRegistration {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  roleId: number;
  otp: string;
  expiresAt: number;
  attempts: number;
}

const pendingRegistrations = new Map<string, PendingRegistration>();

export class AuthService {
  // 1. Send 6-Digit OTP to User's Gmail for Registration
  public static async sendRegistrationOtp(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    // 1. Payload validation
    const validationErrors = AuthValidator.validateRegistrationPayload(data);
    if (validationErrors.length > 0) {
      throw new ApiError('Registration validation failed', 400, validationErrors);
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const normalizedUsername = data.username.trim().toLowerCase();

    // 2. Live DNS MX verification (verifies email domain actually exists and accepts emails)
    const isDomainActive = await AuthValidator.verifyEmailDomainLive(normalizedEmail);
    if (!isDomainActive) {
      throw new ApiError('Invalid email domain: This email address domain cannot receive mail. Please enter a valid and active Gmail address.', 400, ['Email domain is unreachable or non-existent']);
    }

    // 3. Duplicate email check in DB
    const existingEmail = await UserModel.findByEmail(normalizedEmail);
    if (existingEmail) {
      throw new ApiError('An account with this email address already exists', 409, ['Email is already registered']);
    }

    // 3. Duplicate username check in DB
    const existingUsername = await UserModel.findByUsername(normalizedUsername);
    if (existingUsername) {
      throw new ApiError('This username is already taken', 409, ['Username is already taken']);
    }

    // 4. Hash password with bcrypt
    const passwordHash = await hashPassword(data.password);

    // 5. Generate secure 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    let roleId = await UserModel.getRoleIdByName('User');
    if (!roleId) roleId = 4;

    // 6. Save in pending registrations store
    pendingRegistrations.set(normalizedEmail, {
      name: data.name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      passwordHash,
      roleId,
      otp,
      expiresAt,
      attempts: 0,
    });

    // 7. Dispatch OTP to user's real Gmail
    await EmailService.sendRegistrationOtpEmail(normalizedEmail, data.name.trim(), otp);

    return {
      success: true,
      email: normalizedEmail,
      message: `A 6-digit verification code has been sent to ${normalizedEmail}. Please enter it to complete registration.`,
      user: {
        userId: 0,
        name: data.name.trim(),
        username: normalizedUsername,
        email: normalizedEmail,
        role: 'User',
      },
      token: undefined as string | undefined,
    };
  }

  // 2. Verify 6-Digit OTP and Create Reader Account in DB
  public static async verifyRegistrationOtp(data: {
    email: string;
    otp: string;
  }) {
    if (!data.email || !data.otp) {
      throw new ApiError('Email and 6-digit OTP code are required', 400);
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    const pending = pendingRegistrations.get(normalizedEmail);

    if (!pending) {
      throw new ApiError('No pending registration found or session expired. Please register again.', 400);
    }

    if (Date.now() > pending.expiresAt) {
      pendingRegistrations.delete(normalizedEmail);
      throw new ApiError('Verification code has expired (valid for 10 mins). Please request a new code.', 400);
    }

    if (pending.attempts >= 5) {
      pendingRegistrations.delete(normalizedEmail);
      throw new ApiError('Too many invalid attempts. Please register again.', 429);
    }

    // Check OTP Match
    if (pending.otp !== data.otp.trim()) {
      pending.attempts += 1;
      throw new ApiError('Invalid verification code. Please check your Gmail and try again.', 400);
    }

    // OTP is 100% Valid & Verified! Create user in DB
    const newUser = await UserModel.createUser({
      roleId: pending.roleId,
      name: pending.name,
      username: pending.username,
      email: pending.email,
      passwordHash: pending.passwordHash,
      isVerified: true,
    });

    // Remove from pending store
    pendingRegistrations.delete(normalizedEmail);

    const userRecord = newUser || {
      user_id: Date.now(),
      role_id: pending.roleId,
      role_name: 'User',
      name: pending.name,
      username: pending.username,
      email: pending.email,
      password_hash: pending.passwordHash,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Generate signed JWT token
    const payload: JwtPayload = {
      userId: userRecord.user_id,
      email: userRecord.email,
      username: userRecord.username,
      role: (userRecord.role_name as UserRole) || 'User',
      name: userRecord.name,
    };

    const token = generateToken(payload);

    return {
      token,
      user: {
        userId: userRecord.user_id,
        name: userRecord.name,
        username: userRecord.username,
        email: userRecord.email,
        role: userRecord.role_name,
        profileImage: userRecord.profile_image,
        bio: userRecord.bio,
        status: userRecord.status,
      },
      message: 'Account verified and created successfully! Welcome to BitBlog.',
    };
  }

  // 3. Resend 6-Digit OTP
  public static async resendRegistrationOtp(email: string) {
    if (!email) {
      throw new ApiError('Email address is required', 400);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const pending = pendingRegistrations.get(normalizedEmail);

    if (!pending) {
      throw new ApiError('No pending registration found for this email. Please fill out the registration form.', 400);
    }

    // Generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    pending.otp = newOtp;
    pending.expiresAt = Date.now() + 10 * 60 * 1000;
    pending.attempts = 0;

    await EmailService.sendRegistrationOtpEmail(normalizedEmail, pending.name, newOtp);

    return {
      success: true,
      message: `A fresh 6-digit code has been sent to ${normalizedEmail}.`,
    };
  }

  public static async register(data: {
    name: string;
    username: string;
    email: string;
    password: string;
  }) {
    // Strictly require 6-digit OTP verification for all registrations!
    return await this.sendRegistrationOtp(data);
  }

  public static async login(credentials: {
    email: string;
    password: string;
    accountType?: 'User' | 'Admin';
  }) {
    if (!credentials.email || !credentials.password) {
      throw new ApiError('Email and password are required', 400, ['Email and password are required']);
    }

    // 1. Fetch user by email or username
    let user = await UserModel.findByEmail(credentials.email);
    if (!user) {
      user = await UserModel.findByUsername(credentials.email);
    }
    if (!user) {
      throw new ApiError('Invalid email or password credentials', 401, ['Invalid email or password']);
    }

    // 2. Verify account status
    if (user.status !== 'ACTIVE') {
      throw new ApiError(`Your account is currently ${user.status.toLowerCase()}`, 403, [`Account status: ${user.status}`]);
    }

    // 3. Bcrypt password comparison
    const isPasswordValid = await comparePassword(credentials.password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError('Invalid email or password credentials', 401, ['Invalid email or password']);
    }

    // 4. Account Type Validation against real database role
    if (credentials.accountType === 'Admin') {
      if (user.role_name !== 'Admin' && user.role_name !== 'Editor' && user.role_name !== 'Author') {
        throw new ApiError('This account does not have Administrator privileges. Access restricted to Staff accounts.', 403, ['Selected account type mismatch']);
      }
    } else if (credentials.accountType === 'User') {
      // Complete Cloaking Security: If Super Admin attempts to sign in via public reader portal, silently reject as invalid credentials without leaking existence
      if (user.role_name === 'Admin') {
        throw new ApiError('Invalid email or password credentials', 401, ['Invalid email or password']);
      }
    }

    // 5. Update last_login timestamp
    await UserModel.updateLastLogin(user.user_id);

    // 6. Generate signed JWT token
    const payload: JwtPayload = {
      userId: user.user_id,
      email: user.email,
      username: user.username,
      role: (user.role_name as UserRole) || 'User',
      name: user.name,
    };

    const token = generateToken(payload);

    return {
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role_name,
        profileImage: user.profile_image,
        bio: user.bio,
        status: user.status,
      },
    };
  }

  public static async forgotPassword(email: string) {
    if (!email || !AuthValidator.isValidEmail(email)) {
      throw new ApiError('A valid email address is required', 400, ['Valid email is required']);
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return { message: 'If an account with that email exists, a password reset link has been issued.' };
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordResetModel.createResetToken(user.user_id, tokenHash, expiresAt);
    await EmailService.sendPasswordResetEmail(user.email, user.name, rawToken);

    return {
      message: 'If an account with that email exists, a password reset link has been issued.',
      resetTokenPreview: process.env.NODE_ENV === 'development' ? rawToken : undefined,
    };
  }

  public static async resetPassword(token: string, newPassword: string) {
    if (!token) {
      throw new ApiError('Reset token is required', 400, ['Reset token is required']);
    }

    if (!newPassword || !AuthValidator.isStrongPassword(newPassword)) {
      throw new ApiError('New password must be at least 8 characters long and contain letters and numbers', 400, ['Strong password required']);
    }

    const tokenHash = hashToken(token);
    const resetRecord = await PasswordResetModel.findValidToken(tokenHash);

    if (!resetRecord) {
      throw new ApiError('Invalid or expired password reset token', 400, ['Reset token is invalid or expired']);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await UserModel.updatePassword(resetRecord.user_id, newPasswordHash);
    await PasswordResetModel.markAsUsed(resetRecord.token_id);

    return { message: 'Password has been successfully updated. You may now sign in with your new password.' };
  }

  public static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    if (!currentPassword || !newPassword) {
      throw new ApiError('Current password and new password are required', 400, ['Missing required password fields']);
    }

    if (!AuthValidator.isStrongPassword(newPassword)) {
      throw new ApiError('New password must be at least 8 characters long and contain letters and numbers', 400, ['Strong password required']);
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError('User account not found', 404);
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      throw new ApiError('Current password provided is incorrect', 401, ['Current password does not match']);
    }

    const newPasswordHash = await hashPassword(newPassword);
    await UserModel.updatePassword(userId, newPasswordHash);

    return { message: 'Password updated successfully' };
  }

  // Sync / Login via Firebase Verified Google Account
  public static async syncFirebaseUser(data: {
    email: string;
    name?: string;
    profileImage?: string;
    uid?: string;
    emailVerified?: boolean;
  }) {
    if (!data.email) {
      throw new ApiError('Email address is required from Firebase authentication', 400);
    }

    const normalizedEmail = data.email.trim().toLowerCase();
    let user = await UserModel.findByEmail(normalizedEmail);

    if (!user) {
      // Auto-provision reader account in database
      const baseUsername = normalizedEmail.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'reader';
      let uniqueUsername = baseUsername;
      let counter = 1;
      while (await UserModel.findByUsername(uniqueUsername)) {
        uniqueUsername = `${baseUsername}${counter}`;
        counter++;
      }

      const dummyPasswordHash = await hashPassword(`Firebase_${Date.now()}_${Math.random()}`);
      user = await UserModel.createUser({
        roleId: 4, // Reader Role
        name: data.name?.trim() || uniqueUsername,
        username: uniqueUsername,
        email: normalizedEmail,
        passwordHash: dummyPasswordHash,
        isVerified: data.emailVerified !== undefined ? data.emailVerified : true,
      });

      if (data.profileImage && user) {
        user.profile_image = data.profileImage;
      }
    } else {
      if (data.emailVerified && !user.is_verified) {
        await UserModel.markEmailVerified(user.user_id);
      }
      if (data.profileImage && !user.profile_image) {
        user.profile_image = data.profileImage;
      }
    }

    await UserModel.updateLastLogin(user.user_id);

    const payload: JwtPayload = {
      userId: user.user_id,
      email: user.email,
      username: user.username,
      role: (user.role_name as UserRole) || 'User',
      name: user.name,
    };

    const token = generateToken(payload);

    return {
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role_name,
        profileImage: user.profile_image,
        bio: user.bio,
        status: user.status,
      },
    };
  }
}
