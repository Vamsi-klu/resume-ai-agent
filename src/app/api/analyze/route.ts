import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/services/auth.service';
import { checkRateLimit, recordQuery } from '@/lib/services/ratelimit.service';
import { analyzeResume, GeminiModel, getAvailableModels } from '@/lib/services/ai.service';

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Check rate limit
        const rateLimitStatus = await checkRateLimit(userId);
        if (!rateLimitStatus.allowed) {
            return NextResponse.json(
                {
                    error: 'Rate limit exceeded',
                    message: `You have used all ${5} queries for the 24-hour period. Reset at: ${rateLimitStatus.resetAt.toISOString()}`,
                    rateLimit: rateLimitStatus,
                },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { resumeId, resumeText, jobDescription, model = 'gemini-1.5-flash' } = body;

        // Validate required fields
        if (!jobDescription) {
            return NextResponse.json(
                { error: 'Job description is required' },
                { status: 400 }
            );
        }

        // Get resume text
        let finalResumeText = resumeText;

        if (resumeId && !resumeText) {
            const resume = await prisma.resume.findFirst({
                where: { id: resumeId, userId },
            });

            if (!resume) {
                return NextResponse.json(
                    { error: 'Resume not found' },
                    { status: 404 }
                );
            }

            if (!resume.extractedText) {
                return NextResponse.json(
                    { error: 'Resume has no extracted text. Please upload a text-based resume.' },
                    { status: 400 }
                );
            }

            finalResumeText = resume.extractedText;
        }

        if (!finalResumeText) {
            return NextResponse.json(
                { error: 'Resume text is required. Either provide resumeText or resumeId.' },
                { status: 400 }
            );
        }

        // Validate model
        const validModels: GeminiModel[] = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash-exp'];
        if (!validModels.includes(model)) {
            return NextResponse.json(
                { error: `Invalid model. Valid options: ${validModels.join(', ')}` },
                { status: 400 }
            );
        }

        // Perform analysis
        const analysisResult = await analyzeResume(finalResumeText, jobDescription, model);

        // Record the query for rate limiting
        await recordQuery(userId);

        // Save analysis to database
        const analysis = await prisma.analysis.create({
            data: {
                userId,
                resumeId: resumeId || 'direct-text',
                jobDescription,
                model,
                matchPercentage: analysisResult.matchPercentage,
                insights: JSON.parse(JSON.stringify(analysisResult)),
                recommendations: JSON.parse(JSON.stringify(analysisResult.recommendations)),
                rawResponse: JSON.stringify(analysisResult),
            },
        });

        // Get updated rate limit
        const updatedRateLimit = await checkRateLimit(userId);

        return NextResponse.json({
            id: analysis.id,
            analysis: analysisResult,
            model,
            rateLimit: updatedRateLimit,
            createdAt: analysis.createdAt,
        });
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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

        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10', 10);

        const analyses = await prisma.analysis.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            select: {
                id: true,
                model: true,
                matchPercentage: true,
                createdAt: true,
                jobDescription: true,
            },
        });

        return NextResponse.json({ analyses });
    } catch (error) {
        console.error('Get analyses error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// Get available models
export async function OPTIONS() {
    return NextResponse.json({
        models: getAvailableModels(),
    });
}
