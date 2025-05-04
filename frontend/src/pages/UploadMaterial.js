import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../api.js";
import { AuthContext } from '../context/AuthContext';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';

// Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const UploadMaterial = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    file: null
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const { title, description, subject, file } = formData;
  
  const subjects = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'Computer Science',
    'History',
    'Geography',
    'Literature',
    'Languages',
    'Economics',
    'Business Studies',
    'Psychology',
    'Sociology',
    'Art',
    'Music',
    'Physical Education',
    'Other'
  ];
  
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      // Check file type
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setFormErrors({
          ...formErrors,
          file: 'Only PDF and DOCX files are allowed'
        });
        return;
      }
      
      // Check file size (max 10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFormErrors({
          ...formErrors,
          file: 'File size should not exceed 10MB'
        });
        return;
      }
      
      setFormData({
        ...formData,
        file: selectedFile
      });
      
      // Clear file error
      if (formErrors.file) {
        setFormErrors({
          ...formErrors,
          file: ''
        });
      }
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0) {
      if (!file) {
        errors.file = 'Please select a file to upload';
      }
    } else if (step === 1) {
      if (!title.trim()) {
        errors.title = 'Title is required';
      }
      
      if (!description.trim()) {
        errors.description = 'Description is required';
      }
      
      if (!subject) {
        errors.subject = 'Subject is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep(activeStep)) {
      setLoading(true);
      setError(null);
      
      const formDataToSend = new FormData();
      formDataToSend.append('title', title);
      formDataToSend.append('description', description);
      formDataToSend.append('subject', subject);
      formDataToSend.append('file', file);
      
      try {
        await api.post('/api/study/materials', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
          }
        });
        
        setSuccess(true);
        setLoading(false);
        
        // Redirect to study materials page after 2 seconds
        setTimeout(() => {
          navigate('/materials');
        }, 2000);
      } catch (err) {
        setLoading(false);
        setError(err.response?.data?.msg || 'Failed to upload study material. Please try again.');
      }
    }
  };
  
  const steps = [
    {
      label: 'Select File',
      description: 'Choose a PDF or DOCX file to upload',
      content: (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <input
            accept=".pdf,.docx"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileChange}
          />
          <label htmlFor="file-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUploadIcon />}
              size="large"
              sx={{ mb: 3 }}
            >
              Select File
            </Button>
          </label>
          
          {formErrors.file && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {formErrors.file}
            </Alert>
          )}
          
          {file && (
            <Paper sx={{ p: 3, mt: 3, maxWidth: 400, mx: 'auto' }}>
              <DescriptionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {file.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </Typography>
              <Chip 
                label={file.type.includes('pdf') ? 'PDF' : 'DOCX'} 
                color="primary" 
                size="small" 
                sx={{ mt: 1 }} 
              />
            </Paper>
          )}
        </Box>
      )
    },
    {
      label: 'Add Details',
      description: 'Provide information about your study material',
      content: (
        <Box sx={{ py: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="title"
                label="Title"
                name="title"
                value={title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="description"
                label="Description"
                name="description"
                value={description}
                onChange={handleChange}
                multiline
                rows={4}
                error={!!formErrors.description}
                helperText={formErrors.description}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required error={!!formErrors.subject}>
                <InputLabel id="subject-label">Subject</InputLabel>
                <Select
                  labelId="subject-label"
                  id="subject"
                  name="subject"
                  value={subject}
                  label="Subject"
                  onChange={handleChange}
                >
                  {subjects.map((subj) => (
                    <MenuItem key={subj} value={subj}>
                      {subj}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.subject && (
                  <Typography variant="caption" color="error">
                    {formErrors.subject}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Box>
      )
    },
    {
      label: 'Review & Upload',
      description: 'Review your information and upload',
      content: (
        <Box sx={{ py: 2 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              File Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  File Name:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {file?.name}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  File Size:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : ''}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  File Type:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {file ? (file.type.includes('pdf') ? 'PDF' : 'DOCX') : ''}
                </Typography>
              </Grid>
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="h6" gutterBottom>
              Material Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Title:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {title}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Subject:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {subject}
                </Typography>
              </Grid>
              
              <Grid item xs={4}>
                <Typography variant="body2" color="text.secondary">
                  Description:
                </Typography>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="body2">
                  {description}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )
    }
  ];
  
  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Upload Successful!
          </Typography>
          <Typography variant="body1" paragraph>
            Your study material has been uploaded successfully.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Redirecting to study materials...
          </Typography>
        </Paper>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <CloudUploadIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h4" component="h1">
            Upload Study Material
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {steps[activeStep].description}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {steps[activeStep].content}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={loading}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
          
          {loading && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Uploading: {uploadProgress}%
              </Typography>
              <LinearProgress variant="determinate" value={uploadProgress} />
            </Box>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default UploadMaterial;