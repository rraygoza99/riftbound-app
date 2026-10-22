$ErrorActionPreference = "Stop"

# Scrapes the public Piltover Archive card library (RSC payload) to build a
# local Riftbound catalog: { id, name, set, number, variant }.
# Card art itself is loaded at runtime from the same CDN the app already uses.

# Walk pages until one adds no new cards (the library grows with each set).
$maxPages = 80
# The card grid lives in an escaped RSC payload, e.g. cards/OGN-001.webp\",\"alt\":\"Blazing Scorcher\"
$rx = [regex]'cards/(?<id>[A-Z0-9]+-\d{3}[a-z]?)\.webp\\",\\"alt\\":\\"(?<name>[^"\\]+)\\"'
$map = [ordered]@{}
$failures = 0

for ($p = 1; $p -le $maxPages; $p++) {
  $url = "https://piltoverarchive.com/cards?page=$p"
  try {
    $html = (Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 40).Content
  } catch {
    Write-Warning "page $p failed: $($_.Exception.Message)"
    $failures++
    if ($failures -ge 3) { Write-Warning "Piltover Archive unreachable, stopping scrape"; break }
    continue
  }
  $failures = 0
  $count = 0
  foreach ($m in $rx.Matches($html)) {
    $id = $m.Groups['id'].Value
    if ($map.Contains($id)) { continue }
    $name = $m.Groups['name'].Value
    $map[$id] = $name
    $count++
  }
  Write-Output "page $p -> +$count (total $($map.Count))"
  if ($count -eq 0) { break }
  Start-Sleep -Milliseconds 300
}

$dest = Join-Path (Split-Path $PSScriptRoot -Parent) "public/cards/catalog.json"

# If the scrape got nothing (site outage), keep the previous catalog instead of
# wiping it.
if ($map.Count -eq 0 -and (Test-Path $dest)) {
  Write-Warning "No cards scraped; starting from the existing catalog"
  foreach ($c in (Get-Content $dest -Raw | ConvertFrom-Json).cards) { $map[$c.id] = $c.name }
}

# Fill in any set Piltover Archive didn't return (outage, or a set it hasn't
# listed yet) from TCGCSV, which numbers cards the same way. Card art for these
# still comes from the Piltover CDN by id.
$tcgcsvSets = @("OGN", "OGS", "SFD", "UNL", "VEN", "RAD")
$h = @{ "User-Agent" = "RiftMate/1.0 (+https://buymeacoffee.com/sonsofthemoon)" }
$groups = (Invoke-RestMethod -Uri "https://tcgcsv.com/tcgplayer/89/groups" -Headers $h).results
foreach ($abbr in $tcgcsvSets) {
  if (@($map.Keys | Where-Object { $_ -like "$abbr-*" }).Count -gt 0) { continue }
  $group = $groups | Where-Object { $_.abbreviation -eq $abbr } | Select-Object -First 1
  if (-not $group) { Write-Warning "No TCGCSV group for set $abbr"; continue }
  $products = (Invoke-RestMethod -Uri "https://tcgcsv.com/tcgplayer/89/$($group.groupId)/products" -Headers $h).results
  Start-Sleep -Milliseconds 150

  # TCGplayer sometimes misnumbers a Signature; it always shares its number
  # with the matching Overnumbered printing, so prefer that one's number.
  $numberByName = @{}
  foreach ($p in $products) {
    $n = ($p.extendedData | Where-Object { $_.name -eq "Number" } | Select-Object -First 1).value
    if ($n) { $numberByName[$p.name] = ($n -split "/")[0].Trim() }
  }

  $added = 0
  foreach ($p in $products) {
    $num = $numberByName[$p.name]
    if (-not $num) { continue }
    if ($num -match '\*$') {
      $over = $numberByName[($p.name -replace 'Signature\)$', 'Overnumbered)')]
      if ($over -and $over -match '^\d{3}$') { $num = "$over*" }
    }
    $num = $num -replace '\*', 's'
    if ($num -notmatch '^\d{3}[a-z]?$') { continue }  # runes, tokens, specials
    $id = "$abbr-$num"
    if ($map.Contains($id)) { continue }
    $map[$id] = ($p.name -replace '\s*\([^)]*\)$', '').Trim()
    $added++
  }
  Write-Output "$abbr from TCGCSV -> +$added (total $($map.Count))"
}

if ($map.Count -eq 0) { throw "No cards found; leaving the existing catalog untouched" }

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

New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
$payload | ConvertTo-Json -Depth 5 | Set-Content -Path $dest -Encoding UTF8
Write-Output "Wrote $($sorted.Count) cards -> $dest"
