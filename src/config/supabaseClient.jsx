import { createClient } from '@supabase/supabase-js'

// Ye details aapko Supabase Dashboard > Settings > API mein milengi
const supabaseUrl = 'https://xvkaogsogujaypobdhqb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2a2FvZ3NvZ3VqYXlwb2JkaHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MzQ1OTEsImV4cCI6MjA3NjMxMDU5MX0.Ly5ivveif0bpGdpPhnASLP9JArsqdrehHmEHVSkUnAM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)