$utf8NoBOM = New-Object System.Text.UTF8Encoding $false

$t1 = [System.IO.File]::ReadAllText("scratch\athletics_weightlifting.json", [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$t2 = [System.IO.File]::ReadAllText("scratch\biomechanics_physiology.json", [System.Text.Encoding]::UTF8) | ConvertFrom-Json
$t3 = [System.IO.File]::ReadAllText("scratch\rehab_team_sports.json", [System.Text.Encoding]::UTF8) | ConvertFrom-Json

$all = @()
$all += $t1
$all += $t2
$all += $t3

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
[System.IO.File]::WriteAllText("js\knowledge-base.js", $fullCode, $utf8NoBOM)
Write-Host "Re-generated js\knowledge-base.js with strict UTF8!"
