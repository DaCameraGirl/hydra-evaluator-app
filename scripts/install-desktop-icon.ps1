$ErrorActionPreference = "Stop"

$appRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$launcher = Join-Path $appRoot "scripts\start-hydra-evaluator.ps1"
$icon = Join-Path $appRoot "assets\hydra-icon.ico"
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktop "Hydra Evaluator.lnk"
$powerShell = Join-Path $env:SystemRoot "System32\WindowsPowerShell\v1.0\powershell.exe"

if (-not (Test-Path -LiteralPath $launcher)) {
  throw "Launcher script not found: $launcher"
}

$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $powerShell
$shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$launcher`""
$shortcut.WorkingDirectory = $appRoot
$shortcut.Description = "Start Hydra Evaluator"

if (Test-Path -LiteralPath $icon) {
  $shortcut.IconLocation = "$icon,0"
}

$shortcut.Save()
Write-Host "Created Desktop shortcut: $shortcutPath"
