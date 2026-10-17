$ErrorActionPreference = 'Stop'

$siteRoot = Split-Path -Parent $PSScriptRoot
$pages = @('index.html', 'products.html', 'about.html', 'contact.html')
$cssPath = Join-Path $siteRoot 'styles.css'

function Assert-Contains {
  param([string]$Text, [string]$Pattern, [string]$Message)
  if ($Text -notmatch $Pattern) { throw $Message }
}

if (-not (Test-Path $cssPath)) { throw 'styles.css is missing.' }
$css = Get-Content -Raw $cssPath

Assert-Contains $css '@media\s*\(' 'A responsive media query is required.'
Assert-Contains $css 'display:\s*flex' 'Flexbox is required for layout.'
Assert-Contains $css '--color-' 'The CSS should define a reusable color palette.'
Assert-Contains $css 'font-family:' 'Typography styles are required.'
Assert-Contains $css ':focus-visible' 'Visible keyboard focus styling is required.'
Assert-Contains $css 'nav\s*\{[^}]*width:\s*100%' 'Mobile navigation must stay within the viewport width.'
Assert-Contains $css 'nav\s*\{[^}]*min-width:\s*0' 'Mobile navigation must be allowed to shrink within the viewport.'
Assert-Contains $css 'grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)' 'Mobile navigation needs a two-column layout for long link text.'

foreach ($page in $pages) {
  $html = Get-Content -Raw (Join-Path $siteRoot $page)
  Assert-Contains $html '<link[^>]+href="styles\.css"' "$page does not link to styles.css."
  Assert-Contains $html '<a[^>]+href="#main"' "$page is missing a skip-to-content link."
  Assert-Contains $html '<main[^>]+id="main"' "$page is missing the main skip-link target."
  Assert-Contains $html '<nav' "$page is missing its navigation landmark."

  $assetMatches = [regex]::Matches($html, '(?:src|srcset)="([^" ]+)')
  foreach ($assetMatch in $assetMatches) {
    $assetPath = $assetMatch.Groups[1].Value
    if ($assetPath -notmatch '^https?://' -and -not (Test-Path (Join-Path $siteRoot $assetPath))) {
      throw "$page references a missing local asset: $assetPath"
    }
  }
}

$about = Get-Content -Raw (Join-Path $siteRoot 'about.html')
Assert-Contains $about '<track[^>]+kind="captions"' 'The About video needs a captions track.'
if (-not (Test-Path (Join-Path $siteRoot 'Bakery_c\bakery-behind-scenes_c.vtt'))) {
  throw 'The About video captions file is missing.'
}

Write-Output 'Milestone 3 structural checks passed.'
