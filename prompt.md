# Role&Task

你是一个资深前端工程师。请帮我开发一个移动端优先的 PWA/Web App，产品名叫：

# 个人状态记录器

这是一个只供个人使用的轻量状态记录工具。目标是：每天 1 分钟记录自己的状态，每周查看趋势，帮助用户把模糊感受转化成可观察的数据。

请使用以下技术栈：

- React
- Vite
- TypeScript
- Tailwind CSS
- Chart.js 或 ECharts，优先 Chart.js
- LocalStorage 本地存储
- 移动端优先响应式设计

暂时不需要：

- 登录注册
- 后端服务
- 云同步
- AI
- 社交功能
- 复杂游戏化
- 多用户系统

---

## 一、产品核心功能

v0.1 需要实现以下功能：

1. 今日状态记录
2. 今日状态面板
3. 历史记录查看
4. 趋势图查看
5. 状态自动判定
6. JSON 数据导出
7. 清空全部数据
8. 指标说明和状态规则说明

---

## 二、核心指标

每天需要记录 6 个指标，每个指标范围是 0-10，整数。

### 1. 能量值 energy

表示今天身体和精神电量。

评分参考：

- 0-2：非常疲惫，只想躺着
- 3-4：低电量，勉强运行
- 5-6：正常状态
- 7-8：有余力，可以做额外事情
- 9-10：状态很好，精力充足

### 2. 火苗值 spark

表示今天是否有让用户产生兴趣、期待、兴奋、想继续投入的东西。

评分参考：

- 0-2：完全没有期待，生活很平
- 3-4：偶尔有一点兴趣，但不强
- 5-6：有一点想做的事情
- 7-8：明显有期待和投入感
- 9-10：被点燃，强烈想继续

### 3. 行动力 action

表示今天是否把想法变成了现实动作。

评分参考：

- 0-2：基本没有行动，只是想
- 3-4：有想法，但推进很少
- 5-6：完成了基本任务
- 7-8：有主动推进
- 9-10：高效行动，明显推进事情

### 4. 连接值 connection

表示今天是否和人产生真实连接。

评分参考：

- 0-2：几乎没有人与人之间的连接感
- 3-4：有浅层接触，但没有真实连接
- 5-6：普通交流
- 7-8：有舒服、真实的交流
- 9-10：有明显被理解、被陪伴、被看见的感觉

### 5. 表达值 expression

表示今天是否表达了真实想法、偏好、需求或边界。

评分参考：

- 0-2：几乎完全憋着
- 3-4：只表达了很表面的内容
- 5-6：表达了一点真实想法
- 7-8：比较清楚地表达了自己
- 9-10：真实、清晰、有边界地表达

### 6. 情绪稳定值 stability

表示今天内心是否稳定，是否内耗。分数越高越稳定。

评分参考：

- 0-2：情绪很乱，明显失控或很低落
- 3-4：明显内耗、焦虑或烦躁
- 5-6：可控，有波动但能处理
- 7-8：比较稳定
- 9-10：很平静、清楚、稳定

---

## 三、每日文字记录

每天除了 6 个指标，还可以填写 3 条可选文本：

1. 今天让我有感觉的事 positiveNote
2. 今天消耗我的事 drainNote
3. 今天完成的一个行动 actionNote

---

## 四、数据结构

请定义如下 TypeScript 类型：

```ts
export interface StateRecord {
  id: string;
  date: string;

  energy: number;
  spark: number;
  action: number;
  connection: number;
  expression: number;
  stability: number;

  positiveNote?: string;
  drainNote?: string;
  actionNote?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StatusResult {
  key: string;
  name: string;
  priority: number;
  message: string;
}
```

每天一条记录，id 默认使用日期，格式为 YYYY-MM-DD。

示例：

```json
{
  "id": "2026-05-15",
  "date": "2026-05-15",
  "energy": 6,
  "spark": 3,
  "action": 5,
  "connection": 2,
  "expression": 3,
  "stability": 6,
  "positiveNote": "今天看了一部有意思的电影",
  "drainNote": "工作内容重复，有点无聊",
  "actionNote": "整理了房间",
  "createdAt": "2026-05-15T21:30:00",
  "updatedAt": "2026-05-15T21:30:00"
}
```

---

## 五、本地存储

使用 LocalStorage。

LocalStorage key：

```ts
personal_state_records
```

存储格式为 StateRecord[]。

需要实现以下方法：

```ts
getAllRecords(): StateRecord[]
getRecordByDate(date: string): StateRecord | undefined
saveRecord(record: StateRecord): void
deleteRecord(id: string): void
clearRecords(): void
```

保存规则：

1. 如果当天没有记录，则新增。
2. 如果当天已有记录，则覆盖旧记录，并更新 updatedAt。
3. 历史记录按 date 倒序展示。
4. 需要做好 JSON.parse 错误处理，避免页面崩溃。

