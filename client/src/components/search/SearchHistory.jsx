import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Box,
  Tab,
  Tabs,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import {
  History,
  Bookmark,
  BookmarkBorder,
  Delete,
  Search,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const SearchHistory = ({ open, onClose, onApplySearch }) => {
  const [tab, setTab] = useState(0);
  const [history, setHistory] = useState([]);
  const [savedSearches, setSavedSearches] = useState([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [selectedSearch, setSelectedSearch] = useState(null);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    loadHistory();
    loadSavedSearches();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await fetch('/api/search/history');
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error('Failed to load search history:', error);
    }
  };

  const loadSavedSearches = async () => {
    try {
      const response = await fetch('/api/search/saved');
      const data = await response.json();
      setSavedSearches(data);
    } catch (error) {
      console.error('Failed to load saved searches:', error);
    }
  };

  const handleSaveSearch = async () => {
    try {
      await fetch('/api/search/saved', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: searchName,
          ...selectedSearch,
        }),
      });
      setSaveDialogOpen(false);
      setSearchName('');
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to save search:', error);
    }
  };

  const handleDeleteSavedSearch = async (searchId) => {
    try {
      await fetch(`/api/search/saved/${searchId}`, {
        method: 'DELETE',
      });
      loadSavedSearches();
    } catch (error) {
      console.error('Failed to delete saved search:', error);
    }
  };

  const renderSearchItem = (item, isSaved = false) => (
    <ListItem button onClick={() => onApplySearch(item)}>
      <ListItemIcon>
        <Search />
      </ListItemIcon>
      <ListItemText
        primary={isSaved ? item.name : item.search_query}
        secondary={
          <>
            <Typography variant="caption" component="span">
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
              })}
            </Typography>
            {!isSaved && (
              <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                • {item.results_count} results
              </Typography>
            )}
          </>
        }
      />
      <ListItemSecondaryAction>
        {!isSaved ? (
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedSearch(item);
              setSaveDialogOpen(true);
            }}
          >
            <BookmarkBorder />
          </IconButton>
        ) : (
          <IconButton
            edge="end"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteSavedSearch(item.id);
            }}
          >
            <Delete />
          </IconButton>
        )}
      </ListItemSecondaryAction>
    </ListItem>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        PaperProps={{ sx: { width: 400 } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Search History
          </Typography>
          <Tabs value={tab} onChange={(e, newValue) => setTab(newValue)}>
            <Tab icon={<History />} label="Recent" />
            <Tab icon={<Bookmark />} label="Saved" />
          </Tabs>
        </Box>
        <Divider />
        <List>
          {tab === 0
            ? history.map((item) => renderSearchItem(item))
            : savedSearches.map((item) => renderSearchItem(item, true))}
        </List>
      </Drawer>

      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Search</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Search Name"
            fullWidth
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveSearch} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SearchHistory; 