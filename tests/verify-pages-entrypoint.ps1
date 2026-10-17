$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent $PSScriptRoot
$entryPoint = Join-Path $repositoryRoot 'index.html'

if (-not (Test-Path -LiteralPath $entryPoint)) {
  throw 'GitHub Pages publishes the repository root, which must contain index.html.'
}

$html = Get-Content -Raw -LiteralPath $entryPoint
if ($html -match 'http-equiv="refresh"' -or $html -match 'Continue to North Star Bakery') {
  throw 'The root page must be the bakery homepage, not a redirect or intermediate page.'
}

if ($html -notmatch '<header>' -or $html -notmatch '<nav' -or $html -notmatch '<main') {
  throw 'The root page must include the bakery homepage structure and navigation.'
}

if ($html -notmatch 'href="styles\.css"' -or $html -notmatch 'src="Bakery_c/bakery-logo_c\.png"') {
  throw 'The root page must load its shared stylesheet and bakery assets from the publishing root.'
}

Write-Output 'GitHub Pages homepage check passed.'
