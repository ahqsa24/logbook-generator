import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE: Delete a reply
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; replyId: string }> }
) {
    try {
        const { replyId } = await params;

        const { error } = await supabase
            .from('replies')
            .delete()
            .eq('id', replyId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting reply:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to delete reply' },
            { status: 500 }
        );
    }
}
