import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
import { PlayArrow } from '@mui/icons-material';
import api from '../../utils/api';
import { PROJECT_STATUS, PROJECT_STATUS_COLORS, formatDate } from '../../utils/projectUtils';

const PendingProjects = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  // Fetch pending projects
  const { data: projects, isLoading } = useQuery(
    'pendingProjects',
    async () => {
      const response = await api.get('/projects', {
        params: { status: PROJECT_STATUS.PENDING },
      });
      return response.data;
    }
  );

  // Start project mutation
  const startProject = useMutation(
    async ({ projectId, notes }) => {
      const response = await api.post(`/projects/${projectId}/start`, { notes });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pendingProjects');
        enqueueSnackbar('Project started successfully', { variant: 'success' });
        handleCloseDialog();
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to start project',
          { variant: 'error' }
        );
      },
    }
  );

  const handleStartProject = (project) => {
    setSelectedProject(project);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedProject(null);
    setOpenDialog(false);
  };

  const handleConfirmStart = (notes) => {
    startProject.mutate({
      projectId: selectedProject.id,
      notes,
    });
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
          variant="contained"
          color="primary"
          startIcon={<PlayArrow />}
          onClick={() => handleStartProject(params.row)}
        >
          Start
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Pending Projects
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

      <StartProjectDialog
        open={openDialog}
        onClose={handleCloseDialog}
        onConfirm={handleConfirmStart}
        project={selectedProject}
        loading={startProject.isLoading}
      />
    </Box>
  );
};

// Start Project Dialog Component
const StartProjectDialog = ({ open, onClose, onConfirm, project, loading }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(notes);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Start Project</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            Are you sure you want to start this project?
          </Typography>
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
            Start Project
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PendingProjects;