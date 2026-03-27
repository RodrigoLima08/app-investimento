import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wdcuncoxxpswrcmnywst.supabase.co'
const supabaseKey = 'sb_publishable_R5Vay5-as7g0DSN1Bmfkag_Y9Pxdg9-'

export const supabase = createClient(supabaseUrl, supabaseKey)
