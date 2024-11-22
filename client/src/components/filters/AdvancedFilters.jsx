import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { DateRangePicker } from '@mui/lab';
import { FilterList, Add, Clear } from '@mui/icons-material';

const OPERATORS = {
  text: ['equals', 'contains', 'starts_with', 'ends_with'],
  number: ['equals', 'greater_than', 'less_than', 'between'],
  date: ['equals', 'after', 'before', 'between'],
  boolean: ['equals'],
};

const AdvancedFilters = ({ fields, onFilterChange }) => {
  const [filters, setFilters] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentFilter, setCurrentFilter] = useState({
    field: '',
    operator: '',
    value: '',
    secondValue: '', // for 'between' operator
  });

  const handleAddFilter = () => {
    if (currentFilter.field && currentFilter.operator) {
      setFilters([...filters, { ...currentFilter, id: Date.now() }]);
      setCurrentFilter({ field: '', operator: '', value: '', secondValue: '' });
      setDialogOpen(false);
      
      // Notify parent component
      const updatedFilters = [...filters, currentFilter];
      onFilterChange(formatFiltersForApi(updatedFilters));
    }
  };

  const handleRemoveFilter = (filterId) => {
    const updatedFilters = filters.filter(f => f.id !== filterId);
    setFilters(updatedFilters);
    onFilterChange(formatFiltersForApi(updatedFilters));
  };

  const formatFiltersForApi = (filtersList) => {
    return filtersList.reduce((acc, filter) => {
      const { field, operator, value, secondValue } = filter;
      acc[field] = {
        operator,
        value: operator === 'between' ? [value, secondValue] : value,
      };
      return acc;
    }, {});
  };

  const renderFilterValue = (filter) => {
    const field = fields.find(f => f.key === filter.field);
    const value = filter.operator === 'between'
      ? `${filter.value} - ${filter.secondValue}`
      : filter.value;

    return `${field.label} ${filter.operator.replace('_', ' ')} ${value}`;
  };

  const renderFilterInput = () => {
    const field = fields.find(f => f.key === currentFilter.field);
    if (!field) return null;

    switch (field.type) {
      case 'text':
        return <TextField label="Value" value={currentFilter.value} onChange={(e) => setCurrentFilter({ ...currentFilter, value: e.target.value })} />;
      case 'number':
        return <TextField label="Value" type="number" value={currentFilter.value} onChange={(e) => setCurrentFilter({ ...currentFilter, value: e.target.value })} />;
      case 'date':
        return <DateRangePicker
          startText="From"
          endText="To"
          value={[currentFilter.value, currentFilter.secondValue]}
          onChange={(newValue) => setCurrentFilter({ ...currentFilter, value: newValue[0], secondValue: newValue[1] })}
        />;
      case 'boolean':
        return <FormControlLabel
          control={<Switch checked={currentFilter.value === 'true'} onChange={(e) => setCurrentFilter({ ...currentFilter, value: e.target.checked ? 'true' : 'false' })} />}
          label="Value"
        />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Button variant="outlined" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
        Add Filter
      </Button>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Add Filter</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Field</InputLabel>
            <Select value={currentFilter.field} onChange={(e) => setCurrentFilter({ ...currentFilter, field: e.target.value })}>
              {fields.map(field => (
                <MenuItem key={field.key} value={field.key}>{field.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Operator</InputLabel>
            <Select value={currentFilter.operator} onChange={(e) => setCurrentFilter({ ...currentFilter, operator: e.target.value })}>
              {OPERATORS[currentFilter.field].map(operator => (
                <MenuItem key={operator} value={operator}>{operator.replace('_', ' ')}</MenuItem>
              ))}
            </Select>
          </FormControl>
          {renderFilterInput()}
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddFilter}>Add</Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
      <Box sx={{ mt: 2 }}>
        {filters.map(filter => (
          <Chip key={filter.id} label={renderFilterValue(filter)} onDelete={() => handleRemoveFilter(filter.id)} />
        ))}
      </Box>
    </Box>
  );
};

export default AdvancedFilters; 