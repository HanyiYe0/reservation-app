import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    // Get user email from URL
    const { searchParams } = new URL(request.url);
    const userEmail = searchParams.get('email');

    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // First get the user ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', userEmail)
      .single();

    if (userError || !userData) {
      console.error('Error finding user:', userError);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Then fetch all future appointments for the user
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        date,
        time_slot,
        status,
        barbers (
          id,
          name,
          profile_picture
        ),
        users (
          id,
          name,
          email
        )
      `)
      .eq('user_id', userData.id)
      .gte('date', new Date().toISOString().split('T')[0])
      .eq('status', 'booked')
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching user appointments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch appointments' },
        { status: 500 }
      );
    }

    console.log('Fetched appointments:', appointments);
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error in get user appointments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 