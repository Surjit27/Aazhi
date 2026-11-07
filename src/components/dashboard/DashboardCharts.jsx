import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const PIE_COLORS = ['#4F86F7', '#5EB1FF', '#F0A500']

export function AnalyticsAreaChart({ data, dataKey = 'value', height = 280 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 12, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="deepeAreaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4F86F7" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#4F86F7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#E8ECF3" vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#8A94A6' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#8A94A6' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #E2E6EE',
              boxShadow: '0 6px 20px rgba(22,35,58,0.08)',
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="#3B74E7"
            strokeWidth={2.5}
            fill="url(#deepeAreaFill)"
            dot={false}
            activeDot={{ r: 4, fill: '#3B74E7' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function RoleDonutChart({ data, centerLabel, height = 220 }) {
  return (
    <div className="relative w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={82} paddingAngle={3}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={entry.color ?? PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #E2E6EE',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerLabel && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-semibold text-ink tabular-nums">{centerLabel}</span>
        </div>
      )}
    </div>
  )
}

export function TrafficBarChart({ data, height = 200 }) {
  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }} barSize={22}>
          <CartesianGrid stroke="#E8ECF3" vertical={false} strokeDasharray="4 4" />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#8A94A6' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#8A94A6' }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 10,
              border: '1px solid #E2E6EE',
            }}
          />
          <Bar dataKey="value" fill="#4F86F7" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
