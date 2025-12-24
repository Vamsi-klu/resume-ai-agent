import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/services/auth.service';
import {
    validateFile,
    saveFile,
    extractTextFromFile,
    isDocumentFile,
    isImageFile,
    ALLOWED_FILE_TYPES,
} from '@/lib/services/file.service';

const MAX_IMAGES = 6;

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Validate file types and count
        const documentFiles = files.filter(f => isDocumentFile(f.type));
        const imageFiles = files.filter(f => isImageFile(f.type));

        if (documentFiles.length > 1) {
            return NextResponse.json(
                { error: 'Only one document file (PDF/Word) is allowed at a time' },
                { status: 400 }
            );
        }

        if (imageFiles.length > MAX_IMAGES) {
            return NextResponse.json(
                { error: `Maximum ${MAX_IMAGES} images allowed` },
                { status: 400 }
            );
        }

        // Validate each file
        for (const file of files) {
            const validation = validateFile(file);
            if (!validation.isValid) {
                return NextResponse.json(
                    { error: validation.error },
                    { status: 400 }
                );
            }
        }

        const uploadedFiles = [];
        let combinedText = '';

        for (const file of files) {
            // Save file
            const { filePath, fileName } = await saveFile(file, userId);

            // Extract text if possible
            let extractedText = '';
            try {
                extractedText = await extractTextFromFile(file);
                combinedText += extractedText + '\n\n';
            } catch (error) {
                console.error('Error extracting text:', error);
            }

            // Create resume record
            const resume = await prisma.resume.create({
                data: {
                    userId,
                    fileName,
                    fileType: file.type,
                    filePath,
                    fileSize: file.size,
                    extractedText: extractedText || null,
                },
            });

            uploadedFiles.push({
                id: resume.id,
                fileName: resume.fileName,
                fileType: resume.fileType,
                fileSize: resume.fileSize,
                hasExtractedText: !!extractedText,
            });
        }

        return NextResponse.json({
            message: 'Files uploaded successfully',
            files: uploadedFiles,
            extractedText: combinedText.trim() || null,
        });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const resumes = await prisma.resume.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                fileName: true,
                fileType: true,
                fileSize: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ resumes });
    } catch (error) {
        console.error('Get resumes error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
