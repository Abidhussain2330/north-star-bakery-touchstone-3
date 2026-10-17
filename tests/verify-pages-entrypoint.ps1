$ErrorActionPreference = 'Stop'

$repositoryRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$entryPoint = Join-Path $repositoryRoot 'index.html'
$sitePath = 'North_Star_Bakery_HTML_Files/'

if (-not (Test-Path -LiteralPath $entryPoint)) {
  throw 'GitHub Pages publishes the repository root, which must contain index.html.'
}

$html = Get-Content -Raw -LiteralPath $entryPoint
if ($html -notmatch [regex]::Escape($sitePath)) {
  throw 'The root entry point must send visitors to the North Star Bakery site directory.'
}

if ($html -notmatch 'http-equiv="refresh"' -or $html -notmatch '<a\s+href=') {
  throw 'The root entry point must provide both an automatic redirect and a usable fallback link.'
}

Write-Output 'GitHub Pages entry-point check passed.'
