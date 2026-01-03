import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// PATCH: Update comment (for likes)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { likes, is_pinned, pinned_at } = body;
        const { id } = await params;

        // Validate that at least one field is being updated
        if (likes === undefined && is_pinned === undefined) {
            return NextResponse.json(
                { success: false, error: 'At least one field (likes or is_pinned) is required' },
                { status: 400 }
            );
        }

        // If pinning, check max 3 limit
        if (is_pinned === true) {
            const { data: pinnedComments } = await supabase
                .from('comments')
                .select('id')
                .eq('is_pinned', true);

            if (pinnedComments && pinnedComments.length >= 3 && !pinnedComments.some(c => c.id === id)) {
                return NextResponse.json(
                    { success: false, error: 'Maximum 3 comments can be pinned' },
                    { status: 400 }
                );
            }
        }

        // Build update object
        const updateData: any = {};
        if (likes !== undefined) updateData.likes = likes;
        if (is_pinned !== undefined) {
            updateData.is_pinned = is_pinned;
            updateData.pinned_at = is_pinned ? (pinned_at || new Date().toISOString()) : null;
        }

        const { data, error } = await supabase
            .from('comments')
            .update(updateData)
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
