import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST: Create a new reply
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { name, comment } = body;
        const { id: commentId } = await params;

        if (!name || !comment) {
            return NextResponse.json(
                { success: false, error: 'Name and comment are required' },
                { status: 400 }
            );
        }

        const newReply = {
            comment_id: commentId,
            name: name.trim(),
            comment: comment.trim(),
            timestamp: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('replies')
            .insert([newReply])
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, reply: data });
    } catch (error) {
        console.error('Error creating reply:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to create reply' },
            { status: 500 }
        );
    }
}
