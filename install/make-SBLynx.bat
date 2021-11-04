@echo off
if "%1" == "" goto usage
if exist .\SBLynx-%1%2.exe del .\SBLynx-%1%2.exe

xcopy "..\node_modules" "SBLynx\node_modules\" /d /y /s
if ERRORLEVEL 1 pause
xcopy "..\public" "SBLynx\public\" /d /y /s
if ERRORLEVEL 1 pause
xcopy "..\src" "SBLynx\src\" /d /y /s
if ERRORLEVEL 1 pause
xcopy "..\templates" "SBLynx\templates\" /d /y /s
if ERRORLEVEL 1 pause
xcopy ..\config.json SBLynx\ /d /y
if ERRORLEVEL 1 pause
xcopy ..\package.json SBLynx\ /d /y
if ERRORLEVEL 1 pause
xcopy ..\package-lock.json SBLynx\ /d /y
if ERRORLEVEL 1 pause
xcopy .\node-v14.17.5-x64.msi SBLynx\ /d /y
if ERRORLEVEL 1 pause
xcopy ..\..\install\Eula.txt /d /y
if ERRORLEVEL 1 pause

"\Program Files (x86)\NSIS\makensis" /DVERSION=%1 /DVERSION_BETA=%2 /V2 SBLynx.nsi
goto done
:exists
echo *** SBLynx-%1%2.exe exists. Please delete first. ***
goto done
:usage
echo Usage: make-SBLynx version [beta]
:done
