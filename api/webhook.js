// Webhook endpoint for receiving leads from Make.com / Zapier
// URL: https://lead-agent-inky.vercel.app/api/webhook

// Supabase configuration (same as main app)
const SUPABASE_URL = 'https://eecngqtvlonuwfrjjwty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlY25ncXR2bG9udXdmcmpqd3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzQ4NzAsImV4cCI6MjA1MjI1MDg3MH0.LkAt0cjQQrgMYOQz3jb55Y-UD8dIw-b40huXvCmH2GU';

export default async function handler(req, res) {
    // Enable CORS for external webhook sources
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight CORS request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed. Use POST.' 
        });
    }

    try {
        const body = req.body;

        // Validate required fields
        if (!body.name || !body.phone) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: name, phone'
            });
        }

        // Clean phone number (remove spaces, dashes, +91 prefix)
        let phone = String(body.phone).replace(/[\s\-\+]/g, '');
        if (phone.startsWith('91') && phone.length > 10) {
            phone = phone.slice(2);
        }

        // Build lead object
        const newLead = {
            name: body.name.trim(),
            phone: phone,
            property: body.property || body.property_type || '2 BHK',
            location: body.location || body.area || '',
            budget_min: parseInt(body.budget_min) || parseInt(body.budget) || 50,
            budget_max: parseInt(body.budget_max) || parseInt(body.budget) || 100,
            source: body.source || body.utm_source || 'Facebook',
            stage: 'new',
            score: parseInt(body.score) || 50,
            notes: body.notes || body.message || '',
            created_at: new Date().toISOString()
        };

        // Insert into Supabase
        const response = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(newLead)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Supabase error:', errorText);
            return res.status(500).json({
                success: false,
                error: 'Database insert failed',
                details: errorText
            });
        }

        const insertedLead = await response.json();

        return res.status(200).json({
            success: true,
            message: 'Lead created successfully',
            lead: insertedLead[0] || insertedLead
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}
