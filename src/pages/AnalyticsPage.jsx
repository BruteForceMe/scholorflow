import React from 'react';
import { useApp } from '../context/AppContext';
import { getProductivityInsights } from '../utils/mlUtils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { FiTrendingUp, FiTarget, FiClock, FiZap } from 'react-icons/fi';

const COLORS = ['#00b4d8', '#00d4ff', '#06d6a0', '#ffbe0b', '#ef476f', '#118ab2'];

export default function AnalyticsPage() {
  const { state } = useApp();
  const { productivityData, tasks, currentUser } = state;
  const insights = getProductivityInsights(productivityData);

  const myTasks = tasks.filter(t => t.assignee === currentUser?.id);
  const statusData = [
    { name: 'To Do', value: myTasks.filter(t => t.status === 'todo').length },
    { name: 'In Progress', value: myTasks.filter(t => t.status === 'inprogress').length },
    { name: 'Done', value: myTasks.filter(t => t.status === 'done').length },
  ];

  const priorityData = [
    { name: 'High', value: myTasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: myTasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: myTasks.filter(t => t.priority === 'low').length },
  ];

  const radarData = productivityData.map(d => ({
    subject: d.day,
    focus: d.focusScore,
    tasks: d.tasksCompleted * 15,
    hours: d.hoursStudied * 12,
  }));

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Productivity Analytics 📊</h1>
        <p>Deep insights into your study habits and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        <div className="stat-card purple">
          <div className="stat-icon purple"><FiTarget /></div>
          <div className="stat-value">{insights.totalTasksCompleted}</div>
          <div className="stat-label">Tasks Completed This Week</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiClock /></div>
          <div className="stat-value">{insights.totalHoursStudied}h</div>
          <div className="stat-label">Total Hours Studied</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon orange"><FiTrendingUp /></div>
          <div className="stat-value">{insights.averageFocusScore}%</div>
          <div className="stat-label">Average Focus Score</div>
        </div>
        <div className="stat-card pink">
          <div className="stat-icon pink"><FiZap /></div>
          <div className="stat-value">{insights.bestDay}</div>
          <div className="stat-label">Best Day ({insights.bestDayScore}% focus)</div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="card" style={{ marginBottom: 20, padding: '16px 24px' }}>
        <p style={{ fontSize: '0.92rem' }}>
          <strong style={{ color: 'var(--accent-secondary)' }}>AI Recommendation:</strong>{' '}
          {insights.recommendation}
        </p>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Hours Studied vs Focus Score</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={productivityData}>
              <defs>
                <linearGradient id="hoursGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="focusGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00b4d8" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00b4d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }} />
              <Area type="monotone" dataKey="hoursStudied" stroke="#06d6a0" strokeWidth={2} fill="url(#hoursGrad)" name="Hours" />
              <Area type="monotone" dataKey="focusScore" stroke="#00b4d8" strokeWidth={2} fill="url(#focusGrad)" name="Focus %" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Productivity Radar</h3>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(148,163,184,0.15)" />
              <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={12} />
              <PolarRadiusAxis stroke="#64748b" fontSize={10} />
              <Radar name="Focus" dataKey="focus" stroke="#00b4d8" fill="#00b4d8" fillOpacity={0.2} />
              <Radar name="Tasks" dataKey="tasks" stroke="#06d6a0" fill="#06d6a0" fillOpacity={0.15} />
              <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="charts-grid" style={{ marginTop: 20 }}>
        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Tasks by Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <h3 className="chart-card-title">Tasks by Priority</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={priorityData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis type="number" stroke="#64748b" fontSize={12} />
              <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={70} />
              <Tooltip contentStyle={{ background: '#1a2035', border: '1px solid rgba(148,163,184,0.1)', borderRadius: 12, color: '#f1f5f9', fontSize: 13 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                {priorityData.map((_, i) => (
                  <Cell key={i} fill={['#ef476f', '#ffbe0b', '#118ab2'][i]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
