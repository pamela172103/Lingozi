<#
.SYNOPSIS
  Starts the whole local stack in one window: SQL Server and Mailpit (Docker), the API and the web app.
.DESCRIPTION
  Local development only (ADR 0002, ADR 0005). Reads .env from the repository root, starts SQL Server and Mailpit if they are not running (Docker or native),
  starts the API and the web app in the background (logs in logs\), waits until both answer, then prints the links.
  Stop everything with scripts\stop-dev.ps1.
.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts\dev.ps1
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

# 1. Environment from .env (the API and the web app both need it).
if (-not (Test-Path '.env')) { throw 'Missing .env. Copy .env.example to .env and fill it in first.' }
Get-Content '.env' | ForEach-Object {
  if ($_ -match '^\s*([^#=\s][^=]*?)\s*=\s*(.*)$') {
    [Environment]::SetEnvironmentVariable($matches[1], $matches[2].Trim('"'), 'Process')
  }
}

# 2. Database (SQL Server on 1433) and mail capture (Mailpit on 8025).
#    Each one may already run on this PC (installed SQL Server, or mailpit.exe). Docker is used only when it is needed and available.
function Test-Port([int]$port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $async = $client.BeginConnect('127.0.0.1', $port, $null, $null)
    return $async.AsyncWaitHandle.WaitOne(1000) -and $client.Connected
  } catch { return $false } finally { $client.Close() }
}
$hasDocker = [bool](Get-Command docker -ErrorAction SilentlyContinue)
$startedContainers = @()

if (-not (Test-Port 1433)) {
  if (-not $hasDocker) {
    throw 'SQL Server chưa chạy ở localhost:1433. Hoặc bật SQL Server đã cài trên máy, hoặc cài Docker Desktop (https://www.docker.com/products/docker-desktop/) rồi chạy lại.'
  }
  docker compose up -d --wait sqlserver
  if ($LASTEXITCODE -ne 0) { throw 'Không bật được SQL Server bằng Docker. Mở Docker Desktop và đợi trạng thái "Running".' }
  $startedContainers += 'sqlserver'
}

if (-not (Test-Port 8025)) {
  if ($hasDocker) {
    docker compose up -d mailpit
    if ($LASTEXITCODE -eq 0) { $startedContainers += 'mailpit' }
  } elseif (Get-Command mailpit -ErrorAction SilentlyContinue) {
    New-Item -ItemType Directory -Force -Path 'logs' | Out-Null
    Start-Process -FilePath 'mailpit' -WindowStyle Hidden -RedirectStandardOutput (Join-Path $root 'logs\mailpit.log') -RedirectStandardError (Join-Path $root 'logs\mailpit.err.log') | Out-Null
  } else {
    Write-Host 'Mailpit chưa chạy (localhost:8025). Mở mailpit.exe trước, hoặc cài Docker để script tự bật.' -ForegroundColor Yellow
  }
}
@{ containers = $startedContainers } | ConvertTo-Json | Set-Content '.dev-containers.json'

# 3. Previous run still alive? Stop it first so ports are free.
if (Test-Path '.dev-pids.json') { & "$PSScriptRoot\stop-dev.ps1" -KeepContainers }

New-Item -ItemType Directory -Force -Path 'logs' | Out-Null

# 4. API (ASP.NET Core) in the background. taskkill /T later removes the whole process tree.
$api = Start-Process -FilePath 'dotnet' -ArgumentList 'run', '--project', 'src\Lingozi.Api', '--launch-profile', 'http' `
  -WorkingDirectory (Join-Path $root 'apps\api') -WindowStyle Hidden -PassThru `
  -RedirectStandardOutput (Join-Path $root 'logs\api.log') -RedirectStandardError (Join-Path $root 'logs\api.err.log')

# 5. Web app (Next.js dev server) in the background.
$web = Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', 'npx pnpm@10.28.0 --filter @lingozi/web dev' `
  -WorkingDirectory $root -WindowStyle Hidden -PassThru `
  -RedirectStandardOutput (Join-Path $root 'logs\web.log') -RedirectStandardError (Join-Path $root 'logs\web.err.log')

@{ api = $api.Id; web = $web.Id } | ConvertTo-Json | Set-Content '.dev-pids.json'

# 6. Wait until both answer (the first start can take a minute while the API builds and the web app compiles).
function Wait-Http($url, $seconds) {
  $deadline = (Get-Date).AddSeconds($seconds)
  while ((Get-Date) -lt $deadline) {
    try { Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3 | Out-Null; return $true } catch { Start-Sleep -Seconds 2 }
  }
  return $false
}
$apiOk = Wait-Http 'http://localhost:5080/health/ready' 180
$webOk = Wait-Http 'http://localhost:3000/auth/login' 180

Write-Host ''
if ($apiOk) { Write-Host '  API     http://localhost:5080  (log: logs\api.log)' -ForegroundColor Green } else { Write-Host '  API chưa sẵn sàng. Xem logs\api.err.log' -ForegroundColor Red }
if ($webOk) { Write-Host '  Web     http://localhost:3000  (log: logs\web.log)' -ForegroundColor Green } else { Write-Host '  Web chưa sẵn sàng. Xem logs\web.err.log' -ForegroundColor Red }
if (Test-Port 8025) { Write-Host '  Mailpit http://localhost:8025  (mã đăng nhập nằm ở đây)' -ForegroundColor Green } else { Write-Host '  Mailpit chưa chạy: không nhận được mã đăng nhập' -ForegroundColor Yellow }
Write-Host ''
Write-Host '  Dừng toàn bộ: powershell -ExecutionPolicy Bypass -File scripts\stop-dev.ps1'
if ($webOk) { Start-Process 'http://localhost:3000/library' }
