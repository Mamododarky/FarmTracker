param([int]$Port = 8765)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
Write-Host "Serving RS3 Farm Run Tracker at http://127.0.0.1:$Port/"
Write-Host "Local Alt1 install URL: alt1://addapp/http://127.0.0.1:$Port/appconfig.json"
Write-Host "Keep this window open while using the local test app."
python -m http.server $Port --bind 127.0.0.1
