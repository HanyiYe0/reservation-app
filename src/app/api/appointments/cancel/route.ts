import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Add error handling for environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: Request) {
  try {
    const { date, time_slot, user_email } = await request.json();

    console.log('Cancelling appointment:', { date, time_slot, user_email });

    // First, let's check all appointments for this user to debug
    const { data: userAppointments, error: userApptError } = await supabase
      .from('appointments')
      .select(`
        *,
        users (
          email
        )
      `)
      .eq('users.email', user_email);

    console.log('All user appointments:', userAppointments);
    
    if (userApptError) {
      console.error('Error fetching user appointments:', userApptError);
    }

    // Now try to find the specific appointment
    const { data: appointment, error: findError } = await supabase
      .from('appointments')
      .select(`
        *,
        users (
          email
        )
      `)
      .eq('date', date)
      .eq('time_slot', time_slot)
      .eq('users.email', user_email)
      .single();

    console.log('Found appointment:', appointment);
    console.log('Find error:', findError);

    if (findError || !appointment) {
      return NextResponse.json(
        { 
          error: 'Appointment not found',
          details: {
            searchCriteria: { date, time_slot, user_email },
            errorDetails: findError
          }
        },
        { status: 404 }
      );
    }

    // Update the appointment status to cancelled
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', appointment.id)
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to cancel appointment', details: updateError },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      message: 'Appointment cancelled successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
} 