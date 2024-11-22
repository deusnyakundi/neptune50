import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { PROJECT_STATUS_COLORS } from '../../utils/projectUtils';

const ProjectsTable = ({ projects }) => {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Description</TableCell>
          <TableCell>Region</TableCell>
          <TableCell>Engineer</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Created</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            <TableCell>{project.description}</TableCell>
            <TableCell>{project.region}</TableCell>
            <TableCell>{project.engineer?.name || 'Unassigned'}</TableCell>
            <TableCell>
              <Chip
                label={project.status}
                size="small"
                sx={{
                  bgcolor: PROJECT_STATUS_COLORS[project.status],
                  color: 'white',
                }}
              />
            </TableCell>
            <TableCell>
              {new Date(project.created_at).toLocaleDateString()}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable; 