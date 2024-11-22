import { useState, useRef } from 'react';
import { useMutation } from 'react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Refresh,
  Download,
} from '@mui/icons-material';
import api from '../../utils/api';

const BulkProvisioning = () => {
  const { enqueueSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    ticketNumber: '',
    reason: '',
  });
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);

  const provisionMutation = useMutation(
    async (data) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('ticketNumber', data.ticketNumber);
      formData.append('reason', data.reason);

      const response = await api.post('/provisioning/bulk', formData, {
        onUploadProgress: (progressEvent) => {
          const progress = (progressEvent.loaded / progressEvent.total) * 100;
          setProgress(progress);
        },
      });

      return response.data;
    },
    {
      onSuccess: (data) => {
        setResults(data.results);
        enqueueSnackbar('Provisioning completed', { variant: 'success' });
        setProgress(0);
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Provisioning failed',
          { variant: 'error' }
        );
        setProgress(0);
      },
    }
  );

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && !selectedFile.name.endsWith('.xlsx')) {
      enqueueSnackbar('Please upload an Excel (.xlsx) file', {
        variant: 'error',
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    provisionMutation.mutate({
      file,
      ticketNumber: formData.ticketNumber,
      reason: formData.reason,
    });
  };

  return (
    <Box>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Bulk Provisioning
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Ticket Number"
              name="ticketNumber"
              value={formData.ticketNumber}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUpload />}
              component="label"
            >
              Upload Excel File
              <input
                type="file"
                accept=".xlsx"
                hidden
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Refresh />}
              onClick={handleSubmit}
              disabled={!file || !formData.ticketNumber || !formData.reason}
              style={{ marginLeft: 10 }}
            >
              Provision
            </Button>
            {progress > 0 && (
              <LinearProgress variant="determinate" value={progress} />
            )}
          </form>
        </CardContent>
      </Card>
      {results.length > 0 && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            Results
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Ticket Number</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.id}>
                    <TableCell>{result.ticketNumber}</TableCell>
                    <TableCell>{result.reason}</TableCell>
                    <TableCell>
                      {result.status === 'success' ? (
                        <CheckCircle />
                      ) : result.status === 'error' ? (
                        <Error />
                      ) : (
                        <Refresh />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Box>
  );
};

export default BulkProvisioning; 