import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST() {
  try {
    const { data, error } = await supabase
      .rpc('cleanup_past_appointments');

    if (error) {
      console.error('Error running cleanup:', error);
      return NextResponse.json(
        { error: 'Failed to run cleanup' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Cleanup completed successfully'
    });
  } catch (error) {
    console.error('Error in cleanup API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 