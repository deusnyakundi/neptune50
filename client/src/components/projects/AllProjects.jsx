import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  InputAdornment,
  Button,
  Chip,
  Menu,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Search,
  FilterList,
  GetApp,
  MoreVert,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import api from '../../utils/api';
import { PROJECT_STATUS, PROJECT_STATUS_COLORS, formatDate } from '../../utils/projectUtils';

const AllProjects = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: [],
    region: [],
    msp: [],
    partner: [],
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch projects
  const { data: projects, isLoading } = useQuery(
    ['projects', filters],
    async () => {
      const response = await api.get('/projects', {
        params: {
          search: searchTerm,
          ...filters,
        },
      });
      return response.data;
    }
  );

  const handleExportExcel = async () => {
    try {
      const response = await api.get('/projects/export', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'projects.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      enqueueSnackbar('Failed to export projects', { variant: 'error' });
    }
  };

  const handleMenuOpen = (event, project) => {
    setAnchorEl(event.currentTarget);
    setSelectedProject(project);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedProject(null);
  };

  const columns = [
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <Typography noWrap>{params.value}</Typography>
        </Tooltip>
      ),
    },
    { field: 'region', headerName: 'Region', flex: 1 },
    {
      field: 'assigned_engineer',
      headerName: 'Engineer',
      flex: 1,
      valueGetter: (params) => params.row.engineer?.name || 'Unassigned',
    },
    { field: 'msp', headerName: 'MSP', flex: 1 },
    { field: 'partner', headerName: 'Partner', flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: PROJECT_STATUS_COLORS[params.value],
            color: 'white',
          }}
        />
      ),
    },
    {
      field: 'created_at',
      headerName: 'Created',
      flex: 1,
      valueFormatter: (params) => formatDate(params.value),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 100,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(event) => handleMenuOpen(event, params.row)}
        >
          <MoreVert />
        </IconButton>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">All Projects</Typography>
        <Button
          variant="contained"
          startIcon={<GetApp />}
          onClick={handleExportExcel}
        >
          Export to Excel
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <DataGrid
            rows={projects || []}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            autoHeight
            loading={isLoading}
            getRowId={(row) => row.id}
            disableSelectionOnClick
          />
        </CardContent>
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>View Details</MenuItem>
        <MenuItem onClick={handleMenuClose}>Edit Project</MenuItem>
        <MenuItem onClick={handleMenuClose}>Change Status</MenuItem>
        <MenuItem onClick={handleMenuClose}>Reassign Engineer</MenuItem>
      </Menu>
    </Box>
  );
};

export default AllProjects; 