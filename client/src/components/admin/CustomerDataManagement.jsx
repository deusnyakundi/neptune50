import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { CloudUpload, Error, CheckCircle } from '@mui/icons-material';
import api from '../../utils/api';

const CustomerDataManagement = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const [file, setFile] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [openConflictDialog, setOpenConflictDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation(
    async (formData) => {
      const response = await api.post('/customer-data/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setUploadProgress(progress);
        },
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        if (data.conflicts && data.conflicts.length > 0) {
          setConflicts(data.conflicts);
          setOpenConflictDialog(true);
        } else {
          enqueueSnackbar('Data uploaded successfully', { variant: 'success' });
          queryClient.invalidateQueries('customerData');
        }
        setFile(null);
        setUploadProgress(0);
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Upload failed',
          { variant: 'error' }
        );
        setFile(null);
        setUploadProgress(0);
      },
    }
  );

  const resolveConflictMutation = useMutation(
    async ({ conflictId, resolution }) => {
      const response = await api.post('/customer-data/resolve-conflict', {
        conflictId,
        resolution,
      });
      return response.data;
    },
    {
      onSuccess: () => {
        enqueueSnackbar('Conflict resolved successfully', { variant: 'success' });
        queryClient.invalidateQueries('customerData');
        setConflicts((prev) => prev.filter((c) => c.id !== conflictId));
        if (conflicts.length === 1) {
          setOpenConflictDialog(false);
        }
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to resolve conflict',
          { variant: 'error' }
        );
      },
    }
  );

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        enqueueSnackbar('Please upload an Excel (.xlsx) file', {
          variant: 'error',
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = () => {
    if (!file) {
      enqueueSnackbar('Please select an Excel file to upload', {
        variant: 'error',
      });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate(formData);
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Customer Data Management
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CloudUpload />}
            onClick={() => document.getElementById('fileInput').click()}
          >
            Upload Excel File
          </Button>
          {uploadProgress > 0 && (
            <LinearProgress variant="determinate" value={uploadProgress} />
          )}
          <input
            id="fileInput"
            type="file"
            hidden
            accept=".xlsx"
            onChange={handleFileChange}
          />
          <Button variant="contained" color="primary" onClick={handleUpload}>
            Upload
          </Button>
        </CardContent>
      </Card>
      {conflicts.length > 0 && (
        <Dialog open={openConflictDialog} onClose={() => setOpenConflictDialog(false)}>
          <DialogTitle>Conflict Resolution</DialogTitle>
          <DialogContent>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Conflict ID</TableCell>
                  <TableCell>Resolution</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {conflicts.map((conflict) => (
                  <TableRow key={conflict.id}>
                    <TableCell>{conflict.id}</TableCell>
                    <TableCell>{conflict.resolution}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => resolveConflictMutation.mutate({ conflictId: conflict.id, resolution: 'Resolved' })}
                      >
                        Resolve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConflictDialog(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default CustomerDataManagement; 