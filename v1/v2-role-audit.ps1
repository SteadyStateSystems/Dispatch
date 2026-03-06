$base = 'http://127.0.0.1:3000'

function Test-Post($path, $body, $role) {
  try {
    $json = $body | ConvertTo-Json -Depth 8
    $r = Invoke-WebRequest -UseBasicParsing -Method Post -Uri ($base + $path) -Headers @{ 'Content-Type'='application/json'; 'x-m3t-role'=$role } -Body $json -TimeoutSec 8
    [pscustomobject]@{ path=$path; role=$role; status=$r.StatusCode; ok=$true }
  } catch {
    $status = $_.Exception.Response.StatusCode.value__
    [pscustomobject]@{ path=$path; role=$role; status=$status; ok=$false; msg=$_.Exception.Message }
  }
}

$projName = 'AUDIT-' + (Get-Date -Format 'yyyyMMdd-HHmmss')

$tests = @()
$tests += Test-Post '/addProject' @{ technician='Chris'; name=$projName; address='addr'; location='loc'; scope='scope'; updatedBy='audit' } 'tech'
$tests += Test-Post '/addProject' @{ technician='Chris'; name=($projName+'-pm'); address='addr'; location='loc'; scope='scope'; updatedBy='audit' } 'project_manager'
$tests += Test-Post '/admin/techs' @{ name='Audit Tech'; role='technician'; active=$true; updatedBy='audit' } 'project_manager'
$tests += Test-Post '/admin/techs' @{ name='Audit Tech'; role='technician'; active=$true; updatedBy='audit' } 'system_admin'
$tests += Test-Post '/deleteItem' @{ tech='Chris'; project='Project A'; type='task'; name='NonExistent'; updatedBy='audit' } 'tech'
$tests += Test-Post '/deleteItem' @{ tech='Chris'; project='Project A'; type='task'; name='NonExistent'; updatedBy='audit' } 'project_manager'

$tests | Format-Table -AutoSize
