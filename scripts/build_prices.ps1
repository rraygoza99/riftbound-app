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
# Card-count denominator ("197/298" -> 298) -> set, so promo printings that
# only carry a number can be tied back to the set they reprint.
$denomSet = @{}
$catalogIds = @{}
foreach ($c in $catalog.cards) { $catalogIds[$c.id] = $true }

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

  # TCGplayer sometimes misnumbers a Signature; it always shares its number
  # with the matching Overnumbered printing, so prefer that one's number.
  $numberByName = @{}
  foreach ($p in $products) {
    $n = ($p.extendedData | Where-Object { $_.name -eq "Number" } | Select-Object -First 1).value
    if ($n) { $numberByName[$p.name] = ($n -split "/")[0].Trim() }
  }

  $count = 0
  foreach ($p in $products) {
    $numExt = $p.extendedData | Where-Object { $_.name -eq "Number" } | Select-Object -First 1
    if (-not $numExt) { continue }  # skip sealed / non-cards
    $numPart = ($numExt.value -split "/")[0].Trim()
    if (-not $numPart) { continue }
    $denom = (($numExt.value -split "/") | Select-Object -Skip 1 -First 1)
    if ($denom -and -not $denomSet.ContainsKey($denom.Trim())) { $denomSet[$denom.Trim()] = $abbr }
    if ($numPart -match '\*$') {
      $over = $numberByName[($p.name -replace 'Signature\)$', 'Overnumbered)')]
      if ($over -and $over -match '^\d{3}$') { $numPart = "$over*" }
    }
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

# Promo printings (Organized Play, store promos, judge cards) are separate
# TCGplayer products with their own, often much higher, prices. A promo whose
# number matches a variant in our catalog (e.g. OGN-197b "GG EZ" Teemo) prices
# that variant; every other promo becomes its own tradeable entry.
$promoGroups = @("OPP", "PR", "JDG")
$promos = New-Object System.Collections.ArrayList
foreach ($abbr in $promoGroups) {
  $group = $groups | Where-Object { $_.abbreviation -eq $abbr } | Select-Object -First 1
  if (-not $group) { Write-Warning "No TCGCSV group for promo set $abbr"; continue }
  $gid = $group.groupId

  $products = (Invoke-RestMethod -Uri "https://tcgcsv.com/tcgplayer/$categoryId/$gid/products" -Headers $h).results
  Start-Sleep -Milliseconds 150
  $priceRows = (Invoke-RestMethod -Uri "https://tcgcsv.com/tcgplayer/$categoryId/$gid/prices" -Headers $h).results
  Start-Sleep -Milliseconds 150

  $priceMap = @{}
  foreach ($pr in $priceRows) { $priceMap["$($pr.productId)|$($pr.subTypeName)"] = $pr.marketPrice }

  $mapped = 0
  $added = 0
  foreach ($p in $products) {
    $numExt = $p.extendedData | Where-Object { $_.name -eq "Number" } | Select-Object -First 1
    if (-not $numExt) { continue }
    $parts = $numExt.value -split "/"
    $numPart = ($parts[0].Trim()) -replace '\*', 's'
    if (-not $numPart) { continue }
    $baseSet = $null
    if ($parts.Count -gt 1) { $baseSet = $denomSet[$parts[1].Trim()] }

    $normal = $priceMap["$($p.productId)|Normal"]
    $foil = $priceMap["$($p.productId)|Foil"]
    $entry = [ordered]@{
      normal = if ($null -ne $normal) { [math]::Round([double]$normal, 2) } else { $null }
      foil   = if ($null -ne $foil) { [math]::Round([double]$foil, 2) } else { $null }
    }
    $hasPrice = ($null -ne $normal) -or ($null -ne $foil)

    # Lettered promo numbers (197b) that exist in the catalog price that variant.
    $catalogId = if ($baseSet) { "$baseSet-$numPart" } else { $null }
    if ($numPart -match '[a-z]$' -and $catalogId -and $catalogIds.ContainsKey($catalogId)) {
      if ($hasPrice) { $prices[$catalogId] = $entry; $mapped++ }
      continue
    }

    $promoId = "PROMO-$($p.productId)"
    if ($hasPrice) { $prices[$promoId] = $entry }
    [void]$promos.Add([ordered]@{
      id     = $promoId
      name   = $p.name
      set    = $abbr
      code   = if ($baseSet) { "$baseSet-$numPart" } else { $numPart }
      number = [int]($numPart -replace '\D', '')
    })
    $added++
  }
  Write-Output "$abbr (group $gid): $mapped catalog variants priced, $added promo entries"
}

$payload = [ordered]@{
  generatedAt   = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd")
  source        = "tcgcsv.com (TCGplayer Market Price)"
  sourceUpdated = $sourceUpdated
  currency      = "USD"
  count         = $prices.Count
  prices        = $prices
  promos        = $promos
}

$dest = Join-Path $root "public/prices/prices.json"
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
$payload | ConvertTo-Json -Depth 5 | Set-Content -Path $dest -Encoding UTF8
Write-Output "Wrote $($prices.Count) prices -> $dest (source updated $sourceUpdated)"
