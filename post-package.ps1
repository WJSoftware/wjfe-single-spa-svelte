$distPath = "./dist"
$indexPath = Resolve-Path $distPath/index.d.ts
$typesPath = Resolve-Path $distPath/wjfe-single-spa-svelte.d.ts
Get-Content $indexPath | Where-Object { $_ -ne '' } | Add-Content -Path $typesPath -Encoding UTF8
Remove-Item $indexPath
