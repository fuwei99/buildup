@echo off
title Gemini Unified Server
echo ==================================================
echo       Gemini Unified Proxy Server Launcher
echo ==================================================
echo.
echo Starting server...
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b
)

:: Run the server
node unified-server.js

echo.
echo Server stopped.
pause
