Set WshShell = CreateObject("WScript.Shell")

' Kill existing node servers to prevent port 3000 collision
WshShell.Run "taskkill /F /IM node.exe", 0, True

' Start the Next.js server silently in the background (0 = hide window)
WshShell.Run "cmd.exe /c npm run dev", 0, False

' Wait 6000 milliseconds (6 seconds) for server to start
WScript.Sleep 6000

' Find Chrome path
chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
Set fso = CreateObject("Scripting.FileSystemObject")
If Not fso.FileExists(chromePath) Then
    chromePath = "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
End If

' Launch Chrome in fully isolated, silent Kiosk mode
WshShell.Run """" & chromePath & """ --user-data-dir=""C:\Chrome_POS"" --kiosk --kiosk-printing http://localhost:3000/cashier", 0, False
