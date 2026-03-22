# ============================================
# Obsidian MCP Integration Setup for Claude Desktop
# Run this in PowerShell (right-click → Run with PowerShell)
# ============================================

Write-Host "=== Step 1: Installing mcp-obsidian globally ===" -ForegroundColor Cyan
npm install -g mcp-obsidian --registry https://registry.npmjs.org
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed. Check that Node.js is installed and npm is in PATH." -ForegroundColor Red
    Write-Host "If Mullvad VPN is active, try disconnecting and re-running." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "mcp-obsidian installed successfully." -ForegroundColor Green

Write-Host ""
Write-Host "=== Step 2: Finding mcp-obsidian path ===" -ForegroundColor Cyan
$npmRoot = (npm root -g).Trim()
$mcpObsidianPath = Join-Path $npmRoot "mcp-obsidian" "dist" "index.js"
if (-not (Test-Path $mcpObsidianPath)) {
    Write-Host "ERROR: Could not find mcp-obsidian at $mcpObsidianPath" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "Found mcp-obsidian at: $mcpObsidianPath" -ForegroundColor Green

Write-Host ""
Write-Host "=== Step 3: Updating Claude Desktop config ===" -ForegroundColor Cyan
$configPath = "C:\Users\hall3\AppData\Roaming\Claude\claude_desktop_config.json"

# Ensure directory exists
$configDir = Split-Path $configPath -Parent
if (-not (Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    Write-Host "Created config directory: $configDir" -ForegroundColor Yellow
}

# Read existing config or create empty one
if (Test-Path $configPath) {
    $configContent = Get-Content $configPath -Raw
    Write-Host "Existing config found. Reading..." -ForegroundColor Green
    try {
        $config = $configContent | ConvertFrom-Json
    } catch {
        Write-Host "ERROR: Existing config is malformed JSON. Backing up and creating new." -ForegroundColor Red
        Copy-Item $configPath "$configPath.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        $config = [PSCustomObject]@{}
    }
} else {
    Write-Host "No existing config found. Creating new one." -ForegroundColor Yellow
    $config = [PSCustomObject]@{}
}

# Ensure mcpServers property exists
if (-not ($config.PSObject.Properties.Name -contains "mcpServers")) {
    $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue ([PSCustomObject]@{})
}

# Build the mcp-obsidian entry
$obsidianEntry = [PSCustomObject]@{
    command = "node"
    args = @($mcpObsidianPath)
    env = [PSCustomObject]@{
        OBSIDIAN_API_KEY = "66fd397fe69472d7c625edac03b108166a8a4ee297e068e8cd58c72e1d5527e0"
        OBSIDIAN_API_URL = "https://127.0.0.1:27124/"
    }
}

# Add or update the mcp-obsidian entry (preserving all other entries)
if ($config.mcpServers.PSObject.Properties.Name -contains "mcp-obsidian") {
    Write-Host "Updating existing mcp-obsidian entry..." -ForegroundColor Yellow
    $config.mcpServers."mcp-obsidian" = $obsidianEntry
} else {
    Write-Host "Adding new mcp-obsidian entry..." -ForegroundColor Green
    $config.mcpServers | Add-Member -NotePropertyName "mcp-obsidian" -NotePropertyValue $obsidianEntry
}

# Write config with pretty formatting
$jsonOutput = $config | ConvertTo-Json -Depth 10
$jsonOutput | Set-Content $configPath -Encoding UTF8
Write-Host "Config written to: $configPath" -ForegroundColor Green

Write-Host ""
Write-Host "=== Step 4: Displaying final mcpServers block ===" -ForegroundColor Cyan
Write-Host ""
$finalConfig = Get-Content $configPath -Raw | ConvertFrom-Json
$finalConfig.mcpServers | ConvertTo-Json -Depth 10
Write-Host ""

Write-Host "=== Step 5: CLAUDE.md ===" -ForegroundColor Cyan
$claudeMdPath = "C:\Users\hall3\Downloads\Aethertrace\CLAUDE.md"
if (Test-Path $claudeMdPath) {
    Write-Host "CLAUDE.md already exists at $claudeMdPath" -ForegroundColor Green
} else {
    Write-Host "WARNING: CLAUDE.md not found at $claudeMdPath — it should have been created already." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Green
Write-Host "  SETUP COMPLETE" -ForegroundColor Green
Write-Host "  Now RESTART Claude Desktop for changes to take effect." -ForegroundColor Yellow
Write-Host "============================================" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
