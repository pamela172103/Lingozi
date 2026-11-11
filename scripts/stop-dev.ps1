<#
.SYNOPSIS
  Stops the API and the web app started by scripts\dev.ps1, and the Docker containers.
.PARAMETER KeepContainers
  Leave SQL Server and Mailpit running (used by dev.ps1 when it restarts).
#>
param([switch]$KeepContainers)
$ErrorActionPreference = 'Continue'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

if (Test-Path '.dev-pids.json') {
  $pids = Get-Content '.dev-pids.json' | ConvertFrom-Json
  foreach ($id in @($pids.api, $pids.web)) {
    # /T also stops child processes (dotnet run starts the API as a child; npx starts node).
    if ($id) { & taskkill.exe /PID $id /T /F 2>$null | Out-Null }
  }
  Remove-Item '.dev-pids.json' -ErrorAction SilentlyContinue
  Write-Host 'API and web app stopped.'
} else {
  Write-Host 'No running API or web app recorded.'
}

if (-not $KeepContainers) {
  docker compose stop sqlserver mailpit | Out-Null
  Write-Host 'SQL Server and Mailpit stopped (data is kept).'
}
