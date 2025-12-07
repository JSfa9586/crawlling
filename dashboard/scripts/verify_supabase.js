
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load env from .env.local manually since dotenv might not be set up for this standalone script context
const envPath = path.resolve(__dirname, '../.env.local');
let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
        const [key, value] = line.split('=');
        if (key && value) {
            if (key.trim() === 'SUPABASE_URL') supabaseUrl = value.trim();
            if (key.trim() === 'SUPABASE_KEY') supabaseKey = value.trim();
        }
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Could not load SUPABASE_URL or SUPABASE_KEY from .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('Verifying Supabase Data...');

    // Check Pre-Specs
    const { data: preSpecs, error: preError } = await supabase
        .from('g2b_pre_specs')
        .select('count')
        .limit(1);

    if (preError) {
        if (preError.code === '42P01') { // undefined_table
            console.error('FAIL: Table g2b_pre_specs does not exist. Did you run the SQL schema?');
        } else {
            console.error('FAIL: Error querying g2b_pre_specs:', preError.message);
        }
    } else {
        // Count fetch is a bit different in JS, just select head
        const { count, error } = await supabase.from('g2b_pre_specs').select('*', { count: 'exact', head: true });
        if (error) console.error('Error counting pre-specs:', error);
        else console.log(`PASS: g2b_pre_specs table exists. Total rows: ${count}`);
    }

    // Check Bids
    const { count: bidCount, error: bidError } = await supabase.from('g2b_bids').select('*', { count: 'exact', head: true });

    if (bidError) {
        if (bidError.code === '42P01') {
            console.error('FAIL: Table g2b_bids does not exist.');
        } else {
            console.error('FAIL: Error querying g2b_bids:', bidError.message);
        }
    } else {
        console.log(`PASS: g2b_bids table exists. Total rows: ${bidCount}`);
    }
}

verify();
