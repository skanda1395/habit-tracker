import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import axiosInstance from "../api/axiosController";

const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = () => {
    axiosInstance.get("/habits")
      .then((res) => setHabits(res.data))
      .catch((err) => console.error("Error fetching habits:", err));
  };

  const handleSaveHabit = () => {
    if (!selectedHabit.name.trim()) return;
    
    if (selectedHabit._id) {
      axiosInstance.put(`/habits/${selectedHabit._id}`, selectedHabit)
        .then(() => {
          fetchHabits();
          handleClose();
        })
        .catch((err) => console.error("Error updating habit:", err));
    } else {
      axiosInstance.post("/habits", selectedHabit)
        .then(() => {
          fetchHabits();
          handleClose();
        })
        .catch((err) => console.error("Error adding habit:", err));
    }
  };

  const handleDeleteHabit = (id) => {
    axiosInstance.delete(`/habits/${id}`)
      .then(() => fetchHabits())
      .catch((err) => console.error("Error deleting habit:", err));
  };

  const handleOpen = (habit = null) => {
    setSelectedHabit(habit || { name: "", description: "", frequency: "Daily" });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedHabit(null);
  };

  return (
    <Box p={4} maxWidth={800} mx="auto">
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>Add Habit</Button>
      
      <Grid container spacing={3} mt={2}>
        {habits.map((habit) => (
          <Grid item xs={12} sm={6} key={habit._id}>
            <Card sx={{ display: "flex", flexDirection: "column", p: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{habit.name}</Typography>
                <Typography color="textSecondary">{habit.description}</Typography>
                <Typography fontSize="14px" color="gray">{habit.frequency}</Typography>
              </CardContent>
              <Box display="flex" justifyContent="space-between" p={2}>
                <Button variant="outlined" color="info" onClick={() => handleOpen(habit)}>Edit</Button>
                <Button variant="outlined" color="error" onClick={() => handleDeleteHabit(habit._id)}>Delete</Button>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>{selectedHabit?._id ? "Edit Habit" : "Add Habit"}</DialogTitle>
        <DialogContent>
          <TextField fullWidth margin="dense" label="Habit Name" value={selectedHabit?.name} 
            onChange={(e) => setSelectedHabit({ ...selectedHabit, name: e.target.value })} />
          <TextField fullWidth margin="dense" label="Description" multiline rows={2} value={selectedHabit?.description} 
            onChange={(e) => setSelectedHabit({ ...selectedHabit, description: e.target.value })} />
          <TextField fullWidth select margin="dense" label="Frequency" value={selectedHabit?.frequency} 
            onChange={(e) => setSelectedHabit({ ...selectedHabit, frequency: e.target.value })}>
            {['Daily', 'Weekly', 'Monthly'].map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="info">Cancel</Button>
          <Button onClick={handleSaveHabit} color="primary" variant="contained">
            {selectedHabit?._id ? "Save" : "Add Habit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HabitTracker;
