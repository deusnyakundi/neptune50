import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Menu,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  MoreVert,
  TrendingUp,
  TrendingDown,
  RemoveRed,
} from '@mui/icons-material';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF99CC'];

const DataDashboard = ({ data, loading }) => {
  const [timeRange, setTimeRange] = useState('week');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedChart, setSelectedChart] = useState(null);

  const handleMenuClick = (event, chartId) => {
    setMenuAnchor(event.currentTarget);
    setSelectedChart(chartId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedChart(null);
  };

  const calculateTrend = (current, previous) => {
    const percentage = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(percentage).toFixed(1),
      direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral',
    };
  };

  const renderTrendIcon = (direction) => {
    switch (direction) {
      case 'up':
        return <TrendingUp color="success" />;
      case 'down':
        return <TrendingDown color="error" />;
      default:
        return <RemoveRed color="action" />;
    }
  };

  const renderMetricCard = ({ title, value, previousValue, format }) => {
    const trend = calculateTrend(value, previousValue);
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" component="div">
            {format ? format(value) : value}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            {renderTrendIcon(trend.direction)}
            <Typography
              variant="body2"
              color={
                trend.direction === 'up' ? 'success.main' :
                trend.direction === 'down' ? 'error.main' :
                'text.secondary'
              }
              sx={{ ml: 1 }}
            >
              {trend.value}% vs previous {timeRange}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderChart = (chartType, chartData, options = {}) => {
    const { title, height = 300 } = options;

    return (
      <Paper sx={{ p: 2, height: height + 50 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">{title}</Typography>
          <IconButton
            size="small"
            onClick={(e) => handleMenuClick(e, title)}
          >
            <MoreVert />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
            <CircularProgress />
          </Box>
        ) : (
          <ResponsiveContainer width="100%" height={height}>
            {chartType === 'line' ? (
              <LineChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#8884d8" />
              </LineChart>
            ) : chartType === 'bar' ? (
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={height / 2.5}
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            )}
          </ResponsiveContainer>
        )}
      </Paper>
    );
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Metric Cards */}
        <Grid item xs={12} md={3}>
          {renderMetricCard({
            title: 'Total Projects',
            value: data.totalProjects,
            previousValue: data.previousTotalProjects,
          })}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard({
            title: 'Success Rate',
            value: data.successRate,
            previousValue: data.previousSuccessRate,
            format: (value) => `${value}%`,
          })}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard({
            title: 'Active Engineers',
            value: data.activeEngineers,
            previousValue: data.previousActiveEngineers,
          })}
        </Grid>
        <Grid item xs={12} md={3}>
          {renderMetricCard({
            title: 'Avg. Completion Time',
            value: data.avgCompletionTime,
            previousValue: data.previousAvgCompletionTime,
            format: (value) => `${value} days`,
          })}
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={8}>
          {renderChart('line', data.timelineData, {
            title: 'Project Timeline',
            height: 400,
          })}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderChart('pie', data.statusDistribution, {
            title: 'Status Distribution',
            height: 400,
          })}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart('bar', data.regionData, {
            title: 'Regional Distribution',
            height: 300,
          })}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderChart('bar', data.engineerPerformance, {
            title: 'Engineer Performance',
            height: 300,
          })}
        </Grid>
      </Grid>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Export as PNG</MenuItem>
        <MenuItem onClick={handleMenuClose}>Export as CSV</MenuItem>
        <MenuItem onClick={handleMenuClose}>View Full Screen</MenuItem>
        <MenuItem onClick={handleMenuClose}>Customize</MenuItem>
      </Menu>
    </Box>
  );
};

export default DataDashboard; 