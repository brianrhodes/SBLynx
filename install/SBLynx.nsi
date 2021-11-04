
;--------------------------------
; Includes

!include "mui2.nsh"
!include "FileFunc.nsh"

;--------------------------------
; Setup
;
; VERSION and VERSION_BETA must be defined by the caller of the script.
;
; Pages you can omit:
;   OMIT_WARNING
;   OMIT_FINISH
;

!ifndef VERSION & VERSION_BETA
	!error "VERSION and VERSION_BETA must be defined by the caller."
!endif

!define APPLICATION "SBLynx"
!define EXECUTABLE "SBLynx"
!define DEFAULTDIR "$PROGRAMFILES\SBLynx"
!define COMPANY "Lynx System Developers, Inc."

!define INSTALLER "${APPLICATION}-${VERSION}${VERSION_BETA}.exe"
!define UNINSTALLER "uninstall-${APPLICATION}.exe"

; Name of the installer.
Name "${APPLICATION}"
; Location of the installer executable.
OutFile ".\${INSTALLER}"

; Default installation directory.
InstallDir "${DEFAULTDIR}\${APPLICATION}"
; Registry key to check for previous directory choice.
InstallDirRegKey HKCU "SOFTWARE\${COMPANY}\${APPLICATION}\${VERSION}" "Install_Dir"
; Request application privileges for Windows Vista
RequestExecutionLevel admin
; Use the good one.
SetCompressor /SOLID lzma
; Not sure what this does, but it seems to be standard.
XPStyle on

!insertmacro GetSize

;--------------------------------
; Installer Pages

!define MUI_WELCOMEPAGE_TEXT "$_CLICK"
!insertmacro MUI_PAGE_WELCOME

!insertmacro MUI_PAGE_LICENSE EULA.txt

!ifndef OMIT_WARNING
	!define MUI_PAGE_HEADER_TEXT "Important Information"
	!define MUI_PAGE_HEADER_SUBTEXT "Please read carefully."
	!define MUI_LICENSEPAGE_TEXT_TOP "*** WARNING *** WARNING *** WARNING ***"
	!define MUI_LICENSEPAGE_TEXT_BOTTOM " "
	!define MUI_LICENSEPAGE_BUTTON "$(^NextBtn)"
; 	!insertmacro MUI_PAGE_LICENSE readme.txt
!endif

!insertmacro MUI_PAGE_DIRECTORY

!insertmacro MUI_PAGE_INSTFILES

;--------------------------------
; Uninstaller Pages

!insertmacro MUI_UNPAGE_WELCOME

!insertmacro MUI_UNPAGE_CONFIRM

!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_UNPAGE_FINISH


;--------------------------------
; Language

!insertmacro MUI_LANGUAGE "English"

;-------------------------------
; Check .NET Framework version

!macro CheckAndInstallDotNet FrameworkVersion
    Var /GLOBAL dotNetUrl
    Var /GLOBAL dotNetReadableVersion

    !define DOTNET47_URL            "http://go.microsoft.com/fwlink/?LinkId=825321"
    !define DOTNET40Full_URL        "http://www.microsoft.com/downloads/info.aspx?na=41&srcfamilyid=0a391abd-25c1-4fc0-919f-b21f31ab88b7&srcdisplaylang=en&u=http%3a%2f%2fdownload.microsoft.com%2fdownload%2f9%2f5%2fA%2f95A9616B-7A37-4AF6-BC36-D6EA96C8DAAE%2fdotNetFx40_Full_x86_x64.exe"
    !define DOTNET40Client_URL	"http://www.microsoft.com/downloads/info.aspx?na=41&srcfamilyid=e5ad0459-cbcc-4b4f-97b6-fb17111cf544&srcdisplaylang=en&u=http%3a%2f%2fdownload.microsoft.com%2fdownload%2f5%2f6%2f2%2f562A10F9-C9F4-4313-A044-9C94E0A8FAC8%2fdotNetFx40_Client_x86_x64.exe"

    ${If} ${FrameworkVersion} == "47"
        StrCpy $dotNetUrl ${DOTNET47_URL}
        StrCpy $dotNetReadableVersion "4.7"
    ${ElseIf} ${FrameworkVersion} == "40Full"
        StrCpy $dotNetUrl ${DOTNET40Full_URL}
        StrCpy $dotNetReadableVersion "4.0 Full"
    ${ElseIf} ${FrameworkVersion} == "40Client"
        StrCpy $dotNetUrl ${DOTNET40Client_URL}
        StrCpy $dotNetReadableVersion "4.0 Client"
    ${EndIf}

    ClearErrors
    ReadRegDWORD $0 HKLM "SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" "Release"
    IfErrors NotDetected
;
; NOTE - if the .NET framework version changes, so does the value below in the if statement
;
    ${If} $0 >= 460798
        DetailPrint "Microsoft .NET Framework $dotNetReadableVersion is installed ($0)"
    ${Else}
    NotDetected:
        MessageBox MB_YESNO|MB_ICONQUESTION ".NET Framework $dotNetReadableVersion + is required for ${APPLICATION}, \
            do you want to launch the web installer? This requires a valid internet connection." IDYES InstallDotNet IDNO Cancel 
        Cancel:
            MessageBox MB_ICONEXCLAMATION "To install ${APPLICATION}, Microsoft's .NET Framework v$dotNetReadableVersion \
                (or higher) must be installed. Cannot proceed with the installation!"
            Abort

        ; Install .NET4.7.
        InstallDotNet:
            DetailPrint "Downloading Microsoft .NET Framework $dotNetReadableVersion"
            NSISDL::download $dotNetURL "$TEMP\dotnetfx.exe"
            DetailPrint "Installing Microsoft .NET Framework $dotNetReadableVersion"
            SetDetailsPrint listonly
            ExecWait '$TEMP\dotnetfx.exe /q /c:"install /q"'

            DetailPrint "Completed .NET Framework install/update. Removing .NET Framework installer."
            Delete "$TEMP\dotnetfx.exe"
            DetailPrint ".NET Framework installer removed."
    ${EndIf}
