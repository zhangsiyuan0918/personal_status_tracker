import type { StateRecord, StatusResult } from '../types/record'

const statusRules: Array<{
  key: StatusResult['key']
  name: string
  priority: number
  message: string
  match: (record: StateRecord) => boolean
}> = [
  {
    key: 'recovery',
    name: '恢复状态',
    priority: 1,
    message: '能量偏低，今天优先回血。不要做重大决定，先睡觉、吃好、整理环境。',
    match: (record) => record.energy <= 4,
  },
  {
    key: 'internal_friction',
    name: '内耗状态',
    priority: 2,
    message: '可能正在想很多但行动不足。建议停止继续分析，做一个最小现实动作。',
    match: (record) => record.stability <= 4 && record.action <= 4,
  },
  {
    key: 'low_burn',
    name: '低燃烧预警',
    priority: 3,
    message: '火苗和行动偏低，可能进入稳定但无聊状态。建议做一个 30 分钟小实验。',
    match: (record) => record.spark <= 3 && record.action <= 5,
  },
  {
    key: 'island',
    name: '孤岛状态',
    priority: 4,
    message: '连接和表达偏低。不要强行社交，但可以进入一个低压外部场景。',
    match: (record) => record.connection <= 3 && record.expression <= 3,
  },
  {
    key: 'ignite',
    name: '点燃状态',
    priority: 5,
    message: '今天有明显投入感。建议记录是什么点燃了你，并考虑把它变成持续项目。',
    match: (record) => record.spark >= 7 && record.action >= 7,
  },
]

const stableStatus: StatusResult = {
  key: 'stable',
  name: '稳定运行',
  priority: 99,
  message: '状态整体可运行。继续观察趋势，不需要过度分析。',
}

export function getStatuses(record: StateRecord): StatusResult[] {
  const matchedStatuses = statusRules
    .filter((rule) => rule.match(record))
    .map<StatusResult>(({ key, name, priority, message }) => ({
      key,
      name,
      priority,
      message,
    }))
    .sort((a, b) => a.priority - b.priority)

  if (matchedStatuses.length === 0) {
    return [stableStatus]
  }

  return matchedStatuses
}

export function getPrimaryStatus(record: StateRecord): StatusResult {
  return getStatuses(record)[0]
}