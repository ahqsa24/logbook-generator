import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET: Fetch all comments with their replies
export async function GET() {
    try {
        // Fetch comments
        const { data: comments, error: commentsError } = await supabase
            .from('comments')
            .select('*')
            .order('created_at', { ascending: false });

        if (commentsError) throw commentsError;

        // Fetch all replies
        const { data: replies, error: repliesError } = await supabase
            .from('replies')
            .select('*')
            .order('created_at', { ascending: true });

        if (repliesError) throw repliesError;

        // Group replies by comment_id
        const commentsWithReplies = comments?.map(comment => ({
            ...comment,
            timestamp: new Date(comment.timestamp),
            replies: replies?.filter(reply => reply.comment_id === comment.id).map(reply => ({
                ...reply,
                timestamp: new Date(reply.timestamp)
            })) || []
        })) || [];

        return NextResponse.json({ success: true, comments: commentsWithReplies });
    } catch (error) {
        console.error('Error fetching comments:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch comments' },
            { status: 500 }
        );
    }
}

// POST: Create a new comment
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, comment } = body;

        if (!name || !comment) {
            return NextResponse.json(
                { success: false, error: 'Name and comment are required' },
                { status: 400 }
            );
        }

        const newComment = {
            name: name.trim(),
            comment: comment.trim(),
            timestamp: new Date().toISOString(),
            likes: 0
        };

        const { data, error } = await supabase
            .from('comments')
            .insert([newComment])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, comment: data });
    } catch (error) {
        console.error('Error creating comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create comment' },
            { status: 500 }
        );
    }
}
