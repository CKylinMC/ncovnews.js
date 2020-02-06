/**
 * ncovdata.js 
 * 
 * @author CKylinMC
 * @description 一个用于实时获取武汉疫情最新信息并展示的js。新闻源来自360。
 * @version 1.6
 */
function ncovData(el,settings) {
    if (el instanceof String) { 
        el = document.querySelector(el);
    }
	if(!el instanceof HTMLDivElement){
		console.error("[ncovdata] Parameter must be a DIV element!");
		return false;
    }
    const that = this;
	this.root = el;
    this.ncovnews_ver = "1.6 beta";
    this.ncovnews_Lastdata = null;

    if (!(settings instanceof Object)) {
        settings = {};
    }
    this.autoRefresh = settings.autoRefresh===undefined?true:!!settings.autoRefresh; 
    this.refreshOnFocus = settings.refreshOnFocus === undefined ? true : !!settings.refreshOnFocus; 
    this.refreshTime = settings.refreshTime === undefined ? 60000 : parseInt(settings.refreshTime);
    this.handleCopyEvent = settings.handleCopyEvent === undefined ? true : !!settings.handleCopyEvent;
    this.appendOnCopy = settings.appendOnCopy === undefined ? "\r\n\r\n 来自[%title%]\r\n%link%" : settings.appendOnCopy;

	this.strReplaceAll = function (str,search,replace){
		return str.replace(new RegExp(search, "gm"), replace);
	}
	this.getncovnewsDom = function () {
    	var el = document.querySelector("#ncovnews");
    	if (!el) {
        	console.error("没有找到数据容器");
        	return false;
    	}
    	return el;
    }
    this.newCity = function (name, dia, sus, cur, die, extra) {
        var city = document.createElement("li");
        city.className = extra ? "ncovnews-city " + extra : "ncovnews-city";
        city.innerHTML = "<span class='ncovnews-invs'>!return!</span><div class='ncovnews-datablock'><b>" + name + "</b></div> <span class='ncovnews-invs'>-&nbsp;</span><div class='ncovnews-datablock'><span class='ncovnews-invs'>确诊&nbsp;</span><span class='ncovnews-dia'>" + dia + "</span>&nbsp;例</div> <div class='ncovnews-datablock'><span class='ncovnews-invs'>疑似&nbsp;</span><span class='ncovnews-sus'>" + sus + "</span>&nbsp;例</div> <div class='ncovnews-datablock'><span class='ncovnews-invs'>治愈&nbsp;</span><span class='ncovnews-cur'>" + cur + "</span>&nbsp;例</div> <div class='ncovnews-datablock'><span class='ncovnews-invs'>死亡&nbsp;</span><span class='ncovnews-die'>" + die + "</span>&nbsp例</div>";
        return city;
    }
    this.getNowStr = function () {
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
    this.doGetNCOVNews = function () {
        var tip = document.querySelector("#ncovnews-refreshBtn");
        if (tip) tip.innerHTML = "正在刷新...";
        var url = "https://arena.360.cn/api/service/data/ncov-live-3";
        fetch(url)
            .then(response => response.json(), this.handleFailedData)
            .then(this.handleSuccessData)
    }
    this.handleFailedData = function (err) {
        var el = that.getncovnewsDom();
        if (!el) {
            return;
        }

        var tip = document.querySelector("#ncovnews-refreshBtn");
        if (tip) tip.innerHTML = "<font color=red>刷新失败 (-1)</font>";
        else el.innerHTML = "<center><font color=red>获取疫情信息失败 (-1)</font><br><small><font color=grey>请确保您的访问地点在大陆</font></small></center>";
    }
    this.handleSuccessData = function (res) {
        var el = that.getncovnewsDom();
        if (!el) {
            return;
        }
        if (res.success !== true) {
            var tip = document.querySelector("#refreshWH");
            if (tip) tip.innerHTML = "<font color=red>刷新失败 (-2)</font>";
            else el.innerHTML = "<center><font color=red>获取疫情信息失败 (-2)</font><br><small><font color=grey>信息源不可用</font></small></center>";
            return;
        }
        var date = new Date();
        res.time = date.valueOf();
        if (that.ncovnews_Lastdata == null) that.ncovnews_Lastdata = res;
        if (that.ncovnews_Lastdata.time && (
                that.ncovnews_Lastdata.time != res.time
        ) &&
            (!that.dataEquals(that.ncovnews_Lastdata.data, res.data))
        ) {
            el.innerHTML = "<div id='refreshWH'>刷新于 " + that.getNowStr() + "<br><small>对比上次数据: " + that.getTimeDiff(that.ncovnews_Lastdata.time, res.time) + "</small><div>";
        } else el.innerHTML = "<div id='refreshWH'>刷新于 " + that.getNowStr() + "<div>";
        var d = res.data.detail;
        var ld = that.ncovnews_Lastdata.data.detail;
        var t = res.data.total;
        var lt = that.ncovnews_Lastdata.data.total;
        var title = document.createElement("li");
        title.className = "ncovnews-title";
        title.style.listStyle = "none";
        title.innerHTML = "<div class='ncovnews-datablock'><b>地区</b></div> <div class='ncovnews-datablock'>确诊</div> <div class='ncovnews-datablock'>疑似</div> <div class='ncovnews-datablock'>治愈</div> <div class='ncovnews-datablock'>死亡</div>";
        el.appendChild(title);
        var totalel = that.newCity("<span class='ncovnews-big'>共计</span>", t.diagnosed == lt.diagnosed ? t.diagnosed : t.diagnosed + that.wh_c(t.diagnosed - lt.diagnosed), t.suspected == lt.suspected ? t.suspected : t.suspected + that.wh_c(t.suspected - lt.suspected), t.cured == lt.cured ? t.cured : t.cured + that.wh_c(t.cured - lt.cured), t.died == lt.died ? t.died : t.died + that.wh_c(t.died - lt.died), "ncovnews-totalline");
        totalel.style.listStyle = "none";
        el.appendChild(totalel);
        // var ul = document.createElement("ul");
        var ul = document.createElement("div");
        ul.id = "ncovnews-list";
        d.forEach((i, index) => {
            var li = ld.find((item) => {
                return item.id == i.id
            });
            if (li == undefined) li = {
                diagnosed: 0,
                suspected: 0,
                cured: 0,
                died: 0
            };
            ul.appendChild(that.newCity(
                i.city,
                i.diagnosed == li.diagnosed ? i.diagnosed : i.diagnosed + that.wh_c(i.diagnosed - li.diagnosed),
                i.suspected == li.suspected ? i.suspected : i.suspected + that.wh_c(i.suspected - li.suspected),
                i.cured == li.cured ? i.cured : i.cured + that.wh_c(i.cured - li.cured),
                i.died == li.died ? i.died : i.died + that.wh_c(i.died - li.died),
            ));
        });
        el.appendChild(ul);

        that.regToggle(totalel);
        var shengming = document.createElement("div");
        shengming.id = "ncovnews-shengming";
        shengming.innerHTML = "信息来自 <a href='https://arena.360.cn/docs/wuhan_pneumonia/'>新型全国疫情实时动态(360.cn)</a><br>实时显示脚本来自 <a href='https://blog.ckylin.site/talks/wuhanlinks.md'>CKylin.Blog</a><br>ncovnews.js ver " + that.ncovnews_ver;
        el.appendChild(shengming);
        var tip = document.querySelector("#refreshWH");
        if (tip) tip.onclick = that.doGetNCOVNews;
        that.ncovnews_Lastdata = res;
        that.saveData(res);
    }
    this.wh_c = function (str) {
        return " <span class='ncovnews-changes'>(+" + str + ")</span>";
    }
    this.startRefreshLoop = function () {
        if (!document.querySelector("#ncovnews-styles")) {
            var css = document.createElement("style");
            css.id = "ncovnews-styles";
            css.innerHTML = "#ncovnews{display:block;margin:0 auto;width: max-content;}" +
                "#refreshWH{text-align:center;cursor:pointer}#refreshWH:hover{color:grey;}" +
                ".ncovnews-city:hover{background:rgba(0,0,0,.18)}" +
                ".ncovnews-totalline *{font-size:x-large;margin-top:12px;margin-bottom:12px;}" +
                "#ncovnews-list {list-style:none;display:block;overflow:hidden;height:0;transition:.3s;}" +
                ".ncovnews-invs{display:inline-block;font-size:0;}" +
                ".ncovnews-changes{font-size:smaller;text-decoration:underline}" +
                ".ncovnews-title{margin-top:8px;border-top: solid 3px grey;padding-top:4px}" +
                ".ncovnews-title>*{font-weight:bolder!important;text-align:center!important;}" +
                ".ncovnews-datablock{display:inline-block;min-width: 60px;max-width:120px;width:15vw;text-align:center}" +
                ".ncovnews-dia,.ncovnews-sus,.ncovnews-cur,.ncovnews-die{display:inline-block;font-weight:bold;text-align:center}" +
                ".ncovnews-dia{color:red}" +
                ".ncovnews-sus{color:orange}" +
                ".ncovnews-cur{color:green}" +
                "#ncovnews-shengming{font-size:small;text-align:center}";
            document.head.appendChild(css);
        }
        if (that.getncovnewsDom() === false) return;
        that.loadData();
        that.doGetNCOVNews();
        that.ncovnews_loop = setInterval(that.doGetNCOVNews, that.refreshTime);
        console.log('started');
    }
    this.stopRefreshLoop = function () {
            if (this.ncovnews_loop != null) {
                clearInterval(this.ncovnews_loop)
            }
            console.log('stopped');
    }
    this.saveData = function (data) {
        localStorage.setItem("ckncovnewsjs_data", JSON.stringify(data));
    }
    this.loadData = function () {
        var data;
        if (data = localStorage.getItem("ckncovnewsjs_data")) {
            try {
                this.ncovnews_Lastdata = JSON.parse(data);
            } catch (e) {
                localStorage.setItem("ckncovnewsjs_data", null);
            }
        }
        return this.ncovnews_Lastdata;
    }
    this.handleClipboardEvent = function () {
        var body_element = document.body;
        var selection;
        selection = window.getSelection();

        var locationHref = document.location.href;
        var tip = document.querySelector("#refreshWH");
        var beforeText;
        if (tip) {
            beforeText = tip.innerText.replace("刷新", "数据更新") + "\r\n\r\n";
        } else {
            beforeText = "数据更新于" + that.getNowStr() + "\r\n\r\n";
        }
        var appendLink = that.strReplaceAll(that.strReplaceAll(that.appendOnCopy, "%title%", document.title), "%link%", location.href);
        if (window.clipboardData) { // Internet Explorer
            var copytext = beforeText + selection + appendLink;
            window.clipboardData.setData("Text", copytext);
            return false;
        } else {
            var copytext = beforeText + selection + appendLink;
            copytext = that.strReplaceAll(that.strReplaceAll(copytext, "\r\n", "<br>"), "!return!", "<br>");
            var newdiv = document.createElement('div');
            newdiv.style.position = 'absolute';
            newdiv.style.left = '-99999px';
            body_element.appendChild(newdiv);
            newdiv.innerHTML = copytext;
            selection.selectAllChildren(newdiv);
            // newdiv.select();
            document.execCommand('copy');
            window.setTimeout(function () {
                body_element.removeChild(newdiv);
            }, 0);
        }
    }
    this.toggleListFunc = function (init) {
        list = document.querySelector("#ncovnews-list");
        if (!list) return;
        var calcedHeight = list.scrollHeight;
        if (init === true) {
            if (this.ncovnews_toggle == 1) {
                list.style.height = "0px";
            } else {
                list.style.height = calcedHeight + "px";
            }
            return;
        }
        if (this.ncovnews_toggle == 1) {
            this.ncovnews_toggle = 2;
            list.style.height = calcedHeight + "px";
        } else {
            this.ncovnews_toggle = 1;
            list.style.height = "0px";
        }
    }
    this.dataEquals = function (obj1, obj2) {
        return JSON.stringify(obj1) == JSON.stringify(obj2);
    }
    this.getTimeDiff = function (t,n) {
        // 准备
        if (!(t instanceof Date)) {
            t = new Date(t);
        }
        if (!n) {
            n = new Date();
        }
        if (!(n instanceof Date)) {
            n = new Date(n);
        }

        var str = "";

        // 获取
        var ty = t.getYear() + 1900;
        var tm = t.getMonth() + 1;
        var td = t.getDate();
        var th = t.getHours();
        var tmi = t.getMinutes();
        var ts = t.getSeconds();
        var ny = n.getYear() + 1900;
        var nm = n.getMonth() + 1;
        var nd = n.getDate();
        var nh = n.getHours();
        var nmi = n.getMinutes();
        var ns = n.getSeconds();
        
        if (ty != ny) {
            str += ty > ny ? (ty - ny) + "年后" : (ny - ty) + "年前";
        } else if (tm != nm) {
            str += tm > nm ? (tm - nm) + "个月后" : (nm - tm) + "个月前";
        } else if (td != nd) {
            str += td > nd ? (td - nd) + "天后" : (nd - td) + "天前";
        } else if (th != nh) {
            str += th > nh ? (th - nh) + "小时后" : (nh - th) + "小时前";
        } else if (tmi != nmi) {
            str += tmi > nmi ? (tmi - nmi) + "分钟后" : (nmi - tmi) + "分钟前";
        } else if (ts != ns) {
            str += ts > ns ? (ts - ns) + "秒后" : (ns - ts) + "秒前";
        } else {
            str += "刚刚";
        }
        return str;
    }
    this.regToggle = function (e) { 
        if (!this.ncovnews_toggle) {
            this.ncovnews_toggle = 1;
        }
        e.onclick = this.toggleListFunc;
        this.toggleListFunc(true);
        e.title = "点击查看地区详情";
        e.style.cursor = "pointer";
    }
    this.run = function () {
        if (!this.autoRefresh) {
            this.doGetNCOVNews();
        } else {
            this.startRefreshLoop();
        }
        if (this.refreshOnFocus) {
            window.onfocus = this.startRefreshLoop;
            window.onblue = this.stopRefreshLoop;
        }
        if (this.handleCopyEvent) {
            var dom = this.getncovnewsDom();
            if (dom) {
                dom.oncopy = this.handleClipboardEvent;
            }
        }
    }
}
