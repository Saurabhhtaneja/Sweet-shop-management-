import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface PurchaseRequest {
  sweetId: string;
  quantity: number;
}

interface RestockRequest {
  sweetId: string;
  quantity: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const url = new URL(req.url);

    if (url.pathname.includes('/purchase')) {
      const { sweetId, quantity }: PurchaseRequest = await req.json();

      if (!sweetId || !quantity || quantity <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid sweetId or quantity' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: sweet, error: sweetError } = await supabase
        .from('sweets')
        .select('*')
        .eq('id', sweetId)
        .single();

      if (sweetError || !sweet) {
        return new Response(
          JSON.stringify({ error: 'Sweet not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      if (sweet.quantity < quantity) {
        return new Response(
          JSON.stringify({ error: 'Insufficient stock', available: sweet.quantity }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const totalPrice = sweet.price * quantity;

      const { error: updateError } = await supabase
        .from('sweets')
        .update({ quantity: sweet.quantity - quantity })
        .eq('id', sweetId);

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to update inventory' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: purchase, error: purchaseError } = await supabase
        .from('purchases')
        .insert([
          {
            user_id: user.id,
            sweet_id: sweetId,
            quantity: quantity,
            total_price: totalPrice,
          },
        ])
        .select()
        .single();

      if (purchaseError) {
        await supabase
          .from('sweets')
          .update({ quantity: sweet.quantity })
          .eq('id', sweetId);

        return new Response(
          JSON.stringify({ error: 'Failed to record purchase' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          message: 'Purchase successful',
          purchase,
          remainingStock: sweet.quantity - quantity,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (url.pathname.includes('/restock')) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (!profile?.is_admin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { sweetId, quantity }: RestockRequest = await req.json();

      if (!sweetId || !quantity || quantity <= 0) {
        return new Response(
          JSON.stringify({ error: 'Invalid sweetId or quantity' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const { data: sweet, error: sweetError } = await supabase
        .from('sweets')
        .select('quantity')
        .eq('id', sweetId)
        .single();

      if (sweetError || !sweet) {
        return new Response(
          JSON.stringify({ error: 'Sweet not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      const newQuantity = sweet.quantity + quantity;

      const { data, error: updateError } = await supabase
        .from('sweets')
        .update({ quantity: newQuantity })
        .eq('id', sweetId)
        .select()
        .single();

      if (updateError) {
        return new Response(
          JSON.stringify({ error: 'Failed to restock' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      return new Response(
        JSON.stringify({
          message: 'Restock successful',
          sweet: data,
          newQuantity,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});