import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import api from '../../utils/api';

const REGIONS = [
  'NAIROBI EAST',
  'NAIROBI WEST',
  'CENTRAL',
  'COAST',
  'EASTERN',
  'NORTH EASTERN',
  'NYANZA',
  'RIFT VALLEY',
  'WESTERN',
];

const EngineerManagement = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    region: '',
  });

  // Fetch engineers
  const { data: engineers, isLoading } = useQuery('engineers', async () => {
    const response = await api.get('/engineers');
    return response.data;
  });

  // Create engineer mutation
  const createEngineer = useMutation(
    async (engineerData) => {
      const response = await api.post('/engineers', engineerData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('engineers');
        enqueueSnackbar('Engineer assigned successfully', { variant: 'success' });
        handleCloseDialog();
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to assign engineer',
          { variant: 'error' }
        );
      },
    }
  );

  // Update engineer mutation
  const updateEngineer = useMutation(
    async ({ id, region }) => {
      const response = await api.put(`/engineers/${id}`, { region });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('engineers');
        enqueueSnackbar('Engineer updated successfully', { variant: 'success' });
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to update engineer',
          { variant: 'error' }
        );
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email.endsWith('@safaricom.co.ke')) {
      enqueueSnackbar('Email must be a @safaricom.co.ke address', {
        variant: 'error',
      });
      return;
    }
    createEngineer.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      email: '',
      region: '',
    });
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    {
      field: 'region',
      headerName: 'Region',
      flex: 1,
      editable: true,
      type: 'singleSelect',
      valueOptions: REGIONS,
    },
    {
      field: 'created_at',
      headerName: 'Assigned Date',
      flex: 1,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
    },
  ];

  const handleCellEditCommit = (params) => {
    if (params.field === 'region') {
      updateEngineer.mutate({
        id: params.id,
        region: params.value,
      });
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">Engineer Management</Typography>
        <Button
          variant="contained"
          onClick={() => setOpenDialog(true)}
        >
          Add Engineer
        </Button>
      </Box>

      <Dialog
        open={openDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Engineer</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Region"
              name="region"
              select
              value={formData.region}
              onChange={handleChange}
              fullWidth
            >
              {REGIONS.map((region) => (
                <MenuItem key={region} value={region}>
                  {region}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            color="secondary"
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <DataGrid
        rows={engineers}
        columns={columns}
        loading={isLoading}
        onCellEditCommit={handleCellEditCommit}
      />
    </Box>
  );
};

export default EngineerManagement; 