#!/bin/bash

# Color Consistency Migration Script
# This script will replace inconsistent blue colors with primary colors

echo "🎨 Starting Color Consistency Migration..."
echo ""

# Define the directory
DIR="./src"

# Counter for replacements
count=0

# Function to replace in files
replace_in_files() {
    local find_pattern=$1
    local replace_pattern=$2
    local description=$3
    
    echo "🔄 $description..."
    
    # Find and replace in all .tsx and .ts files
    if command -v sed > /dev/null; then
        # macOS/Linux
        find "$DIR" -type f \( -name "*.tsx" -o -name "*.ts" \) -exec sed -i.bak "s/$find_pattern/$replace_pattern/g" {} \;
        find "$DIR" -type f -name "*.bak" -delete
    else
        echo "⚠️  sed not found. Please use VS Code find & replace instead."
        return
    fi
    
    ((count++))
}

echo "📝 Replacing blue colors with primary colors..."
echo ""

# Replace text colors
replace_in_files "text-blue-600" "text-primary-600" "Replacing text-blue-600 with text-primary-600"
replace_in_files "text-blue-500" "text-primary-600" "Replacing text-blue-500 with text-primary-600"
replace_in_files "text-blue-700" "text-primary-700" "Replacing text-blue-700 with text-primary-700"

# Replace background colors
replace_in_files "bg-blue-600" "bg-primary-600" "Replacing bg-blue-600 with bg-primary-600"
replace_in_files "bg-blue-500" "bg-primary-500" "Replacing bg-blue-500 with bg-primary-500"
replace_in_files "bg-blue-700" "bg-primary-700" "Replacing bg-blue-700 with bg-primary-700"

# Replace hover states
replace_in_files "hover:bg-blue-700" "hover:bg-primary-700" "Replacing hover:bg-blue-700"
replace_in_files "hover:bg-blue-600" "hover:bg-primary-600" "Replacing hover:bg-blue-600"
replace_in_files "hover:text-blue-700" "hover:text-primary-700" "Replacing hover:text-blue-700"
replace_in_files "hover:text-blue-600" "hover:text-primary-600" "Replacing hover:text-blue-600"

# Replace border colors
replace_in_files "border-blue-600" "border-primary-600" "Replacing border-blue-600"
replace_in_files "border-blue-500" "border-primary-500" "Replacing border-blue-500"

# Replace focus ring colors
replace_in_files "ring-blue-500" "ring-primary-500" "Replacing ring-blue-500"
replace_in_files "focus:ring-blue-500" "focus:ring-primary-500" "Replacing focus:ring-blue-500"

echo ""
echo "✅ Migration complete!"
echo "📊 Processed $count replacement patterns"
echo ""
echo "⚠️  IMPORTANT: Review the changes before committing!"
echo ""
echo "Next steps:"
echo "1. Review changed files: git diff"
echo "2. Test the application"
echo "3. If everything looks good: git add . && git commit -m 'Apply consistent color scheme'"
echo ""