---

## 六、状态判定规则

根据每日记录自动判断状态。一个记录可以同时触发多个状态。

### 1. 恢复状态 recovery

条件：

```ts
energy <= 4
```

名称：

```ts
恢复状态
```

提示：

```text
能量偏低，今天优先回血。不要做重大决定，先睡觉、吃好、整理环境。
```

优先级：1

---

### 2. 内耗状态 rumination

条件：

```ts
stability <= 4 && action <= 4
```

名称：

```ts
内耗状态
```

提示：

```text
可能正在想很多但行动不足。建议停止继续分析，做一个最小现实动作。
```

优先级：2

---

### 3. 低燃烧预警 low_burn

条件：

```ts
spark <= 3 && action <= 5
```

名称：

```ts
低燃烧预警
```

提示：

```text
火苗和行动偏低，可能进入稳定但无聊状态。建议做一个 30 分钟小实验。
```

优先级：3

---

### 4. 孤岛状态 isolation

条件：

```ts
connection <= 3 && expression <= 3
```

名称：

```ts
孤岛状态
```

提示：

```text
连接和表达偏低。不要强行社交，但可以进入一个低压外部场景。
```

优先级：4

---

### 5. 点燃状态 ignited

条件：

```ts
spark >= 7 && action >= 7
```

名称：

```ts
点燃状态
```

提示：

```text
今天有明显投入感。建议记录是什么点燃了你，并考虑把它变成持续项目。
```

优先级：5

---

### 6. 稳定运行 stable

如果以上状态都没有命中，则显示：

名称：

```ts
稳定运行
```

提示：

```text
状态整体可运行。继续观察趋势，不需要过度分析。
```

优先级：99

---

状态结果需要按 priority 升序排序。

请实现：

```ts
getStatuses(record: StateRecord): StatusResult[]
```

---

## 七、页面结构

App 使用底部导航，移动端优先。

底部导航包含四个 Tab：

```text
记录｜面板｜趋势｜设置
```

对应页面：

```text
/record
/dashboard
/trends
/settings
```

如果不做 react-router，也可以用 state 控制当前 Tab，但页面结构要清晰。

---

# 八、页面需求

## 1. 今日记录页 RecordPage

功能：

用户填写或编辑当天状态。

页面内容：

```text
个人状态记录器
今日记录
今天是：YYYY-MM-DD
```

输入项：

- 能量值 Slider 0-10
- 火苗值 Slider 0-10
- 行动力 Slider 0-10
- 连接值 Slider 0-10
- 表达值 Slider 0-10
- 情绪稳定值 Slider 0-10

每个 Slider 显示当前数值，例如：

```text
火苗值 3/10
```

文字输入：

```text
今天让我有感觉的事
今天消耗我的事
今天完成的一个行动
```

按钮：

```text
保存今日记录
```

交互规则：

1. 当天首次进入，6 个指标默认值为 5。
2. 如果当天已有记录，自动填充已有记录。
3. 点击保存后保存到 LocalStorage。
4. 保存成功后显示 toast 或提示文案：已保存今日状态。
5. 保存后可以自动跳转到“面板”页。

---

## 2. 状态面板页 DashboardPage

功能：

展示今日最新状态和状态判定。

如果今天无记录，展示空状态：

```text
今天还没有记录。
用 1 分钟给今天打个分。
[去记录]
```

如果有记录，展示：

```text
今日状态
日期：YYYY-MM-DD

能量值：6/10
火苗值：3/10
行动力：5/10
连接值：2/10
表达值：3/10
情绪稳定值：6/10
```

建议用进度条展示每个指标。

展示状态标签：

```text
当前状态：
低燃烧预警
孤岛状态
```

展示每个状态对应提示。

如果多个状态，全部展示。

---

## 3. 历史/趋势页 TrendsPage

页面内包含两个子 Tab：

```text
趋势图｜历史记录
```

### 趋势图

功能：

展示最近 7 天 / 最近 30 天的折线图。

用户可以切换：

```text
最近 7 天
最近 30 天
```

第一版展示 6 个指标的趋势即可：

- energy
- spark
- action
- connection
- expression
- stability

如果实现复杂，可以默认展示 4 项：

- spark
- action
- connection
- stability

但最好支持 6 项。

没有足够数据时展示：

```text
数据还不够。
连续记录几天后，这里会显示趋势。
```

### 历史记录

按日期倒序展示所有记录。

每条记录显示：

```text
2026-05-15
能量 6｜火苗 3｜行动 5｜连接 2｜表达 3｜稳定 6
状态：低燃烧预警 / 孤岛状态
```

点击可以展开详情，展示：

```text
今天让我有感觉的事：
今天消耗我的事：
今天完成的一个行动：
```

