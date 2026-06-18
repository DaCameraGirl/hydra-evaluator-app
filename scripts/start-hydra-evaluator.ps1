param(
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"

$appRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$appFolderName = Split-Path -Leaf $appRoot
$serveRoot = Split-Path -Parent $appRoot
$port = if ($env:HYDRA_EVALUATOR_PORT) { [int]$env:HYDRA_EVALUATOR_PORT } else { 8765 }
$url = "http://127.0.0.1:$port/$appFolderName/index.html"

function Test-LocalPort {
  param([int]$Port)

  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $result = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
    $connected = $result.AsyncWaitHandle.WaitOne(250, $false)
    if ($connected) {
      $client.EndConnect($result)
    }
    $client.Close()
    return $connected
  } catch {
    return $false
  }
}

if (-not (Test-LocalPort -Port $port)) {
  $python = Get-Command python -ErrorAction SilentlyContinue
  $py = Get-Command py -ErrorAction SilentlyContinue

  if ($python) {
    $args = "-m http.server $port --bind 127.0.0.1"
    Start-Process -FilePath $python.Source -ArgumentList $args -WorkingDirectory $serveRoot -WindowStyle Hidden | Out-Null
  } elseif ($py) {
    $args = "-3.11 -m http.server $port --bind 127.0.0.1"
    Start-Process -FilePath $py.Source -ArgumentList $args -WorkingDirectory $serveRoot -WindowStyle Hidden | Out-Null
  } else {
    Start-Process (Join-Path $appRoot "index.html")
    exit 0
  }

  Start-Sleep -Milliseconds 800
}

if ($NoOpen) {
  Write-Host $url
} else {
  Start-Process $url
}
