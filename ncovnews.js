/**
 * ncovnews.js 
 * 
 * @author CKylinMC
 * @description 一个用于实时获取武汉疫情最新信息并展示的js。新闻源来自360。
 * @version 1.5
 */
var ncovnews_ver = "1.5";

String.prototype.replaceAll = function(s1, s2) {
    return this.replace(new RegExp(s1, "gm"), s2);
}

function getncovnewsDom() {
    var el = document.querySelector("#ncovnews");
    if (!el) {
        console.error("没有找到数据容器");
        return false;
    }
    return el;
}

function newCity(name, dia, sus, cur, die, extra) {
    var city = document.createElement("li");
    city.className = extra?"ncovnews-city "+extra:"ncovnews-city";
    city.innerHTML = "<span class='ncovnews-invs'>!return!</span><div class='ncovnews-datablock'><b>" + name + "</b></div> <span class='ncovnews-invs'>-&nbsp;</span><div class='ncovnews-datablock'><span class='ncovnews-invs'>确诊&nbsp;</span><span class='ncovnews-dia'>" + dia + "</span>&nbsp;例</div> <div class='ncovnews-datablock'><span class='ncovnews-invs'>疑似&nbsp;</span><span class='ncovnews-sus'>" + sus + "</span>&nbsp;例</div> <div class='ncovnews-datablock'><span class='ncovnews-invs'>治愈&nbsp;</span><span class='ncovnews-cur'>" + cur + "</span>&nbsp;例</div> <div class='ncovnews-datablock'><span class='ncovnews-invs'>死亡&nbsp;</span><span class='ncovnews-die'>" + die + "</span>&nbsp例</div>";
    return city;
}

function getNowStr() {
    var a = new Date();
    var year = a.getYear() + 1900;
    var month = a.getMonth() + 1;
    var day = a.getDate();
    var h = a.getHours();
    if (h < 10) h = "0" + h;
    var m = a.getMinutes();
    if (m < 10) m = "0" + m;
    var s = a.getSeconds();
    if (s < 10) s = "0" + s;
    return year + "年" + month + "月" + day + "日 " + h + ":" + m + ":" + s;
}

window.ncovnews_Lastdata = null;

function doGetWuhanNews() {
    var tip = document.querySelector("#ncovnews-refreshBtn");
    if (tip) tip.innerHTML = "正在刷新...";
    var url = "https://arena.360.cn/api/service/data/ncov-live-3";
    fetch(url)
        .then(response => response.json(),err=>{
            var el = getncovnewsDom();
            if (!el) {
                return;
            }
            
            var tip = document.querySelector("#ncovnews-refreshBtn");
            if (tip) tip.innerHTML = "<font color=red>刷新失败 (-1)</font>";
            else el.innerHTML = "<center><font color=red>获取疫情信息失败 (-1)</font><br><small><font color=grey>请确保您的访问地点在大陆</font></small></center>";
        })
        .then((res) => {
            var el = getncovnewsDom();
            if (!el) {
                return;
            }
            if (res.success !== true) {
                var tip = document.querySelector("#refreshWH");
                if (tip) tip.innerHTML = "<font color=red>刷新失败 (-2)</font>";
                else el.innerHTML = "<center><font color=red>获取疫情信息失败 (-2)</font><br><small><font color=grey>信息源不可用</font></small></center>";
                return;
            }
        	if(window.ncovnews_Lastdata==null) window.ncovnews_Lastdata = res;
            el.innerHTML = "<div id='refreshWH'>刷新于 " + getNowStr() + "<div>";
            var d = res.data.detail;
            var ld = window.ncovnews_Lastdata.data.detail;
            var t = res.data.total;
            var lt = window.ncovnews_Lastdata.data.total;
            var title = document.createElement("li");
    		title.className = "ncovnews-title";
    		title.style.listStyle = "none";
			title.innerHTML = "<div class='ncovnews-datablock'><b>地区</b></div> <div class='ncovnews-datablock'>确诊</div> <div class='ncovnews-datablock'>疑似</div> <div class='ncovnews-datablock'>治愈</div> <div class='ncovnews-datablock'>死亡</div>";
			el.appendChild(title);
            var totalel = newCity("<span class='ncovnews-big'>共计</span>"
            	,t.diagnosed==lt.diagnosed ? t.diagnosed : t.diagnosed + wh_c(t.diagnosed-lt.diagnosed)
            	,t.suspected==lt.suspected ? t.suspected : t.suspected + wh_c(t.suspected-lt.suspected)
            	,t.cured==lt.cured ? t.cured : t.cured + wh_c(t.cured-lt.cured)
            	,t.died==lt.died ? t.died : t.died + wh_c(t.died-lt.died)
            	,"ncovnews-totalline"
            );
            totalel.style.listStyle="none";
            el.appendChild(totalel);
            // var ul = document.createElement("ul");
            var ul = document.createElement("div");
            ul.id = "ncovnews-list";
            d.forEach((i, index) => {
            	var li = ld.find((item)=>{return item.id == i.id});
            	if (li==undefined) li = {diagnosed:0,suspected:0,cured:0,died:0};
                ul.appendChild(newCity(
                	i.city, 
                	i.diagnosed == li.diagnosed ? i.diagnosed : i.diagnosed + wh_c(i.diagnosed-li.diagnosed), 
                	i.suspected == li.suspected ? i.suspected : i.suspected + wh_c(i.suspected-li.suspected),  
                	i.cured == li.cured ? i.cured : i.cured + wh_c(i.cured-li.cured),  
                	i.died == li.died ? i.died : i.died + wh_c(i.died-li.died), 
                ));
            });
            el.appendChild(ul);
            
            var shengming = document.createElement("div");
            shengming.id = "ncovnews-shengming";
            shengming.innerHTML = "信息来自 <a href='https://arena.360.cn/docs/wuhan_pneumonia/'>新型全国疫情实时动态(360.cn)</a><br>实时显示脚本来自 <a href='https://blog.ckylin.site/talks/wuhanlinks.md'>CKylin.Blog</a><br>ncovnews.js ver "+ncovnews_ver;
            el.appendChild(shengming);
            var tip = document.querySelector("#refreshWH");
            if (tip) tip.onclick = doGetWuhanNews;
            window.ncovnews_Lastdata = res;
            saveWHData(res);
        })
}

