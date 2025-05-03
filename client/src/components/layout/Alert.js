import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

const AlertComponent = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Alert = () => {
  const { error, clearError } = useContext(AuthContext);

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    clearError();
  };

  return (
    <Snackbar
      open={error !== null}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      {error && (
        <AlertComponent
          onClose={handleClose}
          severity="error"
          sx={{ width: '100%' }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleClose}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {error}
        </AlertComponent>
      )}
    </Snackbar>
  );
};

export default Alert;