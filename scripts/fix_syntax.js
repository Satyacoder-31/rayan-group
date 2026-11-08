import fs from 'fs';

let php = fs.readFileSync('public/api/finance.php', 'utf8');

// Fix 1
const bug1 = `                    try {
                        $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();
                        if ($rawDel) {
                            $curDelArr = json_decode($rawDel, true) ?: [];
                            $deletedVpList = array_values(array_filter($curDelArr, function($x) use ($canonicalVpExempt) {
                                return !isset($canonicalVpExempt[strtolower($x)]);
                            }));
                        }
                    } catch (Exception $e) {}
                        if ($rawDel) $deletedVpList = json_decode($rawDel, true) ?: [];
                    } catch (Exception $e) {}`;

const fix1 = `                    try {
                        $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();
                        if ($rawDel) {
                            $curDelArr = json_decode($rawDel, true) ?: [];
                            $deletedVpList = array_values(array_filter($curDelArr, function($x) use ($canonicalVpExempt) {
                                return !isset($canonicalVpExempt[strtolower($x)]);
                            }));
                        }
                    } catch (Exception $e) {}`;

// Fix 2
const bug2 = `        try {
            $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();
            if ($rawDel) {
                $curDelArr = json_decode($rawDel, true) ?: [];
                $deletedVpList = array_values(array_filter($curDelArr, function($x) use ($canonicalVpExempt) {
                    return !isset($canonicalVpExempt[strtolower($x)]);
                }));
            }
        } catch (Exception $e) {}
            if ($rawDel) $deletedVpList = json_decode($rawDel, true) ?: [];
        } catch (Exception $e) {}`;

const fix2 = `        try {
            $rawDel = $pdo->query("SELECT setting_val FROM finance_settings WHERE setting_key = 'deleted_vendor_payments'")->fetchColumn();
            if ($rawDel) {
                $curDelArr = json_decode($rawDel, true) ?: [];
                $deletedVpList = array_values(array_filter($curDelArr, function($x) use ($canonicalVpExempt) {
                    return !isset($canonicalVpExempt[strtolower($x)]);
                }));
            }
        } catch (Exception $e) {}`;

console.log('bug1 found:', php.includes(bug1));
console.log('bug2 found:', php.includes(bug2));

php = php.replace(bug1, fix1);
php = php.replace(bug2, fix2);

fs.writeFileSync('public/api/finance.php', php, 'utf8');
fs.writeFileSync('dist/api/finance.php', php, 'utf8');
console.log('Successfully fixed syntax errors in public/api/finance.php and dist/api/finance.php!');
