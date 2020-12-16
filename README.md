# StepGuidance

StepGuidance 一个不侵入业务的，通过GUI动态创建步骤引导的工具
<br>
当然你也可以用他来编写网站的技术文档。

<video src="./example.mp4" controls style="width:100%;"></video>

```
npm install step-guidance
or
yarn add step-guidance
or
<script src=dist/step-guidance.min.js></script>
```

## feature

* 提供独立的预览工具包
* 提供工具包，更方便的编写步骤的自定义JavaScript的脚本
* 搭建后端服务，将数据保存到云端
* 提供自动化检查工具，检查出由于目标网站更新，而导致失效的步骤。
* 提供下载保存的步骤

## example

```js
// mpa
new StepGuidance();

// spa  vue
const app = new Vue(options);

new StepGuidance(app, app.$router);

```

## API

<dl>
<dt><a href="#constructor">constructor(context?: any, router?: any)</a></dt>
<dd><p>构造函数</p></dd>

<dt><a href="#toggleModel">toggleModel(modal: StepGuidanceEnum)</a></dt>
<dd><p>切换模式</p></dd>

<dt><a href="#addNode">addNode(el: HTMLElement)</a></dt>
<dd><p>将元素添加进步骤中</p></dd>

<dt><a href="#save">save()</a> ⇒ <code>string</code></dt>
<dd><p>保存</p></dd>

<dt><a href="#loadData">loadData(stepMap?: string)</a></dt>
<dd><p>加载步骤数据</p></dd>

<dt><a href="#preview">preview()</a></dt>
<dd><p>预览</p></dd>

<dt><a href="#previewByKey">previewByKey(startKey: string)</a></dt>
<dd><p>设置预览的开始位置，并预览</p></dd>
</dl>


<a name="constructor"></a>
#### constructor(context?: any, router?: any)
构造函数

| Param | Description |
| --- | --- |
| context | javascript执行脚本的自定义执行上下文对象 |
| router | 对于spa应用，请传入路由对象(路由对象应包含push方法)。mpa应用忽略 |

<a name="toggleModel"></a>
#### toggleModel(modal: StepGuidanceEnum)
切换模式

| Param | Description |
| --- | --- |
| modal | StepGuidanceEnum ⇒ preview = 1、edit = 2、manage = 3 |


<a name="addNode"></a>
#### addNode(el: HTMLElement)
将元素添加进步骤中

| Param | Description |
| --- | --- |
| el | HTMLElement |


<a name="save"></a>
#### save() ⇒ <code>string</code>
保存<br>
目前会保存在localStorage中，后续支持保存到云端

* 返回描述步骤的链表结构的json字符串


<a name="loadData"></a>
#### loadData(stepMap?: string)
加载步骤数据

| Param | Description |
| --- | --- |
| stepMap | 步骤的链表结构的json字符串。默认加载localStorage中保存的步骤数据 |

<a name="preview"></a>
#### preview()
预览<br>

> 与 toggleModel(1) 等效

<a name="previewByKey"></a>
#### previewByKey(startKey: string)
设置预览的开始位置，并预览

| Param | Description |
| --- | --- |
| startKey | 开始预览的key |

