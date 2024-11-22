import {
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
} from '@mui/material';

const MetricCard = ({ title, value, icon, color }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              bgcolor: `${color}15`,
              color: color,
            }}
          >
            {icon}
          </Avatar>
          <Box>
            <Typography color="textSecondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h5" component="div">
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MetricCard; 