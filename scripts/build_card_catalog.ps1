$ErrorActionPreference = "Stop"

# Scrapes the public Piltover Archive card library (RSC payload) to build a
# local Riftbound catalog: { id, name, set, number, variant }.
# Card art itself is loaded at runtime from the same CDN the app already uses.

$totalPages = 26
# The card grid lives in an escaped RSC payload, e.g. cards/OGN-001.webp\",\"alt\":\"Blazing Scorcher\"
$rx = [regex]'cards/(?<id>[A-Z0-9]+-\d{3}[a-z]?)\.webp\\",\\"alt\\":\\"(?<name>[^"\\]+)\\"'
$map = [ordered]@{}

for ($p = 1; $p -le $totalPages; $p++) {
  $url = "https://piltoverarchive.com/cards?page=$p"
  try {
    $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40).Content
  } catch {
    Write-Warning "page $p failed: $($_.Exception.Message)"
    continue
  }
  $count = 0
  foreach ($m in $rx.Matches($html)) {
    $id = $m.Groups['id'].Value
    if ($map.Contains($id)) { continue }
    $name = $m.Groups['name'].Value
    $map[$id] = $name
    $count++
  }
  Write-Output "page $p -> +$count (total $($map.Count))"
}

$cards = foreach ($id in $map.Keys) {
  $parts = $id -split '-'
  $set = $parts[0]
  $numRaw = $parts[1]
  $variant = ($numRaw -replace '^\d+', '')
  [pscustomobject]@{
    id      = $id
    name    = $map[$id]
    set     = $set
    number  = [int]($numRaw -replace '\D', '')
    variant = if ($variant) { $variant } else { $null }
  }
}

$sorted = $cards | Sort-Object set, number, variant
$payload = [pscustomobject]@{
  generatedAt = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd")
  count       = $sorted.Count
  cards       = $sorted
}

$dest = Join-Path (Split-Path $PSScriptRoot -Parent) "public/cards/catalog.json"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
$payload | ConvertTo-Json -Depth 5 | Set-Content -Path $dest -Encoding UTF8
Write-Output "Wrote $($sorted.Count) cards -> $dest"
