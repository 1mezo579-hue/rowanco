Set WshShell = CreateObject("WScript.Shell")

' Find Chrome path
chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(chromePath) Then
    chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
End If

' Launch Chrome directly to Vercel in fully isolated, silent Kiosk mode
WshShell.Run """" & chromePath & """ --user-data-dir=""C:\Chrome_POS"" --kiosk --kiosk-printing https://rowanco.vercel.app/cashier", 0, False
