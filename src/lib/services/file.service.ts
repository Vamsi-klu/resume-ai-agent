import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10) * 1024 * 1024;

export const ALLOWED_FILE_TYPES = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'application/msword': '.doc',
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
};

export type AllowedMimeType = keyof typeof ALLOWED_FILE_TYPES;

export interface FileValidationResult {
    isValid: boolean;
    error?: string;
}

export function validateFile(file: File): FileValidationResult {
    if (file.size > MAX_FILE_SIZE) {
        return {
            isValid: false,
            error: `File size exceeds maximum of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        };
    }

    if (!Object.keys(ALLOWED_FILE_TYPES).includes(file.type)) {
        return {
            isValid: false,
            error: `File type ${file.type} is not allowed. Allowed types: PDF, DOCX, PNG, JPG, WEBP`,
        };
    }

    return { isValid: true };
}

export async function saveFile(file: File, userId: string): Promise<{ filePath: string; fileName: string }> {
    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const userDir = path.join(UPLOAD_DIR, userId);
    if (!existsSync(userDir)) {
        await mkdir(userDir, { recursive: true });
    }

    const ext = ALLOWED_FILE_TYPES[file.type as AllowedMimeType] || '';
    const timestamp = Date.now();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${safeFileName}`;
    const filePath = path.join(userDir, fileName);

    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    return { filePath, fileName };
}

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
    try {
        // Use require for CommonJS module
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(buffer);
        return data.text;
    } catch (error) {
        console.error('Error parsing PDF:', error);
        throw new Error('Failed to extract text from PDF');
    }
}

export async function extractTextFromWord(buffer: Buffer): Promise<string> {
    try {
        // Use require for CommonJS module
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (error) {
        console.error('Error parsing Word document:', error);
        throw new Error('Failed to extract text from Word document');
    }
}

export async function extractTextFromFile(file: File): Promise<string> {
    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.type === 'application/pdf') {
        return extractTextFromPDF(buffer);
    }

    if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword'
    ) {
        return extractTextFromWord(buffer);
    }

    // For images, we would need OCR - for now return placeholder
    if (file.type.startsWith('image/')) {
        return '[Image file - OCR extraction would be needed]';
    }

    throw new Error(`Cannot extract text from file type: ${file.type}`);
}

export function isDocumentFile(mimeType: string): boolean {
    return mimeType === 'application/pdf' ||
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword';
}

export function isImageFile(mimeType: string): boolean {
    return mimeType.startsWith('image/');
}
