
// AgriDirect - Supabase Configuration

const SUPABASE_URL = "https://vikucxaqtrlxclweinyl.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_v-8yhTEKIcRNiIqwc0m9QA_RB1oFASR";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);
