# Color Consistency Migration Script for Windows
# This script will replace inconsistent blue colors with primary colors

Write-Host "🎨 Starting Color Consistency Migration..." -ForegroundColor Cyan
Write-Host ""

$dir = ".\src"
$count = 0

# Function to replace in files
function Replace-InFiles {
    param(
        [string]$FindPattern,
        [string]$ReplacePattern,
        [string]$Description
    )
    
    Write-Host "🔄 $Description..." -ForegroundColor Yellow
    
    Get-ChildItem -Path $dir -Recurse -Include *.tsx,*.ts | ForEach-Object {
        $content = Get-Content $_.FullName -Raw
        if ($content -match $FindPattern) {
            $newContent = $content -replace $FindPattern, $ReplacePattern
            Set-Content -Path $_.FullName -Value $newContent -NoNewline
            $script:count++
        }
    }
}

Write-Host "📝 Replacing blue colors with primary colors..." -ForegroundColor Green
Write-Host ""

# Replace text colors
Replace-InFiles "text-blue-600" "text-primary-600" "Replacing text-blue-600 with text-primary-600"
Replace-InFiles "text-blue-500" "text-primary-600" "Replacing text-blue-500 with text-primary-600"
Replace-InFiles "text-blue-700" "text-primary-700" "Replacing text-blue-700 with text-primary-700"

# Replace background colors
Replace-InFiles "bg-blue-600" "bg-primary-600" "Replacing bg-blue-600 with bg-primary-600"
Replace-InFiles "bg-blue-500" "bg-primary-500" "Replacing bg-blue-500 with bg-primary-500"
Replace-InFiles "bg-blue-700" "bg-primary-700" "Replacing bg-blue-700 with bg-primary-700"

# Replace hover states
Replace-InFiles "hover:bg-blue-700" "hover:bg-primary-700" "Replacing hover:bg-blue-700"
Replace-InFiles "hover:bg-blue-600" "hover:bg-primary-600" "Replacing hover:bg-blue-600"
Replace-InFiles "hover:text-blue-700" "hover:text-primary-700" "Replacing hover:text-blue-700"
Replace-InFiles "hover:text-blue-600" "hover:text-primary-600" "Replacing hover:text-blue-600"

# Replace border colors
Replace-InFiles "border-blue-600" "border-primary-600" "Replacing border-blue-600"
Replace-InFiles "border-blue-500" "border-primary-500" "Replacing border-blue-500"

# Replace focus ring colors
Replace-InFiles "ring-blue-500" "ring-primary-500" "Replacing ring-blue-500"
Replace-InFiles "focus:ring-blue-500" "focus:ring-primary-500" "Replacing focus:ring-blue-500"

# Replace bg-blue in Badge/Status components
Replace-InFiles "bg-blue-100 text-blue-800" "bg-primary-100 text-primary-800" "Replacing blue badges with primary"
Replace-InFiles "bg-blue-50" "bg-primary-50" "Replacing bg-blue-50"

Write-Host ""
Write-Host "✅ Migration complete!" -ForegroundColor Green
Write-Host "📊 Processed files with $count replacements" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT: Review the changes before committing!" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Review changed files: git diff" -ForegroundColor Gray
Write-Host "2. Test the application: npm run dev" -ForegroundColor Gray
Write-Host "3. If everything looks good: git add . && git commit -m 'Apply consistent color scheme'" -ForegroundColor Gray
Write-Host ""
