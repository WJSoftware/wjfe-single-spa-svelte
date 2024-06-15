$distPath = "./dist"
$typesPath = Resolve-Path $distPath/wjfe-single-spa-svelte.d.ts
$indexPath = Resolve-Path $distPath/index.d.ts
Get-Content $indexPath | Where-Object { $_ -ne '' } | Add-Content -Path $typesPath -Encoding UTF8
Remove-Item $indexPath
