<?
include_once("$DOCUMENT_ROOT/lib/_includes.php");

$store=new Store();
$store->admin=1;

foreach($cat as $ordr=>$cid){
	if(!$cid)continue;
	$store->setCategory(array(ordr=>($ordr+1)),$cid);
}

location($refer);
?>