每条记录支持：

- 编辑
- 删除

编辑可以跳转到记录页，并加载对应日期的记录；如果实现复杂，v0.1 可以先只支持删除，编辑历史作为可选。

删除前需要确认：

```text
确认删除这条记录？删除后不可恢复。
```

---

## 4. 设置页 SettingsPage

包含以下内容：

### 指标说明

展示 6 个指标的简短说明。

### 状态规则说明

展示各状态的触发条件和提示。

### 数据导出

按钮：

```text
导出 JSON
```

点击后下载 JSON 文件。

文件名：

```text
personal-state-records-YYYY-MM-DD.json
```

### 清空数据

按钮：

```text
清空全部数据
```

点击后弹窗确认：

```text
确认清空全部记录？此操作不可恢复。
```

### 关于

展示：

```text
个人状态记录器 v0.1
仅用于个人状态记录和自我观察，不构成心理或医学建议。
你的记录仅保存在当前设备浏览器本地。本应用不会上传你的数据。
如果你清除浏览器缓存，数据可能会丢失，建议定期导出备份。
```

---

## 九、UI 风格

请使用简洁、克制、数据面板感的 UI。

建议深色主题。

颜色参考：

```text
背景：#0F172A 或 #111827
卡片：#1F2937
主文字：#F9FAFB
次级文字：#9CA3AF
强调色：#60A5FA
警告色：#F59E0B
危险色：#EF4444
稳定色：#10B981
紫色：#A78BFA
```

设计关键词：

- 移动端优先
- 清爽
- 安静
- 数据感
- 卡片
- 克制
- 不幼稚
- 不鸡血

布局要求：

1. 整体宽度适配手机屏幕。
2. 桌面端居中展示，最大宽度约 480px。
3. 使用卡片式布局。
4. 底部导航固定在底部。
5. 页面底部需要留出导航高度，避免内容被遮挡。
6. 交互控件要适合手指点击。

---

## 十、组件建议

请尽量拆分组件，保持代码清晰。

建议组件：

```text
MetricSlider.tsx
MetricBar.tsx
StatusTag.tsx
RecordCard.tsx
EmptyState.tsx
BottomNav.tsx
```

---

## 十一、工具函数建议

请创建以下工具文件：

```text
src/utils/storage.ts
src/utils/statusRules.ts
src/utils/date.ts
src/utils/export.ts
```

### storage.ts

实现：

```ts
getAllRecords()
getRecordByDate(date: string)
saveRecord(record: StateRecord)
deleteRecord(id: string)
clearRecords()
```

### statusRules.ts

实现：

```ts
getStatuses(record: StateRecord): StatusResult[]
```

### date.ts

实现：

```ts
getTodayString(): string
formatDate(date: Date): string
getRecentRecords(records: StateRecord[], days: number): StateRecord[]
```

### export.ts

实现：

```ts
exportRecordsAsJson(records: StateRecord[]): void
```

---

## 十二、项目结构

请按以下结构生成项目：

```text
src/
  components/
    MetricSlider.tsx
    MetricBar.tsx
    StatusTag.tsx
    RecordCard.tsx
    EmptyState.tsx
    BottomNav.tsx
  pages/
    RecordPage.tsx
    DashboardPage.tsx
    TrendsPage.tsx
    SettingsPage.tsx
  utils/
    storage.ts
    statusRules.ts
    date.ts
    export.ts
  types/
    record.ts
  App.tsx
  main.tsx
  index.css
```

如果需要，也可以增加：

```text
src/constants/metrics.ts
src/constants/status.ts
```

---

## 十三、验收标准

最终代码需要满足以下标准：

### 记录功能

- 可以创建今日记录。
- 可以修改今日记录。
- 可以保存 6 个指标。
- 可以保存 3 条文本备注。
- 当天重复保存时覆盖旧记录。
- 刷新页面后数据仍然存在。

### 面板功能

- 可以展示今日记录。
- 可以展示各指标分值。
- 可以根据规则展示状态标签。
- 可以展示对应提示。
- 无今日记录时显示空状态。

### 历史/趋势功能

- 可以查看历史记录。
- 历史记录按日期倒序排列。
- 可以删除历史记录。
- 可以查看趋势图。
- 趋势图支持最近 7 天 / 30 天切换。

### 设置功能

- 可以查看指标说明。
- 可以查看状态规则说明。
- 可以导出 JSON。
- 可以清空全部数据。
- 清空前有二次确认。

### UI

- 移动端体验良好。
- 底部导航固定。
- 深色主题。
- 卡片式布局。
- 交互清晰。
- 不报 TypeScript 错误。
- 不报 React 运行错误。

---

## 十四、实现细节要求

