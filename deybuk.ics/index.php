<?php
header("content-type: application/octet-stream");

$text = file_get_contents("https://raw.githubusercontent.com/ahmedov94/ahmedov94.github.io/master/deybuk.ics/file.txt", false);
$price =  explode("\n", $text);
$count = count($price);
echo "BEGIN:VCALENDAR\nMETHOD:PUBLISH\nVERSION:2.0\nX-WR-CALNAME:Рузнама Сагаси-Дейбук\nX-WR-CALDESC:Creater by Ahmedov\nX-WR-TIMEZONE:Europe/Moscow\n\n";
$days = getdate();
$json = json_encode($days, true);
preg_match('/"yday":(.*),/Us', $json, $matches);

// Сегодняшнее расписание
$yday = $matches[1]+1;
$date = date("Ymd");

$text1 = $price[$yday];
preg_match('/.*—(.*?):(\d*)—(\d*):(\d*)—(\d*):(\d*)—(\d*):(\d*)—(\d*):(\d*)—(\d*):(\d{2})/Us', $text1, $matchess);

$dat = "$date"."$matchess[1]:$matchess[2]";
$p_date = date("Ymj", strtotime("-0 minute", strtotime($dat)));
$p_time = date("His", strtotime("-0 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[3]:$matchess[4]";
$p_date = date("Ymj", strtotime("+30 minute", strtotime($dat)));
$p_time = date("His", strtotime("+30 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время утренного намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[5]:$matchess[6]";
$p_date = date("Ymj", strtotime("-0 minute", strtotime($dat)));
$p_time = date("His", strtotime("-0 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[7]:$matchess[8]";
$p_date = date("Ymj", strtotime("+15 minute", strtotime($dat)));
$p_time = date("His", strtotime("+15 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время обеденного намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[7]:$matchess[8]";
$p_date = date("Ymj", strtotime("-0 minute", strtotime($dat)));
$p_time = date("His", strtotime("-0 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[9]:$matchess[10]";
$p_date = date("Ymj", strtotime("+15 minute", strtotime($dat)));
$p_time = date("His", strtotime("+15 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время после-обеденного намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[9]:$matchess[10]";
$p_date = date("Ymj", strtotime("-0 minute", strtotime($dat)));
$p_time = date("His", strtotime("-0 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[11]:$matchess[12]";
$p_date = date("Ymj", strtotime("+10 minute", strtotime($dat)));
$p_time = date("His", strtotime("+10 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время вечернего намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[11]:$matchess[12]";
$p_date = date("Ymj", strtotime("-0 minute", strtotime($dat)));
$p_time = date("His", strtotime("-0 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[3]:$matchess[4]";
$p_date = date("Ymj", strtotime("+10 minute", strtotime($dat)));
$p_time = date("His", strtotime("+10 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время ночного намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
//////////////////////////////////////////////////////

// Завтрашнее расписание
$yday = $yday+1;
$date = date("Ymd");

$text1 = $price[$yday];
preg_match('/.*—(.*?):(\d*)—(\d*):(\d*)—(\d*):(\d*)—(\d*):(\d*)—(\d*):(\d*)—(\d*):(\d{2})/Us', $text1, $matchess);

$dat = "$date"."$matchess[1]:$matchess[2]";
$p_date = date("Ymj", strtotime("+1440 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1440 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[3]:$matchess[4]";
$p_date = date("Ymj", strtotime("+1470 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1470 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время утренного намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[5]:$matchess[6]";
$p_date = date("Ymj", strtotime("+1440 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1440 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[7]:$matchess[8]";
$p_date = date("Ymj", strtotime("+1455 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1455 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время обеденного намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[7]:$matchess[8]";
$p_date = date("Ymj", strtotime("+1440 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1440 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[9]:$matchess[10]";
$p_date = date("Ymj", strtotime("+1455 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1455 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время после-обеденного намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[9]:$matchess[10]";
$p_date = date("Ymj", strtotime("+1440 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1440 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[11]:$matchess[12]";
$p_date = date("Ymj", strtotime("+1450 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1450 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время вечернего намаза\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
///

$dat = "$date"."$matchess[11]:$matchess[12]";
$p_date = date("Ymj", strtotime("+1440 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1440 minute", strtotime($dat)));

$DTSTART = "$p_date"."T$p_time"."Z";

//$dat = "$date"."$matchess[3]:$matchess[4]";
$p_date = date("Ymj", strtotime("+1450 minute", strtotime($dat)));
$p_time = date("His", strtotime("+1450 minute", strtotime($dat)));

$DTEND = "$p_date"."T$p_time"."Z";

$rand = rand(1111111111111111, 2222222222222222);

echo "BEGIN:VEVENT\nUID:$rand\nDTSTAMP:$DTSTART\nDTSTART;TZID=Europe/Moscow:$DTSTART\nDTEND;TZID=Europe/Moscow:$DTEND\nSUMMARY:Время ночного намаза\nLOCATION:Сагаси Дейбук\nDESCRIPTION:Рузнама для Сагаси Дейбук by Ahmedov\nLOCATION:Сагаси Дейбук\nBEGIN:VALARM\nACTION:DISPLAY\nDWSCRIPTION:Reminder\nTRIGGER:-P\nEND:VALARM\nEND:VEVENT\n\n";
//////////////////////////////////////////////////////
echo "END:VCALENDAR"

?>
