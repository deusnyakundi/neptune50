import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  ButtonGroup,
  Button,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  Assignment,
  Engineering,
  Speed,
  CheckCircle,
  Error,
  Pending,
} from '@mui/icons-material';
import api from '../../utils/api';
import MetricCard from './MetricCard';
import ProjectsTable from './ProjectsTable';
import RegionalDistribution from './RegionalDistribution';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const TIME_RANGES = ['daily', 'weekly', 'monthly', 'yearly'];

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState('weekly');

  // Fetch dashboard metrics
  const { data: metrics } = useQuery(
    ['dashboardMetrics', timeRange],
    async () => {
      const response = await api.get(`/dashboard/metrics?range=${timeRange}`);
      return response.data;
    }
  );

  // Fetch projects statistics
  const { data: projectStats } = useQuery(
    ['projectStatistics', timeRange],
    async () => {
      const response = await api.get(`/dashboard/projects?range=${timeRange}`);
      return response.data;
    }
  );

  // Fetch provisioning statistics
  const { data: provisioningStats } = useQuery(
    ['provisioningStatistics', timeRange],
    async () => {
      const response = await api.get(`/dashboard/provisioning?range=${timeRange}`);
      return response.data;
    }
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Dashboard</Typography>
        <ButtonGroup size="small">
          {TIME_RANGES.map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'contained' : 'outlined'}
              onClick={() => setTimeRange(range)}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      <Grid container spacing={3}>
        {/* Metric Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Total Projects"
            value={metrics?.totalProjects || 0}
            icon={<Assignment />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Active Engineers"
            value={metrics?.activeEngineers || 0}
            icon={<Engineering />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Provisioning Rate"
            value={`${metrics?.provisioningRate || 0}%`}
            icon={<Speed />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Success Rate"
            value={`${metrics?.successRate || 0}%`}
            icon={<CheckCircle />}
            color="#2e7d32"
          />
        </Grid>

        {/* Projects Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Project Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={projectStats?.trends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" fill="#00C49F" name="Completed" />
                  <Bar dataKey="inProgress" fill="#0088FE" name="In Progress" />
                  <Bar dataKey="pending" fill="#FFBB28" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Regional Distribution */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Regional Distribution
              </Typography>
              <RegionalDistribution data={projectStats?.regional || []} />
            </CardContent>
          </Card>
        </Grid>

        {/* Provisioning Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Provisioning Status
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={provisioningStats?.status || []}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {provisioningStats?.status?.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Projects */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Projects
              </Typography>
              <ProjectsTable projects={projectStats?.recent || []} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 