function wh_c(str){
	return " <span class='ncovnews-changes'>(+"+str+")</span>";
}

function doncovnewsRefresh() {
    doGetWuhanNews();
}

function startncovnews() {
    if (!document.querySelector("#ncovnews-styles")) {
        var css = document.createElement("style");
        css.id = "ncovnews-styles";
        css.innerHTML = "#ncovnews{display:block;margin:0 auto;width: max-content;}"+
        	"#refreshWH{text-align:center}#ncovnews-list{list-style:none;}#refreshWH:hover{color:grey;}" +
        	".ncovnews-city:hover{background:rgba(0,0,0,.18)}"+
        	".ncovnews-totalline *{font-size:x-large;margin-top:12px;margin-bottom:12px;}"+
        	".ncovnews-city .ncovnews-big{}"+
        	".ncovnews-invs{display:inline-block;font-size:0;}"+
        	".ncovnews-changes{font-size:smaller;text-decoration:underline}"+
        	".ncovnews-title{margin-top:8px;border-top: solid 3px grey;padding-top:4px}"+
        	".ncovnews-title>*{font-weight:bolder!important;text-align:center!important;}"+
            ".ncovnews-datablock{display:inline-block;min-width: 60px;max-width:120px;width:15vw;text-align:center}"+
            ".ncovnews-dia,.ncovnews-sus,.ncovnews-cur,.ncovnews-die{display:inline-block;font-weight:bold;text-align:center}"+
            ".ncovnews-dia{color:red}" +
            ".ncovnews-sus{color:orange}" +
            ".ncovnews-cur{color:green}"+
            "#ncovnews-shengming{font-size:small;text-align:center}";
        document.head.appendChild(css);
    }
    if (getncovnewsDom() === false) return;
    loadWHData();
    doGetWuhanNews();
    window.ncovnews_loop = setInterval(doncovnewsRefresh, 30000);
    console.log('started');
}

function stopncovnews(){
	if(window.ncovnews_loop!=null){clearInterval(window.ncovnews_loop)}
	console.log('stopped');
}

function saveWHData(data){
	localStorage.setItem("ckncovnewsjs_data",JSON.stringify(data));
}

function loadWHData(){
	var data;
	if(data=localStorage.getItem("ckncovnewsjs_data")){
		try{ 
			window.ncovnews_Lastdata = JSON.parse(data);
		} catch(e) { 
			localStorage.setItem("ckncovnewsjs_data",null);
		}
	}
	return window.ncovnews_Lastdata;
}

function addncovnewsLink() {
    var body_element = document.body;
    var selection;
    selection = window.getSelection();
    
    var locationHref=document.location.href;
    var tip = document.querySelector("#refreshWH");
    var beforeText;
    if (tip)  {
    	beforeText = tip.innerText.replace("刷新","数据更新") + "\r\n\r\n";
    }
    else{
    	beforeText = "数据更新于"+getNowStr() + "\r\n\r\n";
    }
    var appendLink="\r\n\r\n 数据来自["+document.title+"]\r\n"+location.href;
    if (window.clipboardData) { // Internet Explorer
        var copytext = beforeText + selection + appendLink;
        window.clipboardData.setData ("Text", copytext);
        return false;
    } else {
        var copytext = beforeText + selection + appendLink;
        copytext = copytext.replaceAll("\r\n","<br>").replaceAll("!return!","<br>");
        var newdiv = document.createElement('div');
        newdiv.style.position='absolute';
        newdiv.style.left='-99999px';
        body_element.appendChild(newdiv);
        newdiv.innerHTML = copytext;
        selection.selectAllChildren(newdiv);
        // newdiv.select();
        document.execCommand('copy');
        window.setTimeout(function() {
        	body_element.removeChild(newdiv);
        },0);
    }
}

startncovnews();
window.onfocus = startncovnews;
window.onblur = stopncovnews;
var whdom;
if(whdom = getncovnewsDom()){
	whdom.oncopy = addncovnewsLink;
}
