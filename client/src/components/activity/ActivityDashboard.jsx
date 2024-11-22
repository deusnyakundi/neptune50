import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import {
  Refresh,
  MoreVert,
  Login,
  Logout,
  Edit,
  Delete,
  Visibility,
  Download,
  Group,
} from '@mui/icons-material';
import { formatDistanceToNow, format } from 'date-fns';

const ActivityDashboard = ({ userId }) => {
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('24h');
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [activitiesData, statsData] = await Promise.all([
        fetch(`/api/activities/${userId}?timeframe=${timeframe}`).then(r => r.json()),
        fetch(`/api/activities/${userId}/stats?timeframe=${timeframe}`).then(r => r.json())
      ]);
      setActivities(activitiesData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login': return <Login />;
      case 'logout': return <Logout />;
      case 'view_project': return <Visibility />;
      case 'create_project': return <Edit />;
      case 'delete_project': return <Delete />;
      case 'export_report': return <Download />;
      case 'bulk_action': return <Group />;
      default: return <Edit />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'login':
      case 'create_project':
        return 'success';
      case 'logout':
      case 'delete_project':
        return 'error';
      case 'view_project':
        return 'info';
      case 'export_report':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const renderActivityTimeline = () => (
    <Timeline>
      {activities.map((activity, index) => (
        <TimelineItem key={activity.id}>
          <TimelineSeparator>
            <TimelineDot color={getActivityColor(activity.activity_type)} />
            {index < activities.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            <Typography variant="body1">{activity.description}</Typography>
            <Typography variant="caption" color="textSecondary">
              {formatDistanceToNow(new Date(activity.timestamp))}
            </Typography>
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Paper>
            <Typography variant="h6" gutterBottom>
              Activity Timeline
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              renderActivityTimeline()
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ActivityDashboard; 