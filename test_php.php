<?php
// Let's test if the syntax of api.php is valid
exec("php -l public/api.php", $output, $return_var);
if ($return_var !== 0) {
    echo "Syntax errors in public/api.php:\n";
    echo implode("\n", $output);
} else {
    echo "Syntax OK";
}
