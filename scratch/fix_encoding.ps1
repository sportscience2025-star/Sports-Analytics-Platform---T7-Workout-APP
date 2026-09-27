$content = Get-Content -Path "js\knowledge-base.js" -Raw -Encoding UTF8

# Replace Unicode escape sequences if any
$content = [regex]::Unescape($content)
# Replace \u0026 if literal
$content = $content.Replace('\u0026', '&')

[System.IO.File]::WriteAllText("js\knowledge-base.js", $content, [System.Text.Encoding]::UTF8)
Write-Host "Encoding fixed successfully!"
