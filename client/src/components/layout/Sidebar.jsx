import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Collapse,
  Divider,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard,
  Engineering,
  Assignment,
  People,
  Settings,
  ExpandLess,
  ExpandMore,
  Add,
  List as ListIcon,
  Pending,
  CloudUpload,
} from '@mui/icons-material';
import { useState } from 'react';

const DRAWER_WIDTH = 240;

const Sidebar = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projectsOpen, setProjectsOpen] = useState(true);

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      roles: ['admin', 'user', 'engineer'],
    },
    {
      title: 'Projects',
      icon: <Assignment />,
      subItems: [
        { title: 'New Project', icon: <Add />, path: '/projects/new' },
        { title: 'All Projects', icon: <ListIcon />, path: '/projects/all' },
        { title: 'Pending Projects', icon: <Pending />, path: '/projects/pending' },
        { title: 'My Projects', icon: <Assignment />, path: '/projects/my-projects' },
      ],
      roles: ['admin', 'user', 'engineer'],
    },
    {
      title: 'Bulk Provisioning',
      icon: <CloudUpload />,
      path: '/bulk-provisioning',
      roles: ['admin', 'user'],
    },
    {
      title: 'Engineers',
      icon: <Engineering />,
      path: '/engineers',
      roles: ['admin'],
    },
    {
      title: 'Users',
      icon: <People />,
      path: '/users',
      roles: ['admin'],
    },
    {
      title: 'Settings',
      icon: <Settings />,
      path: '/settings',
      roles: ['admin'],
    },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  const drawerContent = (
    <>
      <Box 
        sx={{ 
          p: 2, 
          height: '64px', // Match AppBar height
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6" noWrap component="div">
          PERN Provisioning
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => {
          if (!item.roles.includes(user?.role)) return null;

          if (item.subItems) {
            return (
              <Box key={item.title}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => setProjectsOpen(!projectsOpen)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.title} />
                    {projectsOpen ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={projectsOpen} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItemButton
                        key={subItem.path}
                        sx={{ pl: 4 }}
                        selected={location.pathname === subItem.path}
                        onClick={() => handleNavigate(subItem.path)}
                      >
                        <ListItemIcon>{subItem.icon}</ListItemIcon>
                        <ListItemText primary={subItem.title} />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => handleNavigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.title} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{ 
        width: { md: DRAWER_WIDTH }, 
        flexShrink: { md: 0 },
        '& .MuiDrawer-paper': {
          mt: '64px', // Match AppBar height
          height: 'calc(100% - 64px)',
          borderRight: (theme) => `1px solid ${theme.palette.divider}`
        }
      }}
    >
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={open}
          onClose={onClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          open={open}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              transform: open ? 'none' : `translateX(-${DRAWER_WIDTH}px)`,
              transition: theme.transitions.create('transform', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </Box>
  );
};

export default Sidebar; 