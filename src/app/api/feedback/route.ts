import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/services/auth.service';

export async function POST(request: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(request);

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { rating, category, message } = body;

        // Validate required fields
        if (!rating || !category || !message) {
            return NextResponse.json(
                { error: 'Rating, category, and message are required' },
                { status: 400 }
            );
        }

        // Validate rating
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating must be a number between 1 and 5' },
                { status: 400 }
            );
        }

        // Validate category
        const validCategories = ['suggestion', 'bug', 'feature', 'other'];
        if (!validCategories.includes(category)) {
            return NextResponse.json(
                { error: `Category must be one of: ${validCategories.join(', ')}` },
                { status: 400 }
            );
        }

        // Validate message length
        if (message.length < 10 || message.length > 2000) {
            return NextResponse.json(
                { error: 'Message must be between 10 and 2000 characters' },
                { status: 400 }
            );
        }

        const feedback = await prisma.feedback.create({
            data: {
                userId,
                rating,
                category,
                message,
            },
        });

        return NextResponse.json({
            message: 'Feedback submitted successfully',
            feedback: {
                id: feedback.id,
                rating: feedback.rating,
                category: feedback.category,
                createdAt: feedback.createdAt,
            },
        });
    } catch (error) {
        console.error('Feedback submission error:', error);
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

        const feedbacks = await prisma.feedback.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                rating: true,
                category: true,
                message: true,
                createdAt: true,
            },
        });

        return NextResponse.json({ feedbacks });
    } catch (error) {
        console.error('Get feedback error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
