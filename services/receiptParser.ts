import { ParsedLineItem } from '@/types/database';

export interface ReceiptParserService {
  parseReceiptText(text: string): ParsedLineItem[];
}

export class LocalReceiptParser implements ReceiptParserService {
  private ingredientMappings = {
    // Common ingredient variations and normalizations
    'coconut oil': ['coconut oil', 'coco oil', 'coconut cooking oil'],
    'rice': ['rice', 'matta rice', 'basmati rice', 'ponni rice'],
    'onion': ['onion', 'onions', 'big onion', 'shallots', 'small onion'],
    'tomato': ['tomato', 'tomatoes', 'tomato red'],
    'ginger': ['ginger', 'fresh ginger', 'ginger fresh'],
    'garlic': ['garlic', 'garlic pods', 'fresh garlic'],
    'green chili': ['green chilli', 'green chili', 'chilli green'],
    'curry leaves': ['curry leaves', 'curry leaf', 'karuveppila'],
    'mustard seeds': ['mustard seeds', 'mustard seed', 'kadugu'],
    'turmeric powder': ['turmeric powder', 'turmeric', 'manjal powder'],
    'red chili powder': ['red chilli powder', 'red chili powder', 'chilli powder'],
    'coriander powder': ['coriander powder', 'dhania powder'],
    'cumin powder': ['cumin powder', 'jeera powder'],
    'garam masala': ['garam masala', 'garam masala powder'],
    'coconut': ['coconut', 'fresh coconut', 'coconut fresh'],
    'milk': ['milk', 'fresh milk', 'cow milk'],
    'eggs': ['eggs', 'egg', 'hen eggs'],
    'chicken': ['chicken', 'chicken meat', 'broiler chicken'],
    'fish': ['fish', 'fresh fish', 'sea fish'],
    'vegetables': ['vegetables', 'mixed vegetables', 'veggie mix']
  };

  parseReceiptText(text: string): ParsedLineItem[] {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const parsed: ParsedLineItem[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip header/footer lines, prices, and non-item lines
      if (this.shouldSkipLine(trimmed)) continue;

      const item = this.parseLine(trimmed);
      if (item) {
        parsed.push(item);
      }
    }

    return parsed;
  }

  private shouldSkipLine(line: string): boolean {
    const skipPatterns = [
      /^total/i,
      /^subtotal/i,
      /^tax/i,
      /^vat/i,
      /^cash/i,
      /^card/i,
      /^change/i,
      /^thank you/i,
      /^receipt/i,
      /^bill/i,
      /^date:/i,
      /^time:/i,
      /^\d{2}\/\d{2}\/\d{4}/,
      /^\d{2}:\d{2}/,
      /^rs\.?\s*\d+/i,
      /^₹\s*\d+/,
      /^\d+\.00$/,
      /^[*-=_]+$/,
      /^store|shop|mart|super/i
    ];

    return skipPatterns.some(pattern => pattern.test(line));
  }

  private parseLine(line: string): ParsedLineItem | null {
    // Remove price information from the end
    const cleanLine = line.replace(/\s+rs\.?\s*\d+(\.\d+)?$/i, '')
                         .replace(/\s+₹\s*\d+(\.\d+)?$/i, '')
                         .replace(/\s+\d+\.\d+$/i, '');

    // Pattern matching for quantity and unit
    const patterns = [
      // "2 kg rice", "500 ml coconut oil", "3 pcs eggs"
      /^(\d+(?:\.\d+)?)\s*(kg|g|ml|l|pcs?|pieces?|nos?)\s+(.+)/i,
      // "rice 2kg", "coconut oil 500ml"
      /^(.+?)\s+(\d+(?:\.\d+)?)\s*(kg|g|ml|l|pcs?|pieces?|nos?)$/i,
      // "2kg rice", "500ml oil" (no space)
      /^(\d+(?:\.\d+)?)(kg|g|ml|l)\s+(.+)/i,
      // Just item name
      /^(.+)$/
    ];

    for (const pattern of patterns) {
      const match = cleanLine.match(pattern);
      if (!match) continue;

      if (pattern.source.includes('(.+?)')) {
        // Pattern with item name first
        const [, name, quantity, unit] = match;
        return {
          raw: line,
          name: this.normalizeIngredientName(name.trim()),
          quantity: parseFloat(quantity),
          unit: this.normalizeUnit(unit)
        };
      } else if (pattern.source.startsWith('^(\\d')) {
        // Pattern with quantity first
        const [, quantity, unit, name] = match;
        if (name) {
          return {
            raw: line,
            name: this.normalizeIngredientName(name.trim()),
            quantity: parseFloat(quantity),
            unit: this.normalizeUnit(unit)
          };
        }
      } else {
        // Just item name
        const name = match[1].trim();
        if (name.length > 2) {
          return {
            raw: line,
            name: this.normalizeIngredientName(name),
            quantity: undefined,
            unit: undefined
          };
        }
      }
    }

    return null;
  }

  private normalizeIngredientName(name: string): string {
    const cleaned = name.toLowerCase()
                       .replace(/[^\w\s]/g, ' ')
                       .replace(/\s+/g, ' ')
                       .trim();

    // Find canonical name
    for (const [canonical, variations] of Object.entries(this.ingredientMappings)) {
      if (variations.some(variant => cleaned.includes(variant.toLowerCase()))) {
        return canonical;
      }
    }

    return cleaned;
  }

  private normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      'kg': 'kg',
      'g': 'g',
      'ml': 'ml',
      'l': 'l',
      'pcs': 'pcs',
      'pc': 'pcs',
      'piece': 'pcs',
      'pieces': 'pcs',
      'nos': 'pcs',
      'no': 'pcs'
    };

    return unitMap[unit.toLowerCase()] || unit.toLowerCase();
  }
}

// TODO: AI-powered receipt parser
export class AIReceiptParser implements ReceiptParserService {
  async parseReceiptText(text: string): Promise<ParsedLineItem[]> {
    // TODO: Implement LLM-based parsing
    // This would send the receipt text to an AI service with a prompt like:
    // "Parse this grocery receipt and extract items with quantities and units.
    //  Return JSON array with {name, quantity, unit} for each item.
    //  Focus on Indian grocery items and ingredients."
    
    console.log('TODO: Implement AI receipt parsing');
    // Fallback to local parser
    return new LocalReceiptParser().parseReceiptText(text);
  }
}