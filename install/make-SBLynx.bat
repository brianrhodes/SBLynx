@echo off
if "%1" == "" goto usage
rem if exist .\CameraTracker-%1%2.exe goto exists
if exist .\CameraTracker-%1%2.exe del .\CameraTracker-%1%2.exe

xcopy "..\bin\Debug\CameraTracker.exe" /d /y
if ERRORLEVEL 1 pause

xcopy "..\CameraCommands.txt" /d /y
if ERRORLEVEL 1 pause
xcopy "..\TrackResults.lss" /d /y
if ERRORLEVEL 1 pause
xcopy ..\..\CommonSource\Eula.txt /d /y
if ERRORLEVEL 1 pause
xcopy ..\bin\Debug\IsoLynxClassLib.dll /d /y
if ERRORLEVEL 1 pause
xcopy ..\bin\Debug\IsoLynxLCM.dll /d /y
if ERRORLEVEL 1 pause
xcopy ..\bin\Debug\lcm.dll /d /y
if ERRORLEVEL 1 pause
xcopy ..\AppIcon.ico /d /y
if ERRORLEVEL 1 pause
xcopy "..\..\TeamInfo\Defaults\Standard.Lures.txt" /d /y
if ERRORLEVEL 1 pause
xcopy "..\CameraTrackerVersions.txt" /d /y
if ERRORLEVEL 1 pause

"\Program Files (x86)\NSIS\makensis" /DVERSION=%1 /DVERSION_BETA=%2 /V2 camtracker.nsi
goto done
:exists
echo *** CameraTracker-%1%2.exe exists. Please delete first. ***
goto done
:usage
echo Usage: make-camtracker version [beta]
:done
