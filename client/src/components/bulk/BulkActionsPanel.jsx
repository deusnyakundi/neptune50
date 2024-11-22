import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  PlayArrow,
  Pause,
  Stop,
  MoreVert,
  CloudDownload,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const BulkActionsPanel = ({
  selectedItems,
  onAction,
  onClose,
  operations,
  activeOperation,
}) => {
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);

  const handleActionClick = (type) => {
    setActionType(type);
    setConfirmDialog(true);
  };

  const handleConfirm = async () => {
    setConfirmDialog(false);
    await onAction(actionType, selectedItems);
  };

  const handleOperationMenu = (event, operation) => {
    setMenuAnchor(event.currentTarget);
    setSelectedOperation(operation);
  };

  const handleDownloadResults = async () => {
    // Implementation for downloading operation results
    setMenuAnchor(null);
  };

  const renderProgress = (operation) => {
    const progress = operation.progress || 0;
    const status = operation.status.toLowerCase();

    return (
      <Box sx={{ width: '100%', mb: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
        <Typography variant="body1" color={status === 'completed' ? 'success' : status === 'processing' ? 'warning' : 'error'}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Bulk Actions
      </Typography>
      <List>
        {operations.map((operation) => (
          <ListItem key={operation.id} onClick={(event) => handleOperationMenu(event, operation)}>
            <ListItemIcon>
              {operation.status.toLowerCase() === 'completed' ? (
                <CheckCircle />
              ) : operation.status.toLowerCase() === 'processing' ? (
                <PlayArrow />
              ) : (
                <Error />
              )}
            </ListItemIcon>
            <ListItemText primary={operation.type} secondary={formatDistanceToNow(new Date(operation.created_at))} />
            <IconButton onClick={(event) => handleOperationMenu(event, operation)}>
              <MoreVert />
            </IconButton>
          </ListItem>
        ))}
      </List>
      {activeOperation && renderProgress(activeOperation)}
      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Typography variant="body1">Are you sure you want to perform this action?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={handleDownloadResults}>Download Results</MenuItem>
      </Menu>
    </Box>
  );
};

export default BulkActionsPanel; 