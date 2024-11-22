import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  Share,
  Print,
  MoreVert,
  Refresh,
} from '@mui/icons-material';
import { DateRangePicker } from '@mui/lab';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportViewer = ({ reportType, initialData, onRefresh, onExport }) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState([null, null]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [viewType, setViewType] = useState('chart');

  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const refreshedData = await onRefresh(dateRange);
      setData(refreshedData);
    } catch (error) {
      console.error('Failed to refresh report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    try {
      await onExport(format, dateRange);
    } catch (error) {
      console.error('Failed to export report:', error);
    }
    setMenuAnchor(null);
  };

  const renderChart = () => {
    switch (reportType) {
      case 'performance':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="completed" fill="#0088FE" name="Completed" />
              <Bar dataKey="failed" fill="#FF8042" name="Failed" />
              <Bar dataKey="inProgress" fill="#FFBB28" name="In Progress" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'trend':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Paper>
        <Typography variant="h6" gutterBottom>
          Report Viewer
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="date-range-label">Date Range</InputLabel>
              <Select
                labelId="date-range-label"
                id="date-range"
                value={dateRange}
                label="Date Range"
                onChange={(event) => setDateRange(event.target.value)}
              >
                <MenuItem value={[null, null]}>All Time</MenuItem>
                <MenuItem value={[new Date(), new Date()]}>Today</MenuItem>
                <MenuItem value={[new Date(new Date().setDate(1)), new Date()]}>This Month</MenuItem>
                <MenuItem value={[new Date(new Date().setDate(1)), new Date(new Date().setDate(31))]}>This Quarter</MenuItem>
                <MenuItem value={[new Date(new Date().setDate(1)), new Date(new Date().setDate(31))]}>This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Refresh'}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<MoreVert />}
              onClick={(event) => setMenuAnchor(event.currentTarget)}
            >
              More
            </Button>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={() => handleExport('pdf')}>Export as PDF</MenuItem>
              <MenuItem onClick={() => handleExport('csv')}>Export as CSV</MenuItem>
            </Menu>
          </Grid>
          <Grid item xs={12}>
            <Tabs value={activeTab} onChange={(event, newValue) => setActiveTab(newValue)}>
              <Tab label="Chart" />
              <Tab label="Table" />
            </Tabs>
          </Grid>
          <Grid item xs={12}>
            {renderChart()}
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default ReportViewer; 