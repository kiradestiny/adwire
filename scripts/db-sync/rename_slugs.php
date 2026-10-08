<?php
/**
 * ADWire Blog — slug rename (evergreen URLs)
 * 把 blog_posts.slug 由「含年份」改成「去年份」。只 UPDATE 已存在的舊 slug，永不 INSERT／DELETE。
 * 預設 dry-run；--apply 才寫入，寫入前備份。
 * CLI only。用法：
 *   php rename_slugs.php            # dry-run
 *   php rename_slugs.php --apply    # 寫入（先備份）
 */
if (php_sapi_name() !== 'cli') { http_response_code(403); exit("CLI only\n"); }
$APPLY = in_array('--apply', $argv, true);
$HERE  = __DIR__;

$cfgs = [$HERE.'/../admin/includes/config.php',$HERE.'/admin/includes/config.php',dirname($HERE).'/admin/includes/config.php'];
$cfg=null; foreach($cfgs as $c){ if(is_file($c)){$cfg=$c;break;} }
if(!$cfg) exit("❌ 找不到 admin/includes/config.php\n");
require_once $cfg;
$c = get_defined_constants(true)['user'] ?? [];
$pick = function(array $n) use($c){ foreach($n as $x) if(isset($c[$x])) return $c[$x]; return null; };
$host=$pick(['DB_HOST','DB_SERVER','DBHOST','MYSQL_HOST','DB_HOSTNAME']);
$name=$pick(['DB_NAME','DB_DATABASE','DBNAME','MYSQL_DATABASE']);
$user=$pick(['DB_USER','DB_USERNAME','DBUSER','MYSQL_USER']);
$pass=$pick(['DB_PASS','DB_PASSWORD','DBPASS','MYSQL_PASSWORD']);
if(!$host||!$name||!$user) exit("❌ 無法判斷 DB 憑證\n");
$pdo = new PDO("mysql:host=$host;dbname=$name;charset=utf8mb4",$user,$pass,[PDO::ATTR_ERRMODE=>PDO::ERRMODE_EXCEPTION,PDO::ATTR_DEFAULT_FETCH_MODE=>PDO::FETCH_ASSOC]);
echo "✅ DB 連線成功（host=$host, db=$name）\n";

$map = json_decode(file_get_contents($HERE.'/slug_map.json'), true);
if(!is_array($map)) exit("❌ slug_map.json 讀取失敗\n");

$sel = $pdo->prepare("SELECT * FROM blog_posts WHERE slug = ? LIMIT 1");
$plan=[]; $skip=[];
foreach($map as $old=>$new){
    $sel->execute([$old]); $row=$sel->fetch();
    if(!$row){ $skip[]="$old（後台不存在，略過）"; continue; }
    $sel->execute([$new]);
    if($sel->fetch()){ $skip[]="$old → $new（新 slug 已存在，略過）"; continue; }
    $plan[$old]=['row'=>$row,'new'=>$new];
}
echo "\n── 計劃 ────────────────────\n";
foreach($plan as $o=>$x) echo "  • $o\n      → {$x['new']}  (id={$x['row']['id']}, title=".mb_substr($x['row']['title'],0,24)."…)\n";
if($skip){ echo "\n【略過】\n"; foreach($skip as $s) echo "  - $s\n"; }
echo "\n合計：".count($plan)." 條會改；".count($skip)." 條略過\n";

if(!$APPLY){ echo "\n🔎 DRY-RUN，未寫入。加 --apply 才執行。\n"; exit(0); }
if(!$plan){ echo "\n✅ 無需更新。\n"; exit(0); }

$bkDir=getenv('HOME').'/db_backups';
if(!is_dir($bkDir)&&!@mkdir($bkDir,0755,true)&&!is_dir($bkDir)) exit("❌ 無法建立備份目錄\n");
$ts=date('Ymd-His'); $bf=$bkDir."/blog_posts_slugrename_{$ts}.json";
$body=json_encode(array_map(fn($x)=>$x['row'],$plan), JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
if(file_put_contents($bf,$body)!==strlen($body)) exit("❌ 備份失敗\n");
if(json_decode(file_get_contents($bf),true)===null) exit("❌ 備份回讀失敗\n");
echo "\n💾 已備份 ".count($plan)." 篇 → $bf\n";

$upd=$pdo->prepare("UPDATE blog_posts SET slug = :new WHERE slug = :old AND id = :id");
$chk=$pdo->prepare("SELECT slug FROM blog_posts WHERE id = ? LIMIT 1");
$ok=0; $fail=null;
foreach($plan as $o=>$x){
    try{
        $upd->execute(['new'=>$x['new'],'old'=>$o,'id'=>$x['row']['id']]);
        $chk->execute([$x['row']['id']]); $got=$chk->fetch();
        if(($got['slug']??'')===$x['new']){ $ok++; echo "  ✅ $o → {$x['new']}\n"; }
        else { $fail="$o（回讀得 ".($got['slug']??'?')."）"; break; }
    }catch(Throwable $e){ $fail="$o（".$e->getMessage()."）"; break; }
}
echo "\n── 結果 ──\n  成功： $ok / ".count($plan)."\n";
if($fail){ echo "  ❌ 於 $fail 停止。備份：$bf\n"; exit(1); }
echo "✅ slug rename 完成。\n";