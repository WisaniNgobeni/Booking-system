$ErrorActionPreference = "Stop"
if (-not $env:DATABASE_URL) { throw "DATABASE_URL is required." }
$backupDirectory = if ($env:BACKUP_DIR) { $env:BACKUP_DIR } else { Join-Path (Get-Location) "backups" }
New-Item -ItemType Directory -Force -Path $backupDirectory | Out-Null
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$output = Join-Path $backupDirectory "booking-$timestamp.sql"
$uri = [Uri]$env:DATABASE_URL
$database = $uri.AbsolutePath.TrimStart("/")
$arguments = @("--host=$($uri.Host)", "--port=$($uri.Port)", "--user=$($uri.UserInfo.Split(':')[0])", "--databases", $database, "--result-file=$output")
if ($uri.UserInfo.Contains(':')) { $env:MYSQL_PWD = [Uri]::UnescapeDataString($uri.UserInfo.Split(':')[1]) }
& mysqldump @arguments
if ($LASTEXITCODE -ne 0) { throw "mysqldump failed with exit code $LASTEXITCODE." }
Get-ChildItem $backupDirectory -Filter "*.sql" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 14 | Remove-Item -Force
Write-Output $output
