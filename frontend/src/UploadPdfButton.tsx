import React from 'react';
import { Button, FileButton, Group } from '@mantine/core';

export type UploadPdfButtonProps = {
  uploading: boolean;
  file: File | null;
  setFile: (file: File | null) => void;
  handleUpload: () => void;
};


const UploadPdfButton: React.FC<UploadPdfButtonProps> = ({ uploading, file, setFile, handleUpload }) => {
  // Use a key that changes when file is cleared to force FileButton to reset
  const fileButtonKey = file ? file.name : Math.random().toString(36);
  return (
    <Group>
      <FileButton key={fileButtonKey} onChange={setFile} accept="application/pdf">
        {(props) => (
          <Button {...props} loading={uploading} variant="outline">
            Upload PDF
          </Button>
        )}
      </FileButton>
      {file && (
        <Button onClick={handleUpload} loading={uploading} color="green">
          Submit PDF
        </Button>
      )}
    </Group>
  );
};

export default UploadPdfButton;
