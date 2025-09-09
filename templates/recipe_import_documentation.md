# Recipe Import Documentation

## Overview
The Kerala Kitchen app supports importing recipes in two formats: JSON and Excel. This document provides detailed specifications for both formats.

## JSON Format

### File Structure
The JSON file must contain an array of recipe objects. Each recipe object should have the following structure:

```json
[
  {
    "title": "Recipe Name",
    "region": "Kerala",
    "tags": ["veg", "breakfast"],
    "ingredients": [
      {
        "name": "ingredient name",
        "amount": 2,
        "unit": "cups",
        "optional": false
      }
    ],
    "steps": [
      "Step 1 description",
      "Step 2 description"
    ],
    "prepMinutes": 15,
    "cookMinutes": 30,
    "servings": 4,
    "caloriesPerServing": 200,
    "compatibleMains": ["rice", "appam"],
    "compatibleCurries": ["sambar", "curry"],
    "notes": "Additional notes"
  }
]
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | Yes | Recipe name |
| `region` | String | No | Default: "Kerala" |
| `tags` | Array[String] | No | Categories like "veg", "non-veg", "breakfast" |
| `ingredients` | Array[Object] | Yes | List of ingredients with amounts |
| `steps` | Array[String] | Yes | Cooking instructions |
| `prepMinutes` | Number | No | Default: 15 |
| `cookMinutes` | Number | No | Default: 30 |
| `servings` | Number | No | Default: 4 |
| `caloriesPerServing` | Number | No | Optional calorie information |
| `compatibleMains` | Array[String] | No | Compatible main dishes |
| `compatibleCurries` | Array[String] | No | Compatible curries |
| `notes` | String | No | Additional recipe notes |

### Ingredient Object Structure

```json
{
  "name": "rice",
  "amount": 2,
  "unit": "cups",
  "optional": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | String | Yes | Ingredient name |
| `amount` | Number | No | Quantity |
| `unit` | String | No | Unit of measurement |
| `optional` | Boolean | No | Default: false |

## Excel Format

### Column Headers
The Excel file must have the following columns in the first row:

| Column | Data Type | Required | Description |
|--------|-----------|----------|-------------|
| Recipe Title | Text | Yes | Name of the recipe |
| Region | Text | No | Default: "Kerala" |
| Tags (comma-separated) | Text | No | Categories separated by commas |
| Ingredients (JSON format) | Text | Yes | JSON array of ingredient objects |
| Steps (pipe-separated) | Text | Yes | Steps separated by pipe (|) characters |
| Prep Minutes | Number | No | Preparation time |
| Cook Minutes | Number | No | Cooking time |
| Servings | Number | No | Number of servings |
| Calories Per Serving | Number | No | Calorie information |
| Compatible Mains (comma-separated) | Text | No | Compatible dishes |
| Compatible Curries (comma-separated) | Text | No | Compatible curries |
| Notes | Text | No | Additional notes |

### Example Excel Row

| Recipe Title | Region | Tags | Ingredients | Steps | Prep Minutes | Cook Minutes | Servings |
|--------------|--------|------|-------------|-------|--------------|--------------|----------|
| Traditional Appam | Kerala | veg,breakfast | [{"name":"rice","amount":2,"unit":"cups","optional":false}] | Soak rice\|Grind to batter\|Ferment overnight | 30 | 20 | 4 |

### Data Format Rules

1. **Tags**: Separate multiple tags with commas (e.g., "veg,breakfast,fermented")
2. **Ingredients**: Must be valid JSON array format
3. **Steps**: Separate steps with pipe characters (|)
4. **Compatible items**: Separate with commas
5. **Numbers**: Use plain numbers without units in numeric columns

## Error Handling

### Common Import Errors

1. **Invalid JSON**: Malformed JSON syntax
2. **Missing required fields**: Title, ingredients, or steps missing
3. **Invalid ingredient format**: Ingredients not in proper JSON format
4. **File format not supported**: Only .json, .xlsx, and .xls files accepted
5. **Empty file**: File contains no recipe data

### Error Messages

The import system provides detailed error messages including:
- Row/recipe number where error occurred
- Specific field that caused the error
- Suggested fix for the error

## Best Practices

1. **Use templates**: Download and modify the provided templates
2. **Validate JSON**: Use a JSON validator before importing
3. **Test with small batches**: Import a few recipes first to verify format
4. **Backup existing data**: Export current recipes before large imports
5. **Use consistent naming**: Keep ingredient names consistent across recipes

## Sample Data

### JSON Sample
```json
[
  {
    "title": "Kerala Fish Curry",
    "region": "Kerala",
    "tags": ["non-veg", "curry", "spicy"],
    "ingredients": [
      {"name": "fish", "amount": 500, "unit": "g", "optional": false},
      {"name": "coconut milk", "amount": 1, "unit": "cup", "optional": false},
      {"name": "curry leaves", "amount": 15, "unit": "pcs", "optional": false}
    ],
    "steps": [
      "Clean and cut fish into pieces",
      "Heat oil in clay pot",
      "Add spices and cook until fragrant",
      "Add fish and coconut milk",
      "Simmer until cooked"
    ],
    "prepMinutes": 15,
    "cookMinutes": 25,
    "servings": 4,
    "caloriesPerServing": 280,
    "compatibleMains": ["rice", "appam"],
    "compatibleCurries": [],
    "notes": "Best cooked in clay pot"
  }
]
```

## Support

For additional help with recipe imports:
1. Use the built-in templates
2. Check error messages for specific guidance
3. Verify file format and structure
4. Test with sample data first