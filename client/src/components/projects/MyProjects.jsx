import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useSnackbar } from 'notistack';
import api from '../../utils/api';
import { PROJECT_STATUS, PROJECT_STATUS_COLORS, formatDate } from '../../utils/projectUtils';

const MyProjects = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);

  // Fetch my projects
  const { data: projects, isLoading } = useQuery(
    'myProjects',
    async () => {
      const response = await api.get('/projects/my-projects');
      return response.data;
    }
  );

  // Update project status mutation
  const updateStatus = useMutation(
    async ({ projectId, status, notes }) => {
      const response = await api.put(`/projects/${projectId}/status`, {
        status,
        notes,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('myProjects');
        enqueueSnackbar('Project status updated successfully', {
          variant: 'success',
        });
        handleCloseStatusDialog();
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to update project status',
          { variant: 'error' }
        );
      },
    }
  );

  const handleUpdateStatus = (project) => {
    setSelectedProject(project);
    setOpenStatusDialog(true);
  };

  const handleCloseStatusDialog = () => {
    setSelectedProject(null);
    setOpenStatusDialog(false);
  };

  const columns = [
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
    },
    { field: 'region', headerName: 'Region', flex: 1 },
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
      width: 120,
      renderCell: (params) => (
        <Button
          size="small"
          variant="outlined"
          onClick={() => handleUpdateStatus(params.row)}
        >
          Update Status
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        My Projects
      </Typography>

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

      <UpdateStatusDialog
        open={openStatusDialog}
        onClose={handleCloseStatusDialog}
        onConfirm={handleUpdateStatus}
        project={selectedProject}
        loading={updateStatus.isLoading}
      />
    </Box>
  );
};

// Update Status Dialog Component
const UpdateStatusDialog = ({ open, onClose, onConfirm, project, loading }) => {
  const [status, setStatus] = useState(project?.status || PROJECT_STATUS.PENDING);
  const [notes, setNotes] = useState(project?.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      projectId: project.id,
      status,
      notes,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Update Project Status</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Current Status: {project?.status}
          </Typography>
          <TextField
            fullWidth
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            margin="normal"
          >
            {Object.keys(PROJECT_STATUS).map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Update Status
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default MyProjects; 