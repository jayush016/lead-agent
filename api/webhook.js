// Webhook endpoint for receiving leads from Make.com / Zapier
// URL: https://lead-agent-s538.vercel.app/api/webhook

// Using node-fetch for Node.js < 18 compatibility
const https = require('https');

// Supabase configuration (same as main app)
const SUPABASE_URL = 'https://eecngqtvlonuwfrjjwty.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlY25ncXR2bG9udXdmcmpqd3R5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzQ4NzAsImV4cCI6MjA1MjI1MDg3MH0.LkAt0cjQQrgMYOQz3jb55Y-UD8dIw-b40huXvCmH2GU';

// Helper function to make HTTPS request (no external dependencies)
function httpsPost(url, data, headers) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            port: 443,
            path: urlObj.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = https.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, body });
            });
        });

        req.on('error', reject);
        req.write(JSON.stringify(data));
        req.end();
    });
}

module.exports = async function handler(req, res) {
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

        // Insert into Supabase using native https module
        const result = await httpsPost(
            `${SUPABASE_URL}/rest/v1/leads`,
            newLead,
            {
                'apikey': SUPABASE_ANON_KEY,
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Prefer': 'return=representation'
            }
        );

        if (!result.ok) {
            console.error('Supabase error:', result.body);
            return res.status(500).json({
                success: false,
                error: 'Database insert failed',
                details: result.body
            });
        }

        let insertedLead;
        try {
            insertedLead = JSON.parse(result.body);
        } catch (e) {
            insertedLead = result.body;
        }

        return res.status(200).json({
            success: true,
            message: 'Lead created successfully',
            lead: Array.isArray(insertedLead) ? insertedLead[0] : insertedLead
        });

    } catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
};
