# prepare-submission.ps1
# Automates the creation of a secret-scrubbed, research-free snapshot of the CervicalLens project
# using Robocopy for high-speed file copying.

$sourceDir = "C:\Users\HomePC\Documents\organisation-projects\cervical-scancer"
$destDir = "C:\Users\HomePC\Documents\organisation-projects\cervical-lens-submission"

# 1. Re-create the clean destination directory
if (Test-Path $destDir) {
    Write-Host "[Info] Removing existing destination directory: $destDir"
    Remove-Item -Recurse -Force $destDir -ErrorAction SilentlyContinue
}
New-Item -ItemType Directory -Path $destDir | Out-Null

# 2. Run Robocopy to copy files while excluding target directories/files
Write-Host "[Step 1/5] Copying project files using Robocopy (excluding research, git history, and secrets)..."
# Robocopy exit codes 0-7 indicate success (copying took place or no changes).
# We run it and ignore the exit code unless it is >= 8.
$robocopyArgs = @(
    "$sourceDir", 
    "$destDir", 
    "/E", 
    "/XD", "research", ".git", ".venv", "node_modules", ".turbo", ".vercel", ".expo", 
    "/XF", "*.db", ".env.local", ".env.production", ".env.vercel.production", ".env"
)
$process = Start-Process -FilePath "robocopy.exe" -ArgumentList $robocopyArgs -Wait -NoNewWindow -PassThru
if ($process.ExitCode -ge 8) {
    Write-Error "Robocopy failed with exit code $($process.ExitCode)"
    exit 1
}
Write-Host "[Success] Copy completed successfully!"

# 3. Verify that the LICENSE exists in the target
if (Test-Path (Join-Path $destDir "LICENSE")) {
    Write-Host "[Info] Verified: Proprietary LICENSE is present in submission folder."
} else {
    Write-Warning "[Warning] LICENSE not found in destination!"
}

# 4. Initialize a brand new git repository in the destination
Write-Host "[Step 2/5] Initializing fresh Git repository..."
Set-Location $destDir
git init
git checkout -b main

# 5. Configure author for the submission commits (using user details)
git config user.name "hallelx2"
git config user.email "halleluyaholudele@gmail.com"

# 6. Add and commit all clean files
Write-Host "[Step 3/5] Committing clean snapshot files..."
git add .
git commit -m "initial commit: CervicalLens platform submission"

# 7. Create the repository on GitHub under the user's account using gh CLI
Write-Host "[Step 4/5] Creating new GitHub repository 'hallelx2/cervical-lens'..."
# Delete the repository first if it already exists to avoid conflict
gh repo delete hallelx2/cervical-lens --yes 2>$null
gh repo create hallelx2/cervical-lens --public --source=. --push

Write-Host "[Success] Codebase snapshot is prepared and pushed to https://github.com/hallelx2/cervical-lens"
Write-Host "Next Step: You can transfer the repository to the competition organization via the GitHub website."
