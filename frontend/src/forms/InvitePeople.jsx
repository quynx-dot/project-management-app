/* eslint-disable react/prop-types */
import { SearchRounded } from "@mui/icons-material";
import { Box, TextField, Typography } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useState } from "react";
import TeamMateCard from "../components/TeamMateCard";

export default function InvitePeople({ TeamMembers, setTeamMembers }) {
  // 1. This component now only manages UI state (the input field).
  const [inviteEmail, setInviteEmail] = useState("");
  
  // 2. We will get isLoading, error, and the fetchUser function from props.
  // This makes the component reusable and separates concerns.
  
  // This is a placeholder for the props we will receive.
  const { isLoading, error, fetchUser } = { isLoading: false, error: null, fetchUser: () => {} };


  const handleRemoveTeamMate = (email) => {
    setTeamMembers((state) => state.filter((e) => e.email !== email));
  };

  const handleSearchClick = () => {
    // We call the function passed down from the parent component.
    fetchUser(inviteEmail);
    setInviteEmail(""); // Clear input after search
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ width: "100%", display: "flex", gap: 2 }}>
        <TextField
          fullWidth
          size="small"
          label="Invite Team Members by Email"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          onKeyDown={(e) => {
             if (e.key === 'Enter') {
                e.preventDefault();
                handleSearchClick();
             }
          }}
        />
        <LoadingButton
          variant="outlined"
          onClick={handleSearchClick}
          loading={isLoading} // Use isLoading from props
        >
          <SearchRounded />
        </LoadingButton>
      </Box>
      
      {/* Display the error message from the parent component's API call */}
      {error && <Typography color="error" variant="caption" sx={{ mt: 1 }}>{error}</Typography>}

      <Box
        sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 1, mt: 2 }}
      >
        {TeamMembers.map((user) => (
          <TeamMateCard
            user={user}
            key={user.email}
            handleRemoveTeamMate={handleRemoveTeamMate}
          />
        ))}
      </Box>
    </Box>
  );
}