import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month') || new Date().getMonth() + 1;
  const year = searchParams.get('year') || new Date().getFullYear();
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Construir fechas para el filtro
  const startDate = new Date(Number(year), Number(month) - 1, 1).toISOString().split('T')[0];
  const endDate = new Date(Number(year), Number(month), 0).toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('economic_calendar')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ 
    data: data.map(item => ({
        ...item,
        date: item.date + 'T00:00:00'
    }))
   });
}