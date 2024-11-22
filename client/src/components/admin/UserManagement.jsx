import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useSnackbar } from 'notistack';
import api from '../../utils/api';

const UserManagement = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
  });

  // Fetch users
  const { data: users, isLoading } = useQuery('users', async () => {
    const response = await api.get('/users');
    return response.data;
  });

  // Create user mutation
  const createUser = useMutation(
    async (userData) => {
      const response = await api.post('/users', userData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('users');
        enqueueSnackbar('User created successfully', { variant: 'success' });
        handleCloseDialog();
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to create user',
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
    createUser.mutate(formData);
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
      name: '',
      email: '',
      password: '',
      role: 'user',
    });
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'username', headerName: 'Username', flex: 1 },
    { field: 'role', headerName: 'Role', flex: 1 },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      valueFormatter: (params) => {
        return new Date(params.value).toLocaleDateString();
      },
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h5">User Management</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
          Add New User
        </Button>
      </Box>

      <Card>
        <CardContent>
          <DataGrid
            rows={users || []}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            autoHeight
            loading={isLoading}
            getRowId={(row) => row.email}
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create New User</DialogTitle>
          <DialogContent>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              helperText="Must be a @safaricom.co.ke email address"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="engineer">Engineer</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createUser.isLoading}
            >
              Create User
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManagement; 