1. 请使用 TypeScript 严格类型。
2. 请确保所有 Slider 的值为 0-10 的整数。
3. 请对 LocalStorage 读取做 try/catch。
4. 请避免数据解析失败导致页面崩溃。
5. 请在保存记录时自动生成 createdAt 和 updatedAt。
6. 如果是更新已有记录，保留原 createdAt，只更新 updatedAt。
7. 请保证记录按 date 倒序展示。
8. 请保证趋势图按 date 升序展示。
9. 请处理无数据状态。
10. 请不要引入后端。
11. 请不要实现登录注册。
12. 请不要把数据上传到任何地方。
13. 请不要使用复杂状态管理库，React useState/useEffect 即可。
14. 如需安装图表库，请使用 Chart.js 和 react-chartjs-2。

---

## 十五、图表实现要求

如果使用 Chart.js，请安装：

```bash
npm install chart.js react-chartjs-2
```

趋势图要求：

1. 使用折线图。
2. 横轴为日期。
3. 纵轴为 0-10。
4. 每个指标一条线。
5. 最近 7 天 / 30 天可切换。
6. 无数据时显示空状态。
7. 图表在移动端能正常显示。

指标颜色建议：

```ts
energy: "#10B981"
spark: "#F59E0B"
action: "#60A5FA"
connection: "#A78BFA"
expression: "#F472B6"
stability: "#22D3EE"
```

---

## 十六、指标配置

建议创建 metrics 配置，避免重复写。

```ts
export const METRICS = [
  {
    key: "energy",
    label: "能量值",
    shortLabel: "能量",
    color: "#10B981",
    description: "今天身体和精神电量如何。"
  },
  {
    key: "spark",
    label: "火苗值",
    shortLabel: "火苗",
    color: "#F59E0B",
    description: "今天有没有让我有兴趣、期待、想继续投入的东西。"
  },
  {
    key: "action",
    label: "行动力",
    shortLabel: "行动",
    color: "#60A5FA",
    description: "今天有没有把想法变成现实动作。"
  },
  {
    key: "connection",
    label: "连接值",
    shortLabel: "连接",
    color: "#A78BFA",
    description: "今天有没有和人产生真实连接。"
  },
  {
    key: "expression",
    label: "表达值",
    shortLabel: "表达",
    color: "#F472B6",
    description: "今天有没有表达真实想法、偏好、需求或边界。"
  },
  {
    key: "stability",
    label: "情绪稳定值",
    shortLabel: "稳定",
    color: "#22D3EE",
    description: "今天内心是否稳定，是否内耗。分数越高越稳定。"
  }
] as const;
```

---

## 十七、状态配置

也可以创建状态配置或直接写在 statusRules.ts 中。

状态规则：

```ts
recovery:
  condition: energy <= 4
  name: 恢复状态
  priority: 1
  message: 能量偏低，今天优先回血。不要做重大决定，先睡觉、吃好、整理环境。

rumination:
  condition: stability <= 4 && action <= 4
  name: 内耗状态
  priority: 2
  message: 可能正在想很多但行动不足。建议停止继续分析，做一个最小现实动作。

low_burn:
  condition: spark <= 3 && action <= 5
  name: 低燃烧预警
  priority: 3
  message: 火苗和行动偏低，可能进入稳定但无聊状态。建议做一个 30 分钟小实验。

isolation:
  condition: connection <= 3 && expression <= 3
  name: 孤岛状态
  priority: 4
  message: 连接和表达偏低。不要强行社交，但可以进入一个低压外部场景。

ignited:
  condition: spark >= 7 && action >= 7
  name: 点燃状态
  priority: 5
  message: 今天有明显投入感。建议记录是什么点燃了你，并考虑把它变成持续项目。

stable:
  fallback
  name: 稳定运行
  priority: 99
  message: 状态整体可运行。继续观察趋势，不需要过度分析。
```

---

## 十八、请输出完整代码

请直接生成完整可运行项目代码，包括：

1. package.json
2. vite 配置，如需要
3. tailwind 配置
4. src 下所有文件
5. 必要的安装说明
6. 启动说明

启动方式应为：

```bash
npm install
npm run dev
```

---

## 十九、开发完成后请自检

请在生成代码后检查：

1. TypeScript 是否有类型错误。
2. 所有 import 路径是否正确。
3. LocalStorage 是否能正常读写。
4. 无记录状态是否正常。
5. 保存后是否能在面板展示。
6. 趋势图是否能读取历史数据。
7. 删除记录后页面是否更新。
8. 导出 JSON 是否可用。
9. 清空数据后页面是否刷新为空状态。
10. 移动端布局是否不会被底部导航遮挡。

---

## 二十、额外说明

这个应用是个人使用工具。  
请不要做得过度复杂。  
优先保证：

- 简洁
- 稳定
- 可用
- 本地数据安全
- 移动端体验好

最终目标是让我能连续使用 14 天。