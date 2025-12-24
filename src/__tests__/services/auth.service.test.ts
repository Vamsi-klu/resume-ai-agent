import {
    validatePassword,
    validateEmail,
    hashPassword,
    verifyPassword,
    generateSessionToken,
} from '@/lib/services/auth.service';

describe('Auth Service', () => {
    describe('validatePassword', () => {
        it('should reject passwords shorter than 12 characters', () => {
            const result = validatePassword('Short1!');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must be at least 12 characters long');
        });

        it('should reject passwords without uppercase letters', () => {
            const result = validatePassword('lowercaseonly123!');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one uppercase letter');
        });

        it('should reject passwords without lowercase letters', () => {
            const result = validatePassword('UPPERCASEONLY123!');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one lowercase letter');
        });

        it('should reject passwords without numbers', () => {
            const result = validatePassword('NoNumbersHere!!!');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one number');
        });

        it('should reject passwords without special characters', () => {
            const result = validatePassword('NoSpecialChars123');
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain('Password must contain at least one special character');
        });

        it('should accept valid strong passwords', () => {
            const result = validatePassword('StrongPass123!@#');
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it('should accept passwords with various special characters', () => {
            const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'];
            specialChars.forEach(char => {
                const result = validatePassword(`StrongPass123${char}`);
                expect(result.isValid).toBe(true);
            });
        });

        it('should return multiple errors for very weak passwords', () => {
            const result = validatePassword('weak');
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1);
        });
    });

    describe('validateEmail', () => {
        it('should accept valid email addresses', () => {
            expect(validateEmail('test@example.com')).toBe(true);
            expect(validateEmail('user.name@domain.co.uk')).toBe(true);
            expect(validateEmail('user+tag@gmail.com')).toBe(true);
        });

        it('should reject invalid email addresses', () => {
            expect(validateEmail('notanemail')).toBe(false);
            expect(validateEmail('missing@domain')).toBe(false);
            expect(validateEmail('@nodomain.com')).toBe(false);
            expect(validateEmail('spaces in@email.com')).toBe(false);
        });
    });

    describe('hashPassword and verifyPassword', () => {
        it('should hash password and verify correctly', async () => {
            const password = 'TestPassword123!';
            const hash = await hashPassword(password);

            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);

            const isValid = await verifyPassword(password, hash);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const password = 'CorrectPassword123!';
            const wrongPassword = 'WrongPassword123!';
            const hash = await hashPassword(password);

            const isValid = await verifyPassword(wrongPassword, hash);
            expect(isValid).toBe(false);
        });

        it('should generate different hashes for same password', async () => {
            const password = 'SamePassword123!';
            const hash1 = await hashPassword(password);
            const hash2 = await hashPassword(password);

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('generateSessionToken', () => {
        it('should generate unique tokens', () => {
            const token1 = generateSessionToken();
            const token2 = generateSessionToken();

            expect(token1).not.toBe(token2);
        });

        it('should generate tokens with expected format', () => {
            const token = generateSessionToken();

            // UUID-UUID format
            expect(token).toMatch(/^[a-f0-9-]+-[a-f0-9-]+$/);
        });
    });
});
