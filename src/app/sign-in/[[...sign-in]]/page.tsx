import { SignIn } from "@clerk/nextjs";
import { Box } from "@mui/material";

export default function SignInPage() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        padding: 2
      }}
    >
      <SignIn
        appearance={{
          elements: {
            rootBox: {
              boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
            },
            card: {
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
            },
          },
        }}
      />
    </Box>
  );
} 