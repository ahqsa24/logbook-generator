import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH: Update comment (for likes)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { likes } = body;
        const { id } = await params;

        if (likes === undefined) {
            return NextResponse.json(
                { success: false, error: 'Likes count is required' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('comments')
            .update({ likes })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, comment: data });
    } catch (error) {
        console.error('Error updating comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update comment' },
            { status: 500 }
        );
    }
}

// DELETE: Delete a comment
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // First delete all replies
        await supabase.from('replies').delete().eq('comment_id', id);

        // Then delete the comment
        const { error } = await supabase.from('comments').delete().eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
