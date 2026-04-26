export type QuoteType = "reform" | "cleaning" | "combined";

export type QuoteStatus = "pending" | "accepted" | "rejected";

export type QuoteItem = {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unit?: string;
  unit_price: number;
  total: number;
};

export type QuoteAIOutput = {
  title: string;
  summary: string;
  scope: string[];
  items: QuoteItem[];
  exclusions: string[];
  estimated_timeline: string;
  conditions: string[];
  validity: string;
  final_price: number;
  whatsapp_message: string;
};