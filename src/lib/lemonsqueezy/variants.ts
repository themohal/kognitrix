// LemonSqueezy variant ID mapping
// Reads from env at call time (not module load) so NEXT_PUBLIC_ vars are available

const VARIANT_MAP: Record<string, string | undefined> = {
  // Subscriptions
  starter: process.env.NEXT_PUBLIC_LS_STARTER_VARIANT_ID,
  pro: process.env.NEXT_PUBLIC_LS_PRO_VARIANT_ID,
  // Credit packs
  starter_pack: process.env.NEXT_PUBLIC_LS_PACK_100_VARIANT_ID,
  growth_pack: process.env.NEXT_PUBLIC_LS_PACK_500_VARIANT_ID,
  pro_pack: process.env.NEXT_PUBLIC_LS_PACK_1000_VARIANT_ID,
  mega_pack: process.env.NEXT_PUBLIC_LS_PACK_2000_VARIANT_ID,
};

export function getVariantId(key: string): string {
  return VARIANT_MAP[key] || '';
}
