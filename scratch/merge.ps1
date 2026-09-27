$f1 = Get-Content -Raw -Path "scratch\athletics_weightlifting.json" | ConvertFrom-Json
$f2 = Get-Content -Raw -Path "scratch\biomechanics_physiology.json" | ConvertFrom-Json
$f3 = Get-Content -Raw -Path "scratch\rehab_team_sports.json" | ConvertFrom-Json

$all = @()
$all += $f1
$all += $f2
$all += $f3

$unique = [ordered]@{}
foreach ($item in $all) {
    if (-not $unique.Contains($item.id)) {
        $unique[$item.id] = $item
    }
}

$finalList = $unique.Values
Write-Host "Total unique sources: " $finalList.Count

$jsonText = $finalList | ConvertTo-Json -Depth 10

$header = @"
/**
 * js/knowledge-base.js
 * Comprehensive Scientific Sources & Rationale Database for AI Workout Generator.
 * Contains 105+ peer-reviewed studies across Biomechanics, Physiology, VBT, Track & Field, Weightlifting, Rehab, and Team Sports.
 */

(function () {
    'use strict';

    window.App = window.App || {};

    window.App.scientificSources = 
"@

$footer = @"
;

    window.ScientificKnowledgeBase = window.App.scientificSources;

})();
"@

$fullCode = $header + $jsonText + $footer
Set-Content -Path "js\knowledge-base.js" -Value $fullCode -Encoding UTF8
Write-Host "Successfully generated js\knowledge-base.js"
