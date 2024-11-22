import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from 'react-query';
import { useSnackbar } from 'notistack';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  MenuItem,
  Grid,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import api from '../../utils/api';

const NewProject = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    description: '',
    region: '',
    msp: '',
    partner: '',
  });

  // Fetch regions
  const { data: regions } = useQuery('regions', async () => {
    const response = await api.get('/regions');
    return response.data;
  });

  // Create project mutation
  const createProject = useMutation(
    async (projectData) => {
      const response = await api.post('/projects', projectData);
      return response.data;
    },
    {
      onSuccess: () => {
        enqueueSnackbar('Project created successfully', { variant: 'success' });
        navigate('/projects/all');
      },
      onError: (error) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Failed to create project',
          { variant: 'error' }
        );
      },
    }
  );

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createProject.mutate(formData);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Create New Project
      </Typography>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={4}
                  label="Project Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  select
                  label="Region"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                >
                  {regions?.map((region) => (
                    <MenuItem key={region.id} value={region.name}>
                      {region.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="MSP"
                  name="msp"
                  value={formData.msp}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  required
                  fullWidth
                  label="Partner"
                  name="partner"
                  value={formData.partner}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/projects/all')}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    loading={createProject.isLoading}
                  >
                    Create Project
                  </LoadingButton>
                </Box>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NewProject; 