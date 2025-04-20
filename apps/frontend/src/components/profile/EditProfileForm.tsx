import React, { useState, useEffect } from "react";
import { Input, Button, Spin, message } from "antd"; // Removed FormLabel
import { User } from "@/contexts/AuthContext"; // Import User type

/**
 * @description Interface for the Edit Profile form values.
 */
export interface EditProfileFormValues {
  username: string;
  // Add other editable fields like phone, address placeholders if desired
}

/**
 * @description Props for the EditProfileForm component.
 */
interface EditProfileFormProps {
  initialUserData: Partial<User>; // Pass current user data
  onFinish: (values: EditProfileFormValues) => Promise<void> | void;
  isLoading?: boolean;
  // formInstance prop no longer needed
}

/**
 * @description Form component for editing basic user profile information using useState.
 * @param {EditProfileFormProps} props Component props.
 * @returns {React.FC<EditProfileFormProps>} The EditProfileForm component.
 */
const EditProfileForm: React.FC<EditProfileFormProps> = ({
  initialUserData,
  onFinish,
  isLoading = false,
}) => {
  const [username, setUsername] = useState<string>("");
  // Add state for other fields if needed

  // Set initial values when component mounts or initialUserData changes
  useEffect(() => {
    setUsername(initialUserData.username || "");
    // Set other fields if they exist
  }, [initialUserData]);

  /**
   * @description Handles the submission attempt.
   */
  const handleSubmit = () => {
    // Basic validation
    if (!username.trim()) {
      message.error("Username cannot be empty.");
      return;
    }

    const values: EditProfileFormValues = {
      username: username.trim(),
      // Add other state values
    };
    onFinish(values);
  };

  return (
    // Use a simple div or fragment instead of Form
    <div>
      <div style={{ marginBottom: "8px" }}>
        <label htmlFor="edit-profile-username">Username:</label>
      </div>
      <Input
        id="edit-profile-username"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={{ marginBottom: "16px" }} // Add some spacing
      />

      {/* Placeholder for Phone Number */}
      {/* 
       <div style={{ marginBottom: '8px' }}><label htmlFor="edit-profile-phone">Phone:</label></div>
       <Input id="edit-profile-phone" placeholder="Enter phone number" />
       */}

      {/* Submit button needs to be explicitly added if needed within this component */}
      {/* Usually triggered by parent (Modal footer) */}
      {/* 
       <Button type="primary" onClick={handleSubmit} loading={isLoading}>
         Save Changes
       </Button>
       */}
    </div>
  );
};

export default EditProfileForm;
