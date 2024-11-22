import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  LinearProgress,
  Pagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const SearchResults = ({
  results,
  aggregations,
  loading,
  page,
  limit,
  onPageChange,
  onLimitChange,
}) => {
  const renderStatusChart = () => (
    <Box sx={{ height: 300, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Status Distribution
      </Typography>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={aggregations.status}
            dataKey="doc_count"
            nameKey="key"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {aggregations.status.map((entry, index) => (
              <Cell key={entry.key} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );

  const renderRegionChart = () => (
    <Box sx={{ height: 300, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Regional Distribution
      </Typography>
      <ResponsiveContainer>
        <BarChart data={aggregations.region}>
          <XAxis dataKey="key" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="doc_count" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );

  return (
    <Box>
      {loading && <LinearProgress />}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          {renderStatusChart()}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderRegionChart()}
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {results.hits.map((hit) => (
          <Grid item xs={12} key={hit.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {hit.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={hit.status}
                    color={
                      hit.status === 'completed'
                        ? 'success'
                        : hit.status === 'in_progress'
                        ? 'primary'
                        : 'default'
                    }
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={hit.region}
                    variant="outlined"
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" component="span">
                    Relevance Score: {hit.score.toFixed(2)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  MSP: {hit.msp} | Partner: {hit.partner}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl size="small">
          <InputLabel>Items per page</InputLabel>
          <Select
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            label="Items per page"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </FormControl>

        <Pagination
          count={Math.ceil(results.total / limit)}
          page={page}
          onChange={(e, newPage) => onPageChange(newPage)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default SearchResults; 