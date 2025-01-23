import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client with anon key for public access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: barbers, error } = await supabase
      .from('barbers')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching barbers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch barbers' },
        { status: 500 }
      );
    }

    return NextResponse.json(barbers);
  } catch (error) {
    console.error('Error in barbers API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 