import React, { useState, useEffect } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";

const HabitModal = ({ open, handleClose, handleSave, habit }) => {
  const [habitData, setHabitData] = useState({
    name: "",
    description: "",
    frequency: "Daily",
  });

  useEffect(() => {
    setHabitData(habit || { name: "", description: "", frequency: "Daily" });
  }, [habit]);

  const handleChange = (e) => {
    setHabitData({ ...habitData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    if (!habitData.name.trim()) return alert("Habit name is required");
    handleSave(habitData);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>{habit ? "Edit Habit" : "Add Habit"}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          margin="dense"
          label="Habit Name"
          name="name"
          value={habitData.name}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          margin="dense"
          label="Description"
          name="description"
          multiline
          rows={2}
          value={habitData.description}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          select
          margin="dense"
          label="Frequency"
          name="frequency"
          value={habitData.frequency}
          onChange={handleChange}
        >
          <MenuItem value="Daily">Daily</MenuItem>
          <MenuItem value="Weekly">Weekly</MenuItem>
          <MenuItem value="Monthly">Monthly</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Cancel</Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          {habit ? "Save Changes" : "Add Habit"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HabitModal;