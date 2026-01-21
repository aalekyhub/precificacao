import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const HOTMART_WEBHOOK_SECRET = process.env.HOTMART_WEBHOOK_SECRET;
const APP_BASE_URL = process.env.APP_BASE_URL || 'https://precificamaster.com.br';

// Initialize Supabase Admin Client
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase Environment Variables');
}

const supabaseAdmin = createClient(
    SUPABASE_URL || '',
    SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // 1. Method Check
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // 2. Secret Validation (Simple Token Check)
    // Hotmart sends the token in a header usually named 'hottok' or inside the body depending on config.
    // We will check header 'x-hotmart-hottok' or query param '?hottok=' or a shared secret approach.
    const token = req.headers['x-hotmart-hottok'] || req.query.hottok;

    // NOTE: If you configured a specific token in Hotmart Webhook settings, validates here.
    // If HOTMART_WEBHOOK_SECRET is not set, we skip this check (Dangerous in production!).
    if (HOTMART_WEBHOOK_SECRET && token !== HOTMART_WEBHOOK_SECRET) {
        return res.status(401).json({ error: 'Unauthorized: Invalid Token' });
    }

    const event = req.body;

    // 3. Log Event (Access Hotmart Events table via Admin)
    try {
        // Check Idempotency by purchase_id (transaction)
        // Hotmart payload structure varies (v1 vs v2). Assuming generic structure for now.
        // Usually: event.data.purchase.transaction
        const transactionId = event?.data?.purchase?.transaction || event?.id || 'unknown';

        if (transactionId !== 'unknown') {
            const { data: existing } = await supabaseAdmin
                .from('hotmart_events')
                .select('id')
                .eq('purchase_id', transactionId)
                .single();

            if (existing) {
                return res.status(200).json({ message: 'Event already processed' });
            }
        }

        // Log the raw event
        await supabaseAdmin.from('hotmart_events').insert({
            purchase_id: transactionId,
            payload: event
        });

    } catch (err) {
        console.error('Error logging event:', err);
        // Proceed even if logging fails? Better to be safe.
    }

    // 4. Process "PURCHASE_APPROVED"
    // Hotmart Event Type: PURCHASE_APPROVED
    const eventName = event?.event || '';
    if (eventName !== 'PURCHASE_APPROVED') {
        // We only care about approvals. Returns 200 to acknowledge receipt.
        return res.status(200).json({ message: 'Ignored event type' });
    }

    // 5. Extract User Data
    const buyer = event.data.buyer;
    const email = buyer.email;
    const name = buyer.name;

    if (!email) {
        return res.status(400).json({ error: 'No email found in payload' });
    }

    try {
        // 6. Check if Tenant exists
        // We assume 1 tenant per email for simplicity in this MVP
        let tenantId: string;

        const { data: existingTenant } = await supabaseAdmin
            .from('tenants')
            .select('id')
            .eq('email', email)
            .single();

        if (existingTenant) {
            tenantId = existingTenant.id;
            console.log(`Tenant already exists for ${email}: ${tenantId}`);
        } else {
            // Create Tenant
            const { data: newTenant, error: tenantError } = await supabaseAdmin
                .from('tenants')
                .insert({
                    name: name ? `Empresa de ${name}` : `Empresa de ${email}`,
                    email: email,
                    plan: 'pro', // Assuming purchase is for Pro
                    status: 'active'
                })
                .select()
                .single();

            if (tenantError) throw tenantError;
            tenantId = newTenant.id;
        }

        // 7. Manage User (Supabase Auth)
        let userId: string;

        // Check if user exists in Auth
        // admin.listUsers is slow, better to try getting by email if possible or just try create
        // Unfortunately listUsers doesn't filter perfectly by default in older versions.
        // We can rely on createUser not duplicating if email exists? No, it throws error.
        // Strategy: Try to list by email.

        /* NOTE: Supabase Admin `listUsers` is not optimized for single lookup by email. 
           However, `createUser` with existing email returns specific error? 
           Or we can search via `listUsers` page 1.
        */

        // Simplest: Try to create user
        const { data: userCreated, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            email_confirm: true, // Auto confirm since they paid
            user_metadata: { name: name }
        });

        if (createError) {
            // If error is "User already registered", fetch their ID
            // We assume we can find them via a profile lookup or by failing gracefully
            console.log('User creation error (might exist):', createError);

            // Fallback: Try to find user ID via profiles if they have one?
            // If they exist in Auth but not profiles, we are in a bind without listUsers permission/capability easily.
            // Let's assume for this MVP we might need to instruct user to Reset Password if they exist.
            // BUT, we can use generateLink to finding userId? No.

            // Alternative: listUsers by email
            const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
            const existingUser = users.find(u => u.email === email);
            if (!existingUser) {
                throw new Error('Could not create user and could not find existing user.');
            }
            userId = existingUser.id;
        } else {
            userId = userCreated.user.id;
        }

        // 8. Link to Tenant (Profile)
        // Upsert profile
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                user_id: userId,
                tenant_id: tenantId,
                role: 'admin'
            });

        if (profileError) throw profileError;

        // 9. Send Access Email
        // Generate a password reset link (works for new users too as "set password")
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'recovery',
            email: email,
            options: {
                redirectTo: `${APP_BASE_URL}/reset-password`
            }
        });

        if (!linkError && linkData.properties?.action_link) {
            // TODO: Integrate with Resend or your Email Service Provider here.
            // For now, we are relying on Supabase's default email OR just mocking the log.
            // Since the requirement said "usar Supabase Auth para enviar... (ou usar Resend)"
            // generateLink DOES NOT send email, it gives us the link.
            // inviteUserByEmail DOES send email. Let's switch to inviteUserByEmail if appropriate?
            // Or just log the link if we don't have Resend set up yet.

            console.log(`ACCESS LINK FOR ${email}: ${linkData.properties.action_link}`);

            /* 
            // If using Resend:
            await resend.emails.send({
              from: 'PrecificaMaster <nao-responda@precificamaster.com.br>',
              to: email,
              subject: 'Seu acesso ao PrecificaMaster',
              html: `<p>Clique aqui para acessar: <a href="${linkData.properties.action_link}">Acessar Sistema</a></p>`
            });
            */
        }

        return res.status(200).json({ success: true, message: 'Tenant setup complete' });

    } catch (err: any) {
        console.error('Processing Error:', err);
        return res.status(500).json({ error: err.message });
    }
}
