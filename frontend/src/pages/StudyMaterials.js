import React, { useState, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { auth, db, storage } from '../utils/firebase';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import SortIcon from '@mui/icons-material/Sort';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddIcon from '@mui/icons-material/Add';

const StudyMaterials = () => {
  // Add user check at the start
  const { user } = useContext(AuthContext);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [sortAnchorEl, setSortAnchorEl] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      if (!auth.currentUser) {
        setError('Please login to view materials');
        setLoading(false);
        return;
      }

      try {
        const materialsRef = collection(db, 'materials');
        const q = query(
          materialsRef, 
          where('userId', '==', auth.currentUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        const materialsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMaterials(materialsData);
      } catch (err) {
        console.error('Error fetching materials:', err);
        setError('Failed to load study materials');
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleSortClick = (event) => {
    setSortAnchorEl(event.currentTarget);
  };

  const handleSortClose = () => {
    setSortAnchorEl(null);
  };

  const handleFilterSelect = (subject) => {
    setSelectedSubject(subject);
    handleFilterClose();
  };

  const handleSortSelect = (sortOption) => {
    setSortBy(sortOption);
    handleSortClose();
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDeleteMaterial = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        // Get material data
        const material = materials.find(m => m.id === id);
        
        // Delete file from Storage
        const storageRef = ref(storage, material.fileUrl);
        await deleteObject(storageRef);
        
        // Delete document from Firestore
        await deleteDoc(doc(db, 'materials', id));
        
        // Update UI
        setMaterials(materials.filter(m => m.id !== id));
      } catch (err) {
        console.error('Error deleting material:', err);
        setError('Failed to delete material');
      }
    }
  };

  // Filter and sort materials
  const filteredMaterials = materials
    .filter(material => 
      (selectedSubject === 'All' || material.subject === selectedSubject) &&
      (material.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       material.description.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });

  // Get unique subjects for filter
  const subjects = ['All', ...new Set(materials.map(material => material.subject))];

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Study Materials
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={RouterLink}
          to="/materials/upload"
        >
          Upload Material
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <TextField
            placeholder="Search materials..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Box>
            <Button
              startIcon={<FilterListIcon />}
              onClick={handleFilterClick}
              variant="outlined"
              size="medium"
              sx={{ mr: 1 }}
            >
              Filter
            </Button>
            <Menu
              anchorEl={filterAnchorEl}
              open={Boolean(filterAnchorEl)}
              onClose={handleFilterClose}
            >
              {subjects.map((subject) => (
                <MenuItem
                  key={subject}
                  onClick={() => handleFilterSelect(subject)}
                  selected={selectedSubject === subject}
                >
                  {subject}
                </MenuItem>
              ))}
            </Menu>
            
            <Button
              startIcon={<SortIcon />}
              onClick={handleSortClick}
              variant="outlined"
              size="medium"
            >
              Sort
            </Button>
            <Menu
              anchorEl={sortAnchorEl}
              open={Boolean(sortAnchorEl)}
              onClose={handleSortClose}
            >
              <MenuItem
                onClick={() => handleSortSelect('newest')}
                selected={sortBy === 'newest'}
              >
                Newest First
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('oldest')}
                selected={sortBy === 'oldest'}
              >
                Oldest First
              </MenuItem>
              <MenuItem
                onClick={() => handleSortSelect('alphabetical')}
                selected={sortBy === 'alphabetical'}
              >
                Alphabetical
              </MenuItem>
            </Menu>
          </Box>
        </Box>
        
        {selectedSubject !== 'All' && (
          <Box sx={{ mt: 2 }}>
            <Chip 
              label={`Subject: ${selectedSubject}`} 
              onDelete={() => setSelectedSubject('All')} 
              color="primary" 
              variant="outlined" 
            />
          </Box>
        )}
      </Paper>

      {filteredMaterials.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No study materials found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {materials.length === 0 
              ? "You haven't uploaded any study materials yet." 
              : "No materials match your search criteria."}
          </Typography>
          {materials.length === 0 && (
            <Button
              variant="contained"
              component={RouterLink}
              to="/materials/upload"
              startIcon={<AddIcon />}
            >
              Upload Your First Material
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredMaterials.map((material) => (
            <Grid item xs={12} md={6} lg={4} key={material._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {material.title}
                    </Typography>
                    <IconButton size="small">
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Chip 
                    label={material.subject} 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ mb: 1 }} 
                  />
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {material.description.length > 100 
                      ? `${material.description.substring(0, 100)}...` 
                      : material.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      Uploaded: {new Date(material.createdAt).toLocaleDateString()}
                    </Typography>
                    <Chip 
                      label={material.fileType.toUpperCase()} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                  </Box>
                </CardContent>
                <Divider />
                <CardActions>
                  <Button 
                    size="small" 
                    component={RouterLink} 
                    to={`/materials/${material._id}`}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    color="error" 
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteMaterial(material._id)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default StudyMaterials;