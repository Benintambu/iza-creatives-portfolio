const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {

  // Répond au preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  const { public_id } = await req.json();

  const cloudName = Deno.env.get("CLOUDINARY_CLOUD_NAME")!;
  const apiKey = Deno.env.get("CLOUDINARY_API_KEY")!;
  const apiSecret = Deno.env.get("CLOUDINARY_API_SECRET")!;

  const timestamp = Math.floor(Date.now() / 1000);

  const signatureBase =
    `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`;

  const hashBuffer = await crypto.subtle.digest(
    "SHA-1",
    new TextEncoder().encode(signatureBase)
  );

  const signature = [...new Uint8Array(hashBuffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const body = new URLSearchParams({
    public_id,
    api_key: apiKey,
    timestamp: timestamp.toString(),
    signature,
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
    {
      method: "POST",
      body,
    }
  );

  const result = await response.json();

  return new Response(JSON.stringify(result), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });

});