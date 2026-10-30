const fs = require('fs');

let php = fs.readFileSync('public/api/finance.php', 'utf8').replace(/\r\n/g, '\n');

// In purgeDummyFinanceRecords:
const targetPurge = `$pdo->exec("DELETE FROM finance_credit_notes WHERE data_json LIKE '%rayan-corp-uae%'");`;
const replacementPurge = `$pdo->exec("DELETE FROM finance_credit_notes");`;

php = php.replace(targetPurge, replacementPurge);

// In loadFinanceDb right before returning:
const targetReturn = `recalculateAllFinanceBalances($data);
                    syncToRelationalTables($pdo, $data);
                    return $data;`;

const replacementReturn = `// Force empty credit notes as requested by user
                    $data['credit_notes'] = [];
                    if ($pdo) {
                        try { $pdo->exec("DELETE FROM finance_credit_notes"); } catch (Exception $e) {}
                    }
                    recalculateAllFinanceBalances($data);
                    syncToRelationalTables($pdo, $data);
                    return $data;`;

php = php.replace(targetReturn, replacementReturn);

fs.writeFileSync('public/api/finance.php', php, 'utf8');
console.log('Successfully updated credit note purge in finance.php');
