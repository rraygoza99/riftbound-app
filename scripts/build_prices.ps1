$ErrorActionPreference = "Stop"

# Builds public/prices/prices.json from TCGCSV (a daily TCGplayer export).
# Per TCGCSV guidelines this runs server-side at build time with a custom
# User-Agent, hits each set once, and sleeps between requests. Do not call
# TCGCSV from the app at runtime (restrictive CORS + rate limits).

$ua = "RiftMate/1.0 (+https://buymeacoffee.com/sonsofthemoon)"
$h = @{ "User-Agent" = $ua }
$categoryId = 89  # Riftbound: League of Legends TCG
$root = Split-Path $PSScriptRoot -Parent

# Target sets = the sets present in our bundled catalog.
$catalog = Get-Content (Join-Path $root "public/cards/catalog.json") -Raw | ConvertFrom-Json
$targetSets = $catalog.cards | Select-Object -ExpandProperty set -Unique
Write-Output "Target sets: $($targetSets -join ', ')"

$sourceUpdated = (Invoke-RestMethod -Uri "https://tcgcsv.com/last-updated.txt" -Headers $h).ToString().Trim()

$groups = (Invoke-RestMethod -Uri "https://tcgcsv.com/tcgplayer/$categoryId/groups" -Headers $h).results
$prices = [ordered]@{}

foreach ($abbr in $targetSets) {
  $group = $groups | Where-Object { $_.abbreviation -eq $abbr } | Select-Object -First 1
  if (-not $group) { Write-Warning "No TCGCSV group for set $abbr"; continue }
  $gid = $group.groupId

  $products = (Invoke-RestMethod -Uri "https://tcgcsv.com/tcgplayer/$categoryId/$gid/products" -Headers $h).results
  Start-Sleep -Milliseconds 150
  $priceRows = (Invoke-RestMethod -Uri "https://tcgcsv.com/tcgplayer/$categoryId/$gid/prices" -Headers $h).results
  Start-Sleep -Milliseconds 150

  # productId|subType -> marketPrice
  $priceMap = @{}
  foreach ($pr in $priceRows) { $priceMap["$($pr.productId)|$($pr.subTypeName)"] = $pr.marketPrice }

  $count = 0
  foreach ($p in $products) {
    $numExt = $p.extendedData | Where-Object { $_.name -eq "Number" } | Select-Object -First 1
    if (-not $numExt) { continue }  # skip sealed / non-cards
    $numPart = ($numExt.value -split "/")[0].Trim()
    if (-not $numPart) { continue }
    # TCGplayer marks signature cards with '*'; our catalog uses an 's' suffix.
    $numPart = $numPart -replace '\*', 's'
    $id = "$abbr-$numPart"
    $normal = $priceMap["$($p.productId)|Normal"]
    $foil = $priceMap["$($p.productId)|Foil"]
    if ($null -eq $normal -and $null -eq $foil) { continue }
    $prices[$id] = [ordered]@{
      normal = if ($null -ne $normal) { [math]::Round([double]$normal, 2) } else { $null }
      foil   = if ($null -ne $foil) { [math]::Round([double]$foil, 2) } else { $null }
    }
    $count++
  }
  Write-Output "$abbr (group $gid): $count priced cards"
}

$payload = [ordered]@{
  generatedAt   = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd")
  source        = "tcgcsv.com (TCGplayer Market Price)"
  sourceUpdated = $sourceUpdated
  currency      = "USD"
  count         = $prices.Count
  prices        = $prices
}

$dest = Join-Path $root "public/prices/prices.json"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
$payload | ConvertTo-Json -Depth 5 | Set-Content -Path $dest -Encoding UTF8
Write-Output "Wrote $($prices.Count) prices -> $dest (source updated $sourceUpdated)"
