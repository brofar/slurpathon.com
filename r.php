<?php
function Redirect($url, $permanent = false)
{
    header('Location: ' . $url, true, $permanent ? 301 : 302);
    exit();
}

if(isset($_GET['id'])) {
    $dest = "";

    switch ($_GET['id']) {
        case "incentives":
            $dest = "https://docs.google.com/spreadsheets/d/1DNsy2cTnbZipC6ni3DKvtT4d8nAJbhHBdjzWTf-Bp4k";
        break;

        case "schedule":
            $dest = "https://horaro.org/slurpathon2021/schedule";
        break;

        case "prizes":
            $dest = "https://docs.google.com/spreadsheets/d/1S2gHHAfmolCtjVtHPDqNWqRbUK-BykzO-kfO_a-xf6w";
        break;
        
        case "donate":
        default:
            $dest = "https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&participantID=476026#donate";
        break;

    }

    Redirect($dest);
}
?>