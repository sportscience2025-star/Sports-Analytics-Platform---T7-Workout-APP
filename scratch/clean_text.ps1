$path = "js\knowledge-base.js"
$text = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix common Mojibake replacements from Windows-1252 / UTF-8 mismatch
$replacements = @{
    'Ã ' = 'à';
    'Ã©' = 'é';
    'Ã¨' = 'è';
    'Ã¬' = 'ì';
    'Ã²' = 'ò';
    'Ã¹' = 'ù';
    'Ã'  = 'À';
    'â€™' = "'";
    'â€“' = "-";
    'â€”' = "—"
}

foreach ($key in $replacements.Keys) {
    $text = $text.Replace($key, $replacements[$key])
}

[System.IO.File]::WriteAllText($path, $text, (New-Object System.Text.UTF8Encoding $false))
Write-Host "Encoding text clean up finished!"
