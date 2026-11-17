@echo off
rem Uploads all your changes to GitHub.
rem Double-click this file, or type  .\update-github.bat  in the terminal.
cd /d "%~dp0"
echo Updating GitHub...
echo.
git add -A
git commit -m "Update %date% %time:~0,5%"
git push
echo.
echo Done! Open your repo to check:
git remote get-url origin
echo.
pause
