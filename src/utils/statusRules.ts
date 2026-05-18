import type { StateRecord, StatusResult } from '../types/record'

const statusRules: Array<{
  key: StatusResult['key']
  name: string
  priority: number
  message: string
  match: (record: StateRecord) => boolean
}> = [
  {
    key: 'internal_friction',
    name: '脑子有点吵',
    priority: 1,
    message: '今天脑内活动可能有点多。先做一件很小的现实动作就够了。',
    match: (record) => record.stability <= 4 && record.action <= 4,
  },
  {
    key: 'low_burn',
    name: '没什么想做',
    priority: 2,
    message: '今天期待感偏低，不用强行振作。先留意有没有一点点感兴趣的东西。',
    match: (record) => record.spark <= 3 && record.action <= 5,
  },
  {
    key: 'island',
    name: '连接少了一点',
    priority: 3,
    message: '今天和外界的真实连接偏少。不需要强行社交，保持一点轻连接就可以。',
    match: (record) => record.connection <= 3 && record.expression <= 3,
  },
  {
    key: 'ignite',
    name: '进入状态了',
    priority: 4,
    message: '今天有明显投入感。可以记一下是什么让你进入了这个状态。',
    match: (record) => record.spark >= 7 && record.action >= 7,
  },
  {
    key: 'stable',
    name: '平稳运行',
    priority: 99,
    message: '今天整体平稳，正常观察就好。',
    match: () => true,
  },
]

export function getStatuses(record: StateRecord): StatusResult[] {
  const matchedStatuses = statusRules
    .filter((rule) => rule.key === 'stable' || rule.match(record))
    .map<StatusResult>(({ key, name, priority, message }) => ({
      key,
      name,
      priority,
      message,
    }))
    .sort((a, b) => a.priority - b.priority)

  const nonStableStatuses = matchedStatuses.filter((status) => status.key !== 'stable')

  if (nonStableStatuses.length === 0) {
    return matchedStatuses.filter((status) => status.key === 'stable')
  }

  return nonStableStatuses
}

export function getPrimaryStatus(record: StateRecord): StatusResult {
  return getStatuses(record)[0]
}