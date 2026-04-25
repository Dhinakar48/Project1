$filePath = 'c:\Users\MAKESH\my-app\electronics-store\frontend\src\AdminDashboard\AdminDashboard.jsx'
$lines = Get-Content $filePath

# Line 280 is index 279 (0-based): replace the button without onClick
$lines[279] = '                                      <button onClick={() => { setActiveTab(''orders''); setShowNotifDropdown(false); }} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-700 transition-colors">'

# Line 281 is index 280: text content — keep "View all orders" without special char
$lines[280] = '                                         View all orders'

$lines | Set-Content $filePath
Write-Host "Done"
