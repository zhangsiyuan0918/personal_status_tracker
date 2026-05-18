export interface QuickTemplate {
  key: string
  name: string
  description: string
  values: {
    energy: number
    spark: number
    action: number
    connection: number
    expression: number
    stability: number
  }
}

export const QUICK_TEMPLATES: QuickTemplate[] = [
  {
    key: 'low_burn',
    name: '低燃烧',
    description: '能运行，但没什么期待。',
    values: {
      energy: 5,
      spark: 2,
      action: 3,
      connection: 3,
      expression: 3,
      stability: 5,
    },
  },
  {
    key: 'stable',
    name: '稳定运行',
    description: '整体正常，没有明显异常。',
    values: {
      energy: 6,
      spark: 5,
      action: 5,
      connection: 5,
      expression: 5,
      stability: 6,
    },
  },
  {
    key: 'recovery',
    name: '恢复中',
    description: '电量偏低，今天需要回血。',
    values: {
      energy: 3,
      spark: 3,
      action: 2,
      connection: 3,
      expression: 3,
      stability: 5,
    },
  },
  {
    key: 'rumination',
    name: '内耗中',
    description: '想很多，行动很少。',
    values: {
      energy: 4,
      spark: 3,
      action: 2,
      connection: 3,
      expression: 3,
      stability: 3,
    },
  },
  {
    key: 'ignited',
    name: '点燃',
    description: '有想投入的事，行动也跟上了。',
    values: {
      energy: 7,
      spark: 8,
      action: 8,
      connection: 5,
      expression: 5,
      stability: 7,
    },
  },
  {
    key: 'isolation',
    name: '孤岛',
    description: '和外界连接偏低，话也没怎么说。',
    values: {
      energy: 5,
      spark: 4,
      action: 4,
      connection: 2,
      expression: 2,
      stability: 5,
    },
  },
]