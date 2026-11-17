@echo off
rem Uploads all your changes to GitHub.
rem Double-click this file, or type  .\update-github.bat  in the terminal.
cd /d "%~dp0"
echo Updating GitHub...
echo.

rem If something changed, give the CSS/JS files a new version (?v=...) in index.html,
rem so browsers load the new files right away instead of old saved copies.
set CHANGED=
for /f "delims=" %%i in ('git status --porcelain') do set CHANGED=1
if not defined CHANGED goto push
powershell -NoProfile -ExecutionPolicy Bypass -Command "$f='index.html'; $t=[IO.File]::ReadAllText($f); $n=[regex]::Replace($t,'\?v=\d+','?v='+(Get-Date -Format yyyyMMddHHmm)); if ($n -ne $t) { [IO.File]::WriteAllText($f,$n,(New-Object Text.UTF8Encoding $false)) }"
git add -A
git commit -m "Update %date% %time:~0,5%"

:push
git push
echo.
echo Done! Your website (updates in about 1 minute):
for /f "tokens=4,5 delims=/." %%a in ('git remote get-url origin') do echo https://%%a.github.io/%%b/
echo.
pause
