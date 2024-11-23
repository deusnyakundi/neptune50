import { useState } from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Chip
} from '@mui/material';
import { PendingActions } from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import api from '../../utils/api';

const PendingProjects = () => {
  const { enqueueSnackbar } = useSnackbar();

  // Fetch pending projects with error handling
  const { data: projects, isLoading, error } = useQuery(
    'pendingProjects',
    async () => {
      try {
        const response = await api.get('/projects/pending');
        return response.data;
      } catch (error) {
        console.error('Error fetching pending projects:', error);
        enqueueSnackbar(error.response?.data?.message || 'Failed to fetch pending projects', {
          variant: 'error',
        });
        throw error;
      }
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error) => {
        if (error.response?.status === 401) {
          enqueueSnackbar('Session expired. Please login again.', {
            variant: 'error',
          });
        }
      },
    }
  );

  // Loading state
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center', 
          backgroundColor: 'transparent',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ color: 'error.main' }}>
          <Typography variant="h6">
            Error Loading Projects
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {error.response?.data?.message || error.message}
          </Typography>
        </Box>
      </Paper>
    );
  }

  // No projects state
  if (!projects?.length) {
    return (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          textAlign: 'center', 
          backgroundColor: 'transparent',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <PendingActions sx={{ fontSize: 60, color: 'text.secondary' }} />
          <Typography variant="h6" color="text.secondary">
            No Pending Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            All projects are currently up to date
          </Typography>
        </Box>
      </Paper>
    );
  }

  // Projects table
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Pending Projects
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Total: {projects.length}
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Engineer</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.map((project) => (
              <TableRow 
                key={project.id}
                hover
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{project.name}</TableCell>
                <TableCell>{project.client}</TableCell>
                <TableCell>{project.engineer_name || 'Unassigned'}</TableCell>
                <TableCell>
                  <Chip 
                    label={project.status}
                    color={
                      project.status === 'pending_approval' ? 'warning' :
                      project.status === 'pending_assignment' ? 'info' :
                      'default'
                    }
                    size="small"
                    sx={{ minWidth: '120px' }}
                  />
                </TableCell>
                <TableCell>
                  {new Date(project.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PendingProjects;