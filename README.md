# ncovnews.js
在网页中实时显示全国的新型冠状病毒肺炎疫情数据。数据来自[360](https://arena.360.cn/docs/wuhan_pneumonia/).
[效果预览](https://blog.ckylin.site/talks/wuhanlinks.md)

## 基本用法

```javascript
var ncov = new ncovData("#ncovnews");// 传入需要显示数据列表的位置,必须是div元素。
ncov.run();
```

## 选项参数

```javascript
var ncov = new ncovData("#ncovnews",{
	autoRefresh: true, // 自动间隔刷新
	refreshTime: 60000*5, // 刷新时间间隔(ms)(需要autoRefresh)
	refreshOnFocus: true, // 切换到页面时自动刷新
	handleCopyEvent: true, // 修改复制数据
	appendOnCopy: "\r\n\r\n 来自【%title%】 - %link%" // 复制数据时的附加文本(需要handleCopyEvent)
});
ncov.run();
```

## 说明

* 没有为手机视图进行适配。
* **数据来自[360](https://arena.360.cn/docs/wuhan_pneumonia/)，似乎不提供海外IP访问。**
* 数据会自动刷新，不在页面时自动停止刷新。
* 存储每次的数据，下一次刷新或打开页面时显示增加量。
* 复制时附带来源和更新时间信息。

<h1><cneter>武汉，加油！</center></h1>
