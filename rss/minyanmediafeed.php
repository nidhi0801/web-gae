<?
header('Content-type: text/xml');
include("$D_R/layout/dbconnect.php");
echo "<?xml version=\"1.0\"?>"; ?>
<rss xmlns:media="http://search.yahoo.com/mrss" xmlns:av="http://www.searchvideo.com/schemas/av/1.0" version="2.0">
<channel>
<title>Minyanville</title>
<description>The Trusted Choice for the Wall Street Voice</description>
<link>http://www.minyanville.com</link>
<?
$sql_videos = "SELECT * FROM mvtv where approved='1' and publish_time < '".mysqlNow()."' and aol='1' ORDER BY publish_time DESC";
$results_videos = exec_query($sql_videos);
foreach($results_videos as $id=>$videoitem){
	$patterns = "/�/";
	$replacements = "'";
	$videoitem['description']=preg_replace($patterns, $replacements, $videoitem['description']);
	$patternTitle = "/�/";
	$replacementTitle = "'";
	$videoitem['title']=preg_replace($patternTitle, $replacementTitle, $videoitem['title']);
	$order = "�";
	$replace = "...";
	$videoitem['description'] = str_replace($order, $replace, $videoitem['description']);
	$orderTitle = "�";
	$replaceTitle = "...";
	$videoitem['title'] = str_replace($orderTitle, $replaceTitle, $videoitem['title']);
?>
<item>
<!-- MRSS required fields -->
<title><?=htmlentities($videoitem['title']);?></title>
<description><?=htmlentities($videoitem['description']);?></description>
<link>http://video.aol.com/partner/minyanville/title/<?=$videoitem['id']?></link>
<pubDate><?=date('D, j M Y H:i:s',strtotime($videoitem['publish_time'])) ?> EST</pubDate>
<!-- GUID (GUID usually is equivalent to PID. Passed to player in its entirety, no slashes or
other special characters in the URL are allowed)-->
<guid isPermaLink="false"><?=$videoitem['id']?></guid>
<!-- Category - category/show name/episode name - see MRSS details for additional valid
categories -->
<media:category scheme="http://search.yahoo.com/mrss/category_schema">Business/Hoofy &amp; Boo/<?=htmlentities($videoitem['title']);?></media:category>
<av:show season="1">Hoofy &amp; Boo</av:show><!-- TMS id required if TV asset -->
<av:episode number="<?=$videoitem['id']?>"><?=htmlentities($videoitem['title']);?></av:episode> <!-- TMS id required if TV asset -->
<!-- expression = full for full episodes and clip for short form content-->
<media:content expression="full" medium="video" lang="en" duration="<?=$videoitem['duration']?>" />
<!-- Thumbnail (4:3 aspect ratio, required)-->
<media:thumbnail url="<?=$videoitem['thumbfile']?>"/>
<!-- Recommended fields -->
<media:copyright>2007 Minyanville Publishing and Multimedia, LLC. All Rights Reserved</media:copyright> <!-- copyright (showed if
presented, recommended) -->
<media:credit role="distribution company">Minyanville</media:credit> <!-- Credit -->
<media:keywords><?=htmlentities($videoitem['keywords'])?></media:keywords> <!--keywords / tags -->
<!-- truveo auto pruning fields -->
<media:player url="<?=$HTPFX.$HTHOST?>/mvtv/player/mvtv_videoplayer_autoplay.swf"/>
</item>
<?
}
?>
</channel>
</rss>