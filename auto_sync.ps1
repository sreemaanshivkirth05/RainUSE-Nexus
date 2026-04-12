Write-Host "================================" -ForegroundColor Cyan
Write-Host "RainUSE Nexus - GitHub Auto Sync" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host "Monitoring for remote changes on GitHub every 5 seconds..."
Write-Host "Press Ctrl+C to stop."

while ($true) {
    # Fetch changes silently
    git fetch origin main -q 2>$null
    
    $status = (git status -uno)
    
    # If the local branch is behind the remote, pull
    if ($status -match "Your branch is behind") {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] New commit detected on GitHub! Pulling updates..." -ForegroundColor Yellow
        git pull origin main
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Repository successfully updated." -ForegroundColor Green
    } 
    
    Start-Sleep -Seconds 10
}
