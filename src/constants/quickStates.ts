export type QuickStateGroupKey = 'energy' | 'progress' | 'connection' | 'mind'

export interface QuickStateOption {
  key: string
  label: string
  values: Partial<{
    energy: number
    spark: number
    action: number
    connection: number
    expression: number
    stability: number
  }>
}

export interface QuickStateGroup {
  key: QuickStateGroupKey
  label: string
  options: QuickStateOption[]
}

export const QUICK_STATE_GROUPS: QuickStateGroup[] = [
  {
    key: 'energy',
    label: '身体电量',
    options: [
      {
        key: 'low_energy',
        label: '有点没电',
        values: { energy: 3 },
      },
      {
        key: 'normal_energy',
        label: '正常运转',
        values: { energy: 6 },
      },
      {
        key: 'good_energy',
        label: '电量还不错',
        values: { energy: 8 },
      },
    ],
  },
  {
    key: 'progress',
    label: '事情推进',
    options: [
      {
        key: 'no_motivation',
        label: '没什么想做',
        values: { spark: 2, action: 3 },
      },
      {
        key: 'some_progress',
        label: '做了一点事',
        values: { spark: 5, action: 6 },
      },
      {
        key: 'in_flow',
        label: '进入状态了',
        values: { spark: 8, action: 8 },
      },
    ],
  },
  {
    key: 'connection',
    label: '人际连接',
    options: [
      {
        key: 'little_contact',
        label: '基本没交流',
        values: { connection: 2, expression: 2 },
      },
      {
        key: 'some_contact',
        label: '有些交流',
        values: { connection: 5, expression: 4 },
      },
      {
        key: 'real_expression',
        label: '说出了一点真实想法',
        values: { connection: 6, expression: 7 },
      },
    ],
  },
  {
    key: 'mind',
    label: '脑内状态',
    options: [
      {
        key: 'noisy_mind',
        label: '脑子有点吵',
        values: { stability: 3 },
      },
      {
        key: 'mostly_stable',
        label: '还算平稳',
        values: { stability: 6 },
      },
      {
        key: 'clear_mind',
        label: '比较清楚',
        values: { stability: 8 },
      },
    ],
  },
]