$project = "C:\Users\Aaryan Rawal\.gemini\antigravity\scratch\OptiFreight_AI\OptiFreight AI"
$rawPath = Join-Path $project "DATASETS\raw"
$archive1Path = Join-Path $project "DATASETS_extracted\archive1"
$deleted = @()
Get-ChildItem -Path $archive1Path -File -Recurse -Filter "*olist*.csv" | ForEach-Object {
    $rawFile = Join-Path $rawPath $_.Name
    if (Test-Path $rawFile) {
        $hashRaw = (Get-FileHash -Path $rawFile -Algorithm SHA256).Hash
        $hashArc = (Get-FileHash -Path $_.FullName -Algorithm SHA256).Hash
        if ($hashRaw -eq $hashArc) {
            Remove-Item -Path $_.FullName -Force
            $deleted += $_.FullName
        }
    }
}
$removalManifest = Join-Path $project "DATASETS\REMOVAL_MANIFEST.md"
if ($deleted.Count -eq 0) {
    "No files were removed." | Set-Content -Path $removalManifest
} else {
    "Removed files:`n" + ($deleted -join "`n") | Set-Content -Path $removalManifest
}
