# Bước 1: Tạo bản sao lưu của style.css và script.js
$date = Get-Date -Format "yyyyMMddHHmmss"
Copy-Item -Path "style.css" -Destination "style_backup_$date.css"
Copy-Item -Path "script.js" -Destination "script_backup_$date.js"

# Bước 2: Cập nhật version trong file index.html
$htmlContent = Get-Content -Path "index.html" -Raw
$newVersion = Get-Random -Minimum 100 -Maximum 999
$htmlContent = $htmlContent -replace '(style\.css\?v=)[\d\.]+', "style.css?v=$newVersion"
$htmlContent = $htmlContent -replace '(script\.js\?v=)[\d\.]+', "script.js?v=$newVersion"
$htmlContent | Set-Content -Path "index.html"

# Bước 3: Cập nhật phiên bản trong service-worker.js
$swContent = Get-Content -Path "service-worker.js" -Raw
$swContent = $swContent -replace "(CACHE_VERSION = ')[^']+(')", "`${1}v$newVersion`$2"
$swContent | Set-Content -Path "service-worker.js"

Write-Host "Đã cập nhật thành công! Version mới là: $newVersion"
Write-Host "Hãy sử dụng git để đẩy các thay đổi lên GitHub Pages:"
Write-Host "git add ."
Write-Host "git commit -m `"Cập nhật website với version $newVersion`""
Write-Host "git push origin main"