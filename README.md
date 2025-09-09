# Kerala Kitchen + Smart Pantry

A comprehensive React Native app for exploring Kerala cuisine and managing your pantry intelligently through receipt scanning and recipe matching.

## Features

### 🍛 Kerala Recipe Explorer
- **25+ Authentic Recipes**: Curated collection of traditional Kerala dishes including appam, puttu, sambar, fish curry, and more
- **Smart Pairing System**: Get suggestions for compatible mains and curries (e.g., appam + vegetable stew, rice + sambar)
- **Recipe Scaling**: Adjust servings and automatically scale ingredients and cooking times
- **Nutritional Information**: Calorie estimates per serving with local ingredient mapping

### 📱 Smart Pantry Management
- **Receipt Scanning**: Use camera or photo library to scan grocery receipts
- **OCR & Parsing**: Extract items with quantities and units from receipt text
- **Inventory Tracking**: Maintain pantry with expiry dates and low-stock alerts
- **Recipe Matching**: Get "Cook Now" suggestions based on available ingredients

### 🧪 Intelligent Cooking Assistant
- **Ingredient Substitutions**: Built-in substitution suggestions (e.g., shallots ↔ onion)
- **Missing Item Shopping Lists**: Generate shopping lists for near-match recipes
- **Meal Planning**: Complete meal suggestions with timing advice
- **Step-by-Step Cooking**: Interactive cooking mode with timers and progress tracking

## Architecture

### Technology Stack
- **Framework**: React Native with Expo
- **Database**: Expo SQLite for local-first data storage
- **State Management**: Zustand for global state
- **Navigation**: Expo Router with file-based routing
- **Scanning**: Expo Camera + Image Picker for receipt capture
- **UI**: Custom components with Lucide React Native icons

### Project Structure
```
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Explore recipes
│   │   ├── cook.tsx       # Smart cooking suggestions
│   │   ├── scan.tsx       # Receipt/photo scanning
│   │   ├── inventory.tsx  # Pantry management
│   │   └── saved.tsx      # Saved recipes
│   └── recipe/[id].tsx    # Recipe detail view
├── services/              # Business logic
│   ├── database.ts        # SQLite operations
│   ├── receiptParser.ts   # OCR text parsing
│   ├── recipeExtractor.ts # Recipe text extraction
│   ├── recipeMatchingService.ts # Inventory-recipe matching
│   ├── pairingService.ts  # Recipe pairing logic
│   └── scannerService.ts  # Camera/OCR integration
├── data/                  # Seed data
│   ├── seedRecipes.json   # Initial recipe collection
│   └── seedData.ts        # Database initialization
├── types/                 # TypeScript definitions
└── store/                 # Global state management
```

### Database Schema
- **FoodItem**: Pantry inventory with categories, quantities, and expiry dates
- **Recipe**: Complete recipe data with ingredients, steps, and pairing info
- **ScanRecord**: OCR results and parsing history
- **RecipeIngredient**: Structured ingredient data with amounts and units

## Setup & Installation

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd kerala-kitchen-app
   npm install
   ```

2. **Start Development**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build:web
   ```

## Features Implementation

### Receipt Scanning Pipeline
1. **Capture**: Camera or gallery selection via Expo ImagePicker
2. **OCR**: Text extraction (currently mock implementation with TODO for ML Kit)
3. **Parsing**: Rule-based extraction of items, quantities, and units
4. **Review**: User edits parsed items before adding to pantry
5. **Storage**: Items added to SQLite database with metadata

### Recipe Matching Algorithm
1. **Ingredient Availability**: Score recipes based on pantry contents
2. **Substitution Support**: Consider ingredient alternatives (coconut oil ↔ vegetable oil)
3. **Match Categories**:
   - **Cook Now**: 100% ingredient availability
   - **Near Match**: ≥70% availability with shopping list generation
4. **Ranking**: Sort by match score, cooking time, and user preferences

### Pairing Engine
- **Traditional Kerala Combinations**: Appam + stew, puttu + kadala curry, rice + sambar
- **Scoring System**: Compatibility ratings based on authentic pairings
- **Meal Planning**: Multi-course suggestions with timing coordination
- **Substitution Warnings**: Flag non-traditional substitutions (curry leaves → bay leaves)

## AI Integration Points (TODOs)

The app is designed with protocol-driven services for easy AI integration:

### 1. Enhanced OCR
```typescript
// TODO: Replace BasicScannerService with ML Kit
export class MLKitScannerService implements ScannerService {
  // Firebase ML Kit or Google ML Kit integration
}
```

### 2. Recipe Extraction
```typescript
// TODO: Implement LLM-based recipe parsing
export class AIRecipeExtractor implements RecipeExtractorService {
  // Extract structured recipes from text/images using LLM
}
```

### 3. Nutrition API
```typescript
// TODO: Connect to nutrition database
export class NutritionAPIService implements NutritionEstimator {
  // Real-time nutritional analysis
}
```

### 4. Smart Pairing
```typescript
// TODO: AI-powered pairing suggestions
export class AIPairingSuggester implements PairingSuggester {
  // ML-based flavor and texture pairing
}
```

## Data Privacy & Security

- **Local-First**: All data stored locally in SQLite
- **On-Device Processing**: OCR and parsing happen locally
- **No Mandatory Cloud**: Works completely offline
- **Optional Sync**: Protocol ready for CloudKit/Firebase integration
- **Image Privacy**: Photos processed locally, can be auto-deleted

## Testing Strategy

### Unit Tests
- Receipt parsing with various formats
- Recipe scaling calculations
- Ingredient substitution logic
- Database operations

### Integration Tests
- Complete scan-to-inventory workflow
- Recipe matching accuracy
- Pairing suggestion quality

### User Testing
- Scan receipt → verify parsed items
- Add recipe → check ingredient scaling
- Select main → validate curry suggestions
- Inventory matching → confirm "Cook Now" accuracy

## Performance Optimizations

- **Lazy Loading**: Recipes and images loaded on demand
- **Local Caching**: Parsed results cached for re-scanning
- **Background Processing**: OCR and parsing on background thread
- **Efficient Queries**: Indexed database searches
- **Image Compression**: Receipt photos optimized for storage

## Future Enhancements

### Phase 2 Features
- **Meal Planning Calendar**: Weekly meal scheduling
- **Shopping List Integration**: Export to grocery apps
- **Social Features**: Share recipes and meal plans
- **Voice Commands**: "Add rice to shopping list"
- **Barcode Scanning**: Product database integration

### Phase 3 Features
- **Computer Vision**: Automatic food recognition
- **Seasonal Recommendations**: Weather and festival-based suggestions
- **Health Tracking**: Integration with HealthKit
- **Multi-Language**: Malayalam and Tamil support
- **Community Recipes**: User-contributed content with moderation

## Contributing

1. Follow the existing code structure and naming conventions
2. Add tests for new parsing/matching logic
3. Update seed data with properly formatted recipes
4. Ensure accessibility compliance (VoiceOver, Dynamic Type)
5. Test on both iOS and Android platforms

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Recipe data sourced from traditional Kerala cookbooks
- UI inspiration from leading cooking apps
- Community feedback from Kerala food enthusiasts
- Nutrition data from USDA and Indian food composition tables