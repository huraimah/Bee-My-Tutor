import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc } from 'firebase/firestore';
import { auth, storage, db } from '../utils/firebase';
import { uploadWithRetry } from '../utils/firebase-utils';

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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const UploadMaterial = () => {
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
  
  useEffect(() => {
    console.log('API URL:', process.env.REACT_APP_API_URL);
  }, []);

  const { title, description, subject, file } = formData;

  // Clear error on mount
  useEffect(() => {
    setError(null);
  }, []);
  
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  
  const handleFileChange = e => {
    const selectedFile = e.target.files[0];
    
    if (selectedFile) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setFormErrors(prev => ({
          ...prev,
          file: 'Only PDF and DOCX files are allowed'
        }));
        return;
      }
      
      if (selectedFile.size > 10 * 1024 * 1024) {
        setFormErrors(prev => ({
          ...prev,
          file: 'File size should not exceed 10MB'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        file: selectedFile
      }));
      
      if (formErrors.file) {
        setFormErrors(prev => ({
          ...prev,
          file: ''
        }));
      }
    }
  };
  
  const validateStep = (step) => {
    const errors = {};
    
    if (step === 0 && !file) {
      errors.file = 'Please select a file to upload';
    } else if (step === 1) {
      if (!title.trim()) errors.title = 'Title is required';
      if (!description.trim()) errors.description = 'Description is required';
      if (!subject) errors.subject = 'Subject is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    }
  };
  
  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateStep(activeStep)) {
      setLoading(true);
      setError(null);
      
      try {
        const metadata = {
          contentType: file.type,
          customMetadata: {
            originalName: file.name
          }
        };
      
        const storageRef = ref(storage, `materials/${Date.now()}-${file.name}`);
        const uploadTask = await uploadWithRetry(storageRef, file, metadata);
      
        uploadTask.on('state_changed',
          // ...existing progress handler...
        );
      } catch (err) {
        console.error('Upload error:', err);
        setError('Upload failed. Please try again.');
        setLoading(false);
      }

      try {
        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
          throw new Error('File size should not exceed 10MB');
        }

        // Create optimized file name
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop();
        const fileName = `${timestamp}.${fileExtension}`;
        const storageRef = ref(storage, `materials/${fileName}`);

        // Create upload task with chunked upload
        const uploadTask = uploadBytesResumable(storageRef, file, {
          customMetadata: {
            originalName: file.name
          }
        });

        // Handle upload state changes
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setUploadProgress(Math.round(progress));
            
            // Log transfer rate
            const delta = snapshot.bytesTransferred / ((Date.now() - timestamp) / 1000);
            console.log(`Upload rate: ${(delta / (1024 * 1024)).toFixed(2)} MB/s`);
          },
          (error) => {
            console.error('Upload error:', error);
            setError('Failed to upload file. Please try again.');
            setLoading(false);
          },
          async () => {
            try {
              // Get download URL
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              
              // Save to Firestore with optimized data
              const materialData = {
                title,
                description,
                subject,
                fileUrl: downloadURL,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                userId: auth.currentUser?.uid,
                createdAt: new Date().toISOString()
              };

              await addDoc(collection(db, 'materials'), materialData);
              
              setSuccess(true);
              setTimeout(() => navigate('/materials'), 1500);
            } catch (err) {
              console.error('Firestore error:', err);
              setError('Failed to save material information.');
              setLoading(false);
            }
          }
        );
      } catch (err) {
        console.error('Upload error:', err);
        setError(err.message || 'Failed to upload study material.');
        setLoading(false);
      }
    }
  };

  // Success view
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

  // Main render
  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <CloudUploadIcon color="primary" sx={{ mr: 2, fontSize: 30 }} />
          <Typography variant="h4" component="h1">
            Upload Study Material
          </Typography>
        </Box>
        
        {error && !loading && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {[
            { label: 'Select File' },
            { label: 'Add Details' },
            { label: 'Review & Upload' }
          ].map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {activeStep === 0 && 'Choose a PDF or DOCX file to upload'}
          {activeStep === 1 && 'Provide information about your study material'}
          {activeStep === 2 && 'Review your information and upload'}
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* Step 1: File Upload */}
          {activeStep === 0 && (
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
          )}

          {/* Step 2: Details */}
          {activeStep === 1 && (
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
          )}

          {/* Step 3: Review */}
          {activeStep === 2 && (
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
          )}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              {activeStep === 2 ? (
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