import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://cimpgdwztjgegwsjscnq.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_r1gMwYE8yd6RNIYcJa6VIw_2elcIPxt";

export const supabase = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("Supabase connecté :", supabase);