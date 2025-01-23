import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { createClient } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function addUserToDatabase(id: string, email: string, name: string) {
  try {
    // First check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select()
      .eq('clerk_id', id)
      .single();

    if (existingUser) {
      console.log('User already exists:', existingUser);
      return existingUser;
    }

    // Get the next ID from the sequence
    const { data: seqData, error: seqError } = await supabase
      .rpc('get_next_id', { seq_name: 'users_id_seq' });

    if (seqError) {
      console.error('Error getting next sequence value:', seqError);
      throw seqError;
    }

    const nextId = seqData;
    console.log('Next ID from sequence:', nextId);

    // Insert new user if they don't exist
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: nextId,
          clerk_id: id,
          name: name,
          email: email,
          phone: null, // Explicitly set phone to null since it's optional
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting user:', error);
      throw error;
    }

    console.log('Successfully added user to database:', data);
    return data;
  } catch (error) {
    console.error('Error in addUserToDatabase:', error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  // Get the headers from the request directly
  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error('Missing svix headers:', { svix_id, svix_timestamp, svix_signature });
    return new Response(
      JSON.stringify({
        error: {
          message: 'Missing svix headers'
        }
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  try {
    // Get the raw body as a string
    const rawBody = await req.text();
    console.log('Raw webhook body:', rawBody);

    // Create a new Svix instance with your webhook secret
    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

    // Verify the webhook with the raw body
    const evt = wh.verify(rawBody, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    // Parse the raw body as JSON after verification
    const payload = JSON.parse(rawBody);
    console.log('Parsed webhook payload:', payload);

    // Handle the webhook
    const eventType = evt.type;
    console.log(`Processing webhook type ${eventType}`);
    
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, external_accounts } = evt.data;
      console.log('User data:', { id, email_addresses, first_name, last_name, external_accounts });

      // Get primary email, checking both direct email and OAuth sources
      let primaryEmail = email_addresses[0]?.email_address;
      if (!primaryEmail && external_accounts?.length > 0) {
        primaryEmail = external_accounts[0].email_address;
      }

      // Get name from either direct input or OAuth provider
      let firstName = first_name;
      let lastName = last_name;
      if ((!firstName || !lastName) && external_accounts?.length > 0) {
        firstName = external_accounts[0].first_name || '';
        lastName = external_accounts[0].last_name || '';
      }

      const fullName = `${firstName || ''} ${lastName || ''}`.trim();
      console.log('Processed user info:', { primaryEmail, fullName });

      if (!primaryEmail) {
        console.error('No email address found in user data');
        return new Response(
          JSON.stringify({
            error: {
              message: 'No email address found'
            }
          }),
          {
            status: 400,
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      }

      await addUserToDatabase(id, primaryEmail, fullName);
      return new Response(
        JSON.stringify({ message: 'User successfully created/updated' }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Webhook processed successfully' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.error('Error processing webhook:', err);
    return new Response(
      JSON.stringify({
        error: {
          message: 'Error processing webhook',
          details: err instanceof Error ? err.message : String(err)
        }
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
} 