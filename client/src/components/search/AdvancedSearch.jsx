import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Typography,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { DateRangePicker } from '@mui/lab';
import { ExpandMore, Search, FilterList } from '@mui/icons-material';
import { useDebounce } from '../../hooks/useDebounce';

const AdvancedSearch = ({ onSearch, aggregations }) => {
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: '',
    region: '',
    dateRange: null,
    sortBy: 'created_at',
    sortOrder: 'desc',
  });

  const [expanded, setExpanded] = useState(false);
  const debouncedSearch = useDebounce(searchParams.search, 300);

  useEffect(() => {
    onSearch(searchParams);
  }, [debouncedSearch, searchParams.status, searchParams.region, searchParams.dateRange]);

  const handleChange = (field) => (event) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateRangeChange = (newRange) => {
    setSearchParams(prev => ({
      ...prev,
      dateRange: newRange,
    }));
  };

  const handleClearFilters = () => {
    setSearchParams({
      search: '',
      status: '',
      region: '',
      dateRange: null,
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const getActiveFiltersCount = () => {
    return Object.values(searchParams).filter(value => value && value !== '').length;
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search projects..."
          value={searchParams.search}
          onChange={handleChange('search')}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
          }}
        />
      </Box>

      <Accordion expanded={expanded} onChange={() => setExpanded(!expanded)}>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1 }} />
            <Typography>Advanced Filters</Typography>
            {getActiveFiltersCount() > 0 && (
              <Chip
                size="small"
                label={getActiveFiltersCount()}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={searchParams.status}
                  onChange={handleChange('status')}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  {aggregations?.status?.map(status => (
                    <MenuItem key={status.key} value={status.key}>
                      {status.key} ({status.doc_count})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={searchParams.region}
                  onChange={handleChange('region')}
                  label="Region"
                >
                  <MenuItem value="">All</MenuItem>
                  {aggregations?.region?.map(region => (
                    <MenuItem key={region.key} value={region.key}>
                      {region.key} ({region.doc_count})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <DateRangePicker
                value={searchParams.dateRange}
                onChange={handleDateRangeChange}
                renderInput={(startProps, endProps) => (
                  <>
                    <TextField {...startProps} />
                    <Box sx={{ mx: 2 }}> to </Box>
                    <TextField {...endProps} />
                  </>
                )}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default AdvancedSearch; 