!macroend

;--------------------------------
; Sections

Section "${APPLICATION} (required)"

	SectionIn RO

	; Set output path to the installation directory.
	SetOutPath "$INSTDIR"

        ; !insertmacro CheckAndInstallDotNet 47

        ; Configuration Files
        File "${EXECUTABLE}\*.json"

        ; Node.js application files
	SetOutPath $INSTDIR\node_modules
        File /r "${EXECUTABLE}\node_modules"
	SetOutPath $INSTDIR\public
        File /r "${EXECUTABLE}\public"
	SetOutPath $INSTDIR\src
        File /r "${EXECUTABLE}\src"
	SetOutPath $INSTDIR\templates
        File /r "${EXECUTABLE}\templates"

        ; Install Node.JS
        File "${EXECUTABLE}\node-v14.17.5-x64.msi"
        ExecWait "$INSTDIR\node-v14.17.5-x64.msi /quiet /norestart"

        ; Reset current dir back to normal
	SetOutPath "${DEFAULTDIR}\${APPLICATION}"

	; Create "Start Programs" shortcut.
	CreateShortCut "$SMPROGRAMS\${APPLICATION}.lnk" "$INSTDIR\${EXECUTABLE}.exe" "" "$INSTDIR\${EXECUTABLE}.exe" 0

        ; Create Desktop Shortcut
        CreateShortCut "$DESKTOP\${APPLICATION}.lnk" "$INSTDIR\${EXECUTABLE}.exe" ""

	; Write the installation path into the registry.
	WriteRegStr HKCU "SOFTWARE\${COMPANY}\${APPLICATION}\${VERSION}" "Install_Dir" "$INSTDIR"

	; Write the uninstall info into the registry.
	WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "DisplayName" "${APPLICATION}"
	WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "DisplayIcon" "$INSTDIR\AppIcon.ico"
	WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "Publisher" "${COMPANY}"
        WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "DisplayVersion" "${VERSION}${VERSION_BETA}"
	WriteRegStr HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "UninstallString" "$\"$INSTDIR\${UNINSTALLER}$\""

	${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
 	IntFmt $0 "0x%08X" $0
	WriteRegDWORD HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "EstimatedSize" "$0"

	WriteRegDWORD HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "NoModify" 1
	WriteRegDWORD HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}" "NoRepair" 1
	WriteUninstaller "$INSTDIR\${UNINSTALLER}"

SectionEnd


;--------------------------------
; Uninstaller

Section "Uninstall"

        ; Configuration Files
        Delete "$INSTDIR\*.json"

        ; Node.js application files
	;SetOutPath $INSTDIR\node_modules
        ;File /r "${EXECUTABLE}\node_modules"
	;SetOutPath $INSTDIR\public
        ;File /r "${EXECUTABLE}\public"
	;SetOutPath $INSTDIR\src
        ;File /r "${EXECUTABLE}\src"
	;SetOutPath $INSTDIR\templates
        ;File /r "${EXECUTABLE}\templates"

        ; Install Node.JS
        ;File "${EXECUTABLE}\node-v14.17.5-x64.msi"
        ;ExecWait "$INSTDIR\node-v14.17.5-x64.msi /quiet /norestart"

	; Program Files
	;Delete "$INSTDIR\${EXECUTABLE}.exe"
        ;Delete "$INSTDIR\AppIcon.ico"
        ;Delete "$INSTDIR\CameraCommands.txt"
	; Scoreboard scripts
	;SetOutPath "${IsoLynxDir}\FinishLynx"
	;Delete "TrackResults.lss"
	; DLL's
	;Delete "$INSTDIR\IsoLynxClassLib.dll"
	;Delete "$INSTDIR\IsoLynxLCM.dll"
	;Delete "$INSTDIR\LCM.dll"
        ; Versions File
        ;Delete "$INSTDIR\CameraTrackerVersions.txt"

        ; Teams 
	;SetOutPath "${IsolynxDir}\TeamInfo"
        ;Delete "Standard.Lures.txt" 

	; Remove uninstaller.
	;Delete "$INSTDIR\${UNINSTALLER}"

	; Remove shortcuts.
	;Delete "$SMPROGRAMS\${APPLICATION}.lnk"
        ;Delete "$DESKTOP\${APPLICATION}.lnk"

	; Remove uninstall info.
	DeleteRegKey HKCU "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\${APPLICATION}"
	; Remove version specific info.
	DeleteRegKey HKCU "SOFTWARE\${COMPANY}\${APPLICATION}\${VERSION}"
	; Remove hierarchy if empty.
	DeleteRegKey /ifempty HKCU "SOFTWARE\${COMPANY}\${APPLICATION}"
	DeleteRegKey /ifempty HKCU "SOFTWARE\${COMPANY}"

	; Remove main directory.
	RMDir "$INSTDIR"

SectionEnd
