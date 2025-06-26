import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import EventIcon from '@mui/icons-material/Event';

const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <EventIcon sx={{ mr: 2 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <RouterLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            예약 시스템
          </RouterLink>
        </Typography>
        <Box>
          <Button color="inherit" component={RouterLink} to="/">
            홈
          </Button>
          <Button color="inherit" component={RouterLink} to="/login">
            로그인
          </Button>
          <Button color="inherit" component={RouterLink} to="/register">
            회원가입
          </Button>
          <Button color="inherit" component={RouterLink} to="/dashboard">
            대시보드
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 