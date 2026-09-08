Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"
$root = Split-Path $PSScriptRoot -Parent
$srcDir = Join-Path $root "store/screenshots"
$outDir = Join-Path $root "store/tablet-screenshots"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$targetW = 1440; $targetH = 2560
Get-ChildItem $srcDir -Filter "0*.png" | ForEach-Object {
  $src = [System.Drawing.Image]::FromFile($_.FullName)
  $bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($src, 0, 0, $targetW, $targetH)
  $g.Dispose(); $src.Dispose()
  $dest = Join-Path $outDir $_.Name
  $bmp.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "upscaled $($_.Name)"
}
Remove-Item (Join-Path $srcDir "test-home.png") -ErrorAction SilentlyContinue
