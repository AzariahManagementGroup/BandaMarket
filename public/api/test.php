<?php
$m = new mysqli('localhost', 'root', '', 'camemark_db');
$res = $m->query('DESCRIBE products');
while($r = $res->fetch_assoc()) {
    print_r($r);
}
?>
