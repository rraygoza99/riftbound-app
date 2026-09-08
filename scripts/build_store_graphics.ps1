Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

$root = Split-Path $PSScriptRoot -Parent
$logoPath = Join-Path $root "src/assets/version_2.png"
$outDir = Join-Path $root "store"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

# ---- 1) Play Store icon: 512x512 ----
$src = [System.Drawing.Image]::FromFile($logoPath)
$icon = New-Object System.Drawing.Bitmap 512, 512
$g = [System.Drawing.Graphics]::FromImage($icon)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.DrawImage($src, 0, 0, 512, 512)
$g.Dispose()
$iconPath = Join-Path $outDir "play-icon-512.png"
$icon.Save($iconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$icon.Dispose()
Write-Output "icon -> $iconPath"

# ---- 2) Feature graphic: 1024x500 ----
$W = 1024; $H = 500
$fg = New-Object System.Drawing.Bitmap $W, $H
$g = [System.Drawing.Graphics]::FromImage($fg)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Diagonal brand gradient background (dark navy -> blue/violet)
$rect = New-Object System.Drawing.Rectangle 0, 0, $W, $H
$c1 = [System.Drawing.ColorTranslator]::FromHtml("#0a0a1a")
$c2 = [System.Drawing.ColorTranslator]::FromHtml("#1b1550")
$grad = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, $c1, $c2, 135.0
$g.FillRectangle($grad, $rect)

# Soft blue glow behind the logo
$glow = New-Object System.Drawing.Drawing2D.GraphicsPath
$glow.AddEllipse(40, 60, 420, 420)
$pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush $glow
$pgb.CenterColor = [System.Drawing.Color]::FromArgb(90, 41, 121, 255)
$pgb.SurroundColors = @([System.Drawing.Color]::FromArgb(0, 41, 121, 255))
$g.FillPath($pgb, $glow)

# Logo (rounded) on the left
$logoSize = 300
$logoX = 90; $logoY = [int](($H - $logoSize) / 2)
$g.DrawImage($src, $logoX, $logoY, $logoSize, $logoSize)

# Title + subtitle on the right
$titleFont = New-Object System.Drawing.Font "Segoe UI", 82, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
$subFont = New-Object System.Drawing.Font "Segoe UI", 32, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
$white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$muted = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(190, 255, 255, 255))
$textX = 470
$g.DrawString("RiftMate", $titleFont, $white, $textX, 178)
$g.DrawString("Riftbound Score Tracker", $subFont, $muted, ($textX + 4), 290)

$src.Dispose()
$g.Dispose()
$fgPath = Join-Path $outDir "feature-graphic-1024x500.png"
$fg.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
$fg.Dispose()
Write-Output "feature -> $fgPath"
