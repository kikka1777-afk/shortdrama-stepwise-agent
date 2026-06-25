param(
  [string]$SkillName = "shortdrama-stepwise-agent",
  [string]$TargetRoot = "$env:USERPROFILE\.codex\skills"
)

$ErrorActionPreference = "Stop"

$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$target = Join-Path $TargetRoot $SkillName

if (!(Test-Path -LiteralPath (Join-Path $source "SKILL.md"))) {
  throw "SKILL.md not found. Run this script from the skill repository."
}

New-Item -ItemType Directory -Force -Path $TargetRoot | Out-Null

$sourceFull = [IO.Path]::GetFullPath($source).TrimEnd('\')
$targetFull = [IO.Path]::GetFullPath($target).TrimEnd('\')

if ($sourceFull -ieq $targetFull) {
  Write-Host "Skill is already installed at: $target"
} else {
  if (Test-Path -LiteralPath $target) {
    Remove-Item -LiteralPath $target -Recurse -Force
  }
  Copy-Item -LiteralPath $source -Destination $target -Recurse -Force
  $gitDir = Join-Path $target ".git"
  if (Test-Path -LiteralPath $gitDir) {
    Remove-Item -LiteralPath $gitDir -Recurse -Force
  }
  Write-Host "Installed skill to: $target"
}

Write-Host ""
Write-Host "Restart Codex or open a new thread, then invoke:"
Write-Host "  Use `$shortdrama-stepwise-agent to generate a short-drama project step by step."
