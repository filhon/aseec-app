import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking project_tags...");
    const { data: tags, error: tagsErr } = await supabase.from('project_tags').select('*').limit(1);
    console.log("Tags:", tags, "Err:", tagsErr);

    console.log("Checking project_categories...");
    const { data: cats, error: catsErr } = await supabase.from('project_categories').select('*').limit(1);
    console.log("Cats:", cats, "Err:", catsErr);
}
check();
