import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me';
const SALT_ROUNDS = 12;

export interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}

export function validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];

    if (password.length < 12) {
        errors.push('Password must be at least 12 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('Password must contain at least one special character');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function generateSessionToken(): string {
    return uuidv4() + '-' + uuidv4();
}

export function generateJWT(userId: string, sessionId: string): string {
    return jwt.sign(
        { userId, sessionId },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
}

export function verifyJWT(token: string): { userId: string; sessionId: string } | null {
    try {
        return jwt.verify(token, JWT_SECRET) as { userId: string; sessionId: string };
    } catch {
        return null;
    }
}

export async function createSession(userId: string): Promise<{ token: string; sessionId: string }> {
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const session = await prisma.session.create({
        data: {
            userId,
            token: sessionToken,
            expiresAt,
        },
    });

    const jwtToken = generateJWT(userId, session.id);

    return { token: jwtToken, sessionId: session.id };
}

export async function validateSession(jwtToken: string): Promise<{ userId: string; sessionId: string } | null> {
    const payload = verifyJWT(jwtToken);
    if (!payload) return null;

    const session = await prisma.session.findUnique({
        where: { id: payload.sessionId },
    });

    if (!session || session.expiresAt < new Date()) {
        return null;
    }

    return payload;
}

export async function invalidateSession(sessionId: string): Promise<void> {
    await prisma.session.delete({
        where: { id: sessionId },
    }).catch(() => { });
}

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.substring(7);
    const session = await validateSession(token);
    return session?.userId || null;
}
