// src/app/api/webhook/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { createServerComponentClient } from '@/lib/supabase'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const isTestWebhook = headerPayload.get("x-test-webhook");
  
  let evt: WebhookEvent;

  if (isTestWebhook) {
    // For testing, use payload directly
    const payload = await req.json();
    evt = payload as WebhookEvent;
    console.info('Processing test webhook');
  } else {
    // Production webhook verification
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
      throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
    }

    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    // If there are no headers, error out
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error occured -- no svix headers', {
        status: 400
      });
    }

    // Get the body
    const payload = await req.json();
    const body = JSON.stringify(payload);

    // Create a new Svix instance with your secret.
    const wh = new Webhook(WEBHOOK_SECRET);

    // Verify the payload with the headers
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return new Response('Error occured', {
        status: 400
      });
    }
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.info(`Webhook with and ID of ${id} and type of ${eventType}`)
  console.info('Webhook event:', JSON.stringify(evt, null, 2))

  const supabase = createServerComponentClient();

  // Handle the webhook
  switch (eventType) {
    case 'user.created':
      const { id: clerk_user_id, email_addresses, first_name, last_name, image_url } = evt.data;
      
      // Generate simple API key for new user (temporary while function is not created)
      const apiKeyData = 'ask_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Create user in Supabase (using actual table structure)
      const { error: createError } = await supabase
        .from('users')
        .insert({
          clerk_user_id,
          email: email_addresses[0].email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          image_url,
          api_key: apiKeyData,
          plan_type: 'free',
          daily_requests_count: 0,
        });

      if (createError) {
        console.error('Error creating user in Supabase:', createError);
        console.error('Attempted to insert:', {
          clerk_user_id,
          email: email_addresses[0]?.email_address,
          name: `${first_name || ''} ${last_name || ''}`.trim() || null,
          image_url,
          api_key: apiKeyData,
          plan_type: 'free',
        });
        return new Response(`Error creating user: ${createError.message}`, { status: 500 });
      }
      break;

    case 'user.updated':
      const { 
        id: updated_clerk_user_id, 
        email_addresses: updated_emails, 
        first_name: updated_first_name, 
        last_name: updated_last_name,
        image_url: updated_image_url 
      } = evt.data;
      
      // Update user in Supabase (using actual table structure)
      const { error: updateError } = await supabase
        .from('users')
        .update({
          email: updated_emails[0].email_address,
          name: `${updated_first_name || ''} ${updated_last_name || ''}`.trim() || null,
          image_url: updated_image_url,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_user_id', updated_clerk_user_id);

      if (updateError) {
        console.error('Error updating user in Supabase:', updateError);
        return new Response('Error updating user', { status: 500 });
      }
      break;

      case 'user.deleted':
        const { id: deleted_clerk_user_id } = evt.data;
        
        // Verificar que el ID existe
        if (!deleted_clerk_user_id) {
          console.error('No user ID provided for deletion');
          return new Response('No user ID provided', { status: 400 });
        }
        
        // Ahora TypeScript sabe que deleted_clerk_user_id es string
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('clerk_user_id', deleted_clerk_user_id);

      if (deleteError) {
        console.error('Error deleting user from Supabase:', deleteError);
        return new Response('Error deleting user', { status: 500 });
      }
      break;

    default:
      console.info(`Unhandled webhook event type: ${eventType}`);
  }

  return new Response('', { status: 200 })
}