# ncovnews.js
在网页中实时显示全国的新型冠状病毒肺炎疫情数据。数据来自[360](https://arena.360.cn/docs/wuhan_pneumonia/).
[效果预览](https://blog.ckylin.site/talks/wuhanlinks.md)

## 用法

需要在页面中想放置数据列表的位置提前插入:
```html
<div id="ncovnews">loading...</div>
```
并引入ncovnews.js即可。

## 说明

* 没有为手机视图进行适配。
* **数据来自[360](https://arena.360.cn/docs/wuhan_pneumonia/)，似乎不提供海外IP访问。**
* 数据会自动刷新，不在页面时自动停止刷新。
* 存储每次的数据，下一次刷新或打开页面时显示增加量。
* 复制时附带来源和更新时间信息。

<h1><cneter>武汉，加油！</center></h1>
