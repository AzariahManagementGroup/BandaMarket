<?php require_once "public/api/config.php"; echo "BEFORE_EMAIL\n"; send_html_email("info@azariahmg.com", "Test", "Test body"); echo "\nAFTER_EMAIL\n"; ?>
