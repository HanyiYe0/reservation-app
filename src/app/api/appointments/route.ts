import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to convert 12-hour format to 24-hour format
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(' ');
  let [hours, minutes] = time.split(':');
  
  let hoursNum = parseInt(hours, 10);
  
  if (modifier === 'PM' && hoursNum < 12) {
    hoursNum = hoursNum + 12;
  }
  if (modifier === 'AM' && hoursNum === 12) {
    hoursNum = 0;
  }
  
  return `${hoursNum.toString().padStart(2, '0')}:${minutes}:00`;
}

async function getOrCreateUser(clerkUserId: string, userName: string, userEmail: string) {
  // First, try to find the user
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', userEmail)
    .single();

  if (existingUser) {
    return existingUser.id;
  }

  // If user doesn't exist, create them
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert([
      {
        name: userName,
        email: userEmail,
        password: 'oauth_user', // Since they're using Clerk, we don't need a real password
      }
    ])
    .select('id')
    .single();

  if (createError) {
    throw new Error(`Failed to create user: ${createError.message}`);
  }

  return newUser.id;
}

export async function POST(request: Request) {
  try {
    const { userId: clerkUserId, barberId, date, timeSlot, userName, userEmail } = await request.json();

    // Validate required fields
    if (!clerkUserId || !barberId || !date || !timeSlot || !userName || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get or create the user in our database
    const userId = await getOrCreateUser(clerkUserId, userName, userEmail);

    // Convert time from 12-hour to 24-hour format
    const formattedTime = convertTo24Hour(timeSlot);
    console.log('Converted time:', { original: timeSlot, formatted: formattedTime });

    // Create the appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: userId,
          barber_id: barberId,
          date: date,
          time_slot: formattedTime,
          status: 'booked'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating appointment:', error);
      return NextResponse.json(
        { error: 'Failed to create appointment' },
        { status: 500 }
      );
    }

    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error in appointments API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 