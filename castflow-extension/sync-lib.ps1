# Copies castflow.js/css from the main library and patches the UMD wrapper
# for extension injection (avoids AMD loaders like RequireJS on target pages).

$src = "..\castflow"
$dst = ".\lib"

Copy-Item "$src\castflow.js"  "$dst\castflow.js"
Copy-Item "$src\castflow.css" "$dst\castflow.css"

# Patch: replace UMD wrapper with direct global assignment
$js = Get-Content "$dst\castflow.js" -Raw
$umd = @'
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CastFlow = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
'@
$fix = @'
(function (root, factory) {
  // Extension build: always assign to global to avoid AMD loaders (e.g. Azure Portal's RequireJS)
  root.CastFlow = factory();
}(typeof self !== 'undefined' ? self : this, function () {
'@

if ($js.Contains($umd)) {
  $js = $js.Replace($umd, $fix)
  Set-Content "$dst\castflow.js" $js -NoNewline
  Write-Host "[OK] Copied and patched castflow.js"
} else {
  Write-Host "[OK] Copied castflow.js (already patched or UMD not found)"
}

Write-Host "[OK] Copied castflow.css"
