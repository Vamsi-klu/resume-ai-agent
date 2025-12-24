import {
    validateFile,
    isDocumentFile,
    isImageFile,
    ALLOWED_FILE_TYPES,
} from '@/lib/services/file.service';

// Mock File object for testing
const createMockFile = (name: string, size: number, type: string): File => {
    const file = new File([''], name, { type });
    Object.defineProperty(file, 'size', { value: size });
    return file;
};

describe('File Service', () => {
    describe('validateFile', () => {
        it('should accept valid PDF files', () => {
            const file = createMockFile('resume.pdf', 1024 * 1024, 'application/pdf');
            const result = validateFile(file);
            expect(result.isValid).toBe(true);
        });

        it('should accept valid Word documents', () => {
            const file = createMockFile(
                'resume.docx',
                1024 * 1024,
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            );
            const result = validateFile(file);
            expect(result.isValid).toBe(true);
        });

        it('should accept valid image files', () => {
            const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
            imageTypes.forEach(type => {
                const file = createMockFile('image.jpg', 1024 * 1024, type);
                const result = validateFile(file);
                expect(result.isValid).toBe(true);
            });
        });

        it('should reject files larger than max size', () => {
            const file = createMockFile('large.pdf', 15 * 1024 * 1024, 'application/pdf');
            const result = validateFile(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('exceeds maximum');
        });

        it('should reject unsupported file types', () => {
            const file = createMockFile('script.exe', 1024, 'application/x-msdownload');
            const result = validateFile(file);
            expect(result.isValid).toBe(false);
            expect(result.error).toContain('not allowed');
        });

        it('should reject text files (not supported)', () => {
            const file = createMockFile('notes.txt', 1024, 'text/plain');
            const result = validateFile(file);
            expect(result.isValid).toBe(false);
        });
    });

    describe('isDocumentFile', () => {
        it('should return true for PDF files', () => {
            expect(isDocumentFile('application/pdf')).toBe(true);
        });

        it('should return true for Word documents', () => {
            expect(isDocumentFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(true);
            expect(isDocumentFile('application/msword')).toBe(true);
        });

        it('should return false for image files', () => {
            expect(isDocumentFile('image/png')).toBe(false);
            expect(isDocumentFile('image/jpeg')).toBe(false);
        });
    });

    describe('isImageFile', () => {
        it('should return true for image files', () => {
            expect(isImageFile('image/png')).toBe(true);
            expect(isImageFile('image/jpeg')).toBe(true);
            expect(isImageFile('image/webp')).toBe(true);
        });

        it('should return false for document files', () => {
            expect(isImageFile('application/pdf')).toBe(false);
            expect(isImageFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document')).toBe(false);
        });
    });

    describe('ALLOWED_FILE_TYPES', () => {
        it('should have all expected file types', () => {
            expect(ALLOWED_FILE_TYPES).toHaveProperty('application/pdf');
            expect(ALLOWED_FILE_TYPES).toHaveProperty('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            expect(ALLOWED_FILE_TYPES).toHaveProperty('image/png');
            expect(ALLOWED_FILE_TYPES).toHaveProperty('image/jpeg');
            expect(ALLOWED_FILE_TYPES).toHaveProperty('image/webp');
        });

        it('should map to correct extensions', () => {
            expect(ALLOWED_FILE_TYPES['application/pdf']).toBe('.pdf');
            expect(ALLOWED_FILE_TYPES['image/png']).toBe('.png');
        });
    